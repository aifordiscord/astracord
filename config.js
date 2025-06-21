const { ActivityType } = require('discord.js');

module.exports = {
    // AstraCord Bot configuration
    botName: 'AstraCord',
    version: '1.0.0',
    author: 'AiForDiscord',
    
    // Links and branding
    links: {
        github: 'https://github.com/aifordiscord/astracord',
        support: 'https://dsc.gg/aifordiscord',
        invite: 'https://dsc.gg/astracord',
        website: 'https://aifordiscord.com'
    },
    
    token: process.env.DISCORD_TOKEN || 'your_bot_token_here',
    clientId: process.env.CLIENT_ID || 'your_client_id_here',
    guildId: process.env.GUILD_ID || null, // Leave null for global commands
    
    // Bot settings
    prefix: '!',
    ownerIds: process.env.OWNER_IDS ? process.env.OWNER_IDS.split(',') : ['your_user_id_here'],
    
    // Bot activity
    activity: {
        name: 'Made by aifordiscord!',
        type: ActivityType.Playing
    },
    
    // Command settings
    defaultCooldown: 3000, // 3 seconds
    maxCommandsPerPage: 5,
    
    // Colors for embeds
    colors: {
        primary: '#4A90E2',
        success: '#57F287',
        warning: '#FEE75C',
        error: '#ED4245',
        info: '#4A90E2'
    },
    
    // Development credits
    credits: {
        ai_assistance: [
            'ChatGPT-4o - Core architecture and command development',
            'DeepSeek - Advanced algorithm implementation', 
            'Claude - Code optimization and documentation',
            'Replit Agent - Error resolution and debugging'
        ],
        description: 'This bot was developed using collaborative AI assistance for robust, feature-rich functionality.'
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
        }
    }
};
