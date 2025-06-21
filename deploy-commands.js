const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config.js');
const logger = require('./utils/logger.js');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');

// Function to recursively load command files
function loadCommandFiles(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.lstatSync(filePath);
        
        if (stat.isDirectory()) {
            loadCommandFiles(filePath);
        } else if (file.endsWith('.js')) {
            try {
                const command = require(filePath);
                
                if (!command.data || !command.execute) {
                    logger.warning(`Command at ${filePath} is missing required properties`);
                    continue;
                }
                
                commands.push(command.data.toJSON());
                logger.info(`Loaded command for deployment: ${command.data.name}`);
                
            } catch (error) {
                logger.error(`Error loading command at ${filePath}:`, error);
            }
        }
    }
}

// Load all commands
if (fs.existsSync(commandsPath)) {
    loadCommandFiles(commandsPath);
} else {
    logger.error('Commands directory not found!');
    process.exit(1);
}

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(config.token);

// Deploy commands
(async () => {
    try {
        logger.info(`Started refreshing ${commands.length} application (/) commands.`);

        let data;
        
        if (config.guildId) {
            // Deploy to specific guild (faster for development)
            data = await rest.put(
                Routes.applicationGuildCommands(config.clientId, config.guildId),
                { body: commands }
            );
            logger.info(`Successfully reloaded ${data.length} guild application (/) commands for guild ${config.guildId}.`);
        } else {
            // Deploy globally (takes up to 1 hour to propagate)
            data = await rest.put(
                Routes.applicationCommands(config.clientId),
                { body: commands }
            );
            logger.info(`Successfully reloaded ${data.length} global application (/) commands.`);
        }

        // Log deployed commands
        logger.info('Deployed commands:');
        data.forEach(command => {
            logger.info(`  - /${command.name}: ${command.description}`);
        });

    } catch (error) {
        logger.error('Error deploying commands:', error);
        
        if (error.code === 50001) {
            logger.error('Missing Access: Make sure the bot has the applications.commands scope');
        } else if (error.code === 10062) {
            logger.error('Unknown interaction: The interaction may have expired');
        } else if (error.rawError?.message) {
            logger.error('API Error:', error.rawError.message);
        }
        
        process.exit(1);
    }
})();
