const config = require('../config.js');
const logger = require('../utils/logger.js');

module.exports = {
    name: 'ready',
    once: true,
    
    async execute(client) {
        logger.info(`Bot is ready! Logged in as ${client.user.tag}`);
        logger.info(`Serving ${client.guilds.cache.size} guild(s) with ${client.users.cache.size} user(s)`);
        
        // Set bot activity
        try {
            await client.user.setActivity(config.activity.name, { 
                type: config.activity.type 
            });
            logger.info(`Activity set: ${config.activity.name}`);
        } catch (error) {
            logger.error('Failed to set activity:', error);
        }

        // Log command statistics
        const commandStats = {};
        client.commands.forEach(command => {
            const category = command.category || 'unknown';
            commandStats[category] = (commandStats[category] || 0) + 1;
        });

        logger.info('Command statistics:');
        Object.entries(commandStats).forEach(([category, count]) => {
            logger.info(`  ${category}: ${count} command(s)`);
        });

        // Set bot status
        try {
            await client.user.setStatus('online');
            logger.info('Bot status set to online');
        } catch (error) {
            logger.error('Failed to set status:', error);
        }

        logger.info('Bot initialization completed successfully');
    }
};
