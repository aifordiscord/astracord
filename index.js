const { Client, GatewayIntentBits, Collection } = require('discord.js');
const config = require('./config.js');
const commandHandler = require('./handlers/commandHandler.js');
const eventHandler = require('./handlers/eventHandler.js');
const logger = require('./utils/logger.js');

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences
    ]
});

// Initialize collections
client.commands = new Collection();
client.cooldowns = new Collection();

// Load handlers
commandHandler.loadCommands(client);
eventHandler.loadEvents(client);

// Handle unhandled promise rejections
process.on('unhandledRejection', error => {
    logger.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', error => {
    logger.error('Uncaught exception:', error);
    process.exit(1);
});

// Login to Discord
client.login(config.token)
    .then(() => {
        logger.info('Bot login initiated successfully');
    })
    .catch(error => {
        logger.error('Failed to login:', error);
        process.exit(1);
    });

module.exports = client;