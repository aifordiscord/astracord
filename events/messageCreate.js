const config = require('../config.js');
const logger = require('../utils/logger.js');

module.exports = {
    name: 'messageCreate',
    
    async execute(message) {
        // Ignore messages from bots
        if (message.author.bot) return;
        
        // Check if message starts with prefix
        if (!message.content.startsWith(config.prefix)) return;
        
        // Parse command and arguments
        const args = message.content.slice(config.prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        
        // For this advanced bot, we'll focus on slash commands
        // But we can add a simple prefix command to direct users to slash commands
        if (commandName === 'help') {
            try {
                const response = `👋 Hey ${message.author.username}!\n\n` +
                    `This bot uses **Slash Commands** for better functionality!\n` +
                    `Please use \`/help\` instead of \`${config.prefix}help\`\n\n` +
                    `✨ **Why Slash Commands?**\n` +
                    `• Auto-completion and validation\n` +
                    `• Better user experience\n` +
                    `• Enhanced security\n` +
                    `• Rich interaction features\n\n` +
                    `Type \`/\` and see all available commands!`;
                
                await message.reply(response);
                
                logger.info(`Redirected ${message.author.username} from prefix to slash commands`);
                
            } catch (error) {
                logger.error('Error responding to prefix help command:', error);
            }
        } else if (commandName) {
            // For any other prefix command, redirect to slash commands
            try {
                const response = `🔄 **Command Update**\n\n` +
                    `The command \`${config.prefix}${commandName}\` is now available as a slash command!\n` +
                    `Try using \`/${commandName}\` instead.\n\n` +
                    `Use \`/help\` to see all available commands with their descriptions and options.`;
                
                await message.reply(response);
                
                logger.info(`Redirected ${message.author.username} from prefix command ${commandName} to slash commands`);
                
            } catch (error) {
                logger.error('Error responding to prefix command:', error);
            }
        }
    }
};
