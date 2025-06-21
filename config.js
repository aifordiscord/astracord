const { ActivityType } = require('discord.js');

module.exports = {
    // Bot configuration
    token: process.env.DISCORD_TOKEN || 'your_bot_token_here',
    clientId: process.env.CLIENT_ID || 'your_client_id_here',
    guildId: process.env.GUILD_ID || null, // Leave null for global commands
    
    // Bot settings
    prefix: '!',
    ownerIds: process.env.OWNER_IDS ? process.env.OWNER_IDS.split(',') : ['your_user_id_here'],
    
    // Bot activity
    activity: {
        name: 'with advanced commands!',
        type: ActivityType.Playing
    },
    
    // Command settings
    defaultCooldown: 3000, // 3 seconds
    maxCommandsPerPage: 5,
    
    // Colors for embeds
    colors: {
        primary: '#5865F2',
        success: '#57F287',
        warning: '#FEE75C',
        error: '#ED4245',
        info: '#5865F2'
    },
    
    // Command categories
    categories: {
        general: {
            name: 'General',
            emoji: 'info',
            description: 'General utility commands'
        },
        moderation: {
            name: 'Moderation',
            emoji: 'moderation',
            description: 'Server moderation commands'
        },
        fun: {
            name: 'Fun',
            emoji: 'fun',
            description: 'Entertainment and fun commands'
        },
        games: {
            name: 'Games',
            emoji: 'games',
            description: 'Interactive game commands'
        },
        voice: {
            name: 'Voice',
            emoji: 'voice',
            description: 'Voice channel commands'
        }
    }
};
