const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger.js');

function loadCommands(client) {
    const commandsPath = path.join(__dirname, '../commands');
    
    if (!fs.existsSync(commandsPath)) {
        logger.error('Commands directory not found!');
        return;
    }

    const commandFolders = fs.readdirSync(commandsPath);

    for (const folder of commandFolders) {
        const folderPath = path.join(commandsPath, folder);
        
        if (!fs.lstatSync(folderPath).isDirectory()) continue;

        const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(folderPath, file);
            
            try {
                const command = require(filePath);
                
                // Validate command structure
                if (!command.data || !command.execute) {
                    logger.warning(`Command at ${filePath} is missing required properties`);
                    continue;
                }

                // Set command category based on folder name
                command.category = folder;

                // Set the command in the collection
                client.commands.set(command.data.name, command);
                logger.info(`Loaded command: ${command.data.name}`);
                
            } catch (error) {
                logger.error(`Error loading command at ${filePath}:`, error);
            }
        }
    }

    logger.info(`Successfully loaded ${client.commands.size} commands`);
}

function reloadCommand(client, commandName) {
    try {
        // Find the command
        const command = client.commands.get(commandName);
        if (!command) {
            return { success: false, message: 'Command not found' };
        }

        // Get the file path
        const commandsPath = path.join(__dirname, '../commands');
        const filePath = path.join(commandsPath, command.category, `${commandName}.js`);

        // Delete from require cache
        delete require.cache[require.resolve(filePath)];

        // Reload the command
        const newCommand = require(filePath);
        newCommand.category = command.category;

        // Update in collection
        client.commands.set(commandName, newCommand);

        return { success: true, message: `Command ${commandName} reloaded successfully` };
    } catch (error) {
        logger.error(`Error reloading command ${commandName}:`, error);
        return { success: false, message: error.message };
    }
}

module.exports = {
    loadCommands,
    reloadCommand
};
