const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger.js');

function loadEvents(client) {
    const eventsPath = path.join(__dirname, '../events');
    
    if (!fs.existsSync(eventsPath)) {
        logger.error('Events directory not found!');
        return;
    }

    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        
        try {
            const event = require(filePath);
            
            if (!event.name || !event.execute) {
                logger.warning(`Event at ${filePath} is missing required properties`);
                continue;
            }

            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args));
            } else {
                client.on(event.name, (...args) => event.execute(...args));
            }

            logger.info(`Loaded event: ${event.name}`);
            
        } catch (error) {
            logger.error(`Error loading event at ${filePath}:`, error);
        }
    }
}

module.exports = {
    loadEvents
};
