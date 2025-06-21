const { InteractionType } = require('discord.js');
const config = require('../config.js');
const logger = require('../utils/logger.js');
const CustomEmbedBuilder = require('../utils/embedBuilder.js');
const paginationHandler = require('../utils/pagination.js');

module.exports = {
    name: 'interactionCreate',
    
    async execute(interaction) {
        // Handle slash commands
        if (interaction.type === InteractionType.ApplicationCommand) {
            await handleSlashCommand(interaction);
        }
        
        // Handle button interactions (for help system pagination)
        if (interaction.type === InteractionType.MessageComponent) {
            await handleButtonInteraction(interaction);
        }
    }
};

async function handleSlashCommand(interaction) {
    // Check if interaction is still valid
    if (!interaction.isRepliable()) {
        logger.warning(`Interaction ${interaction.id} is no longer repliable.`);
        return;
    }

    const command = interaction.client.commands.get(interaction.commandName);
    
    if (!command) {
        logger.warning(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    // Check cooldowns
    const { cooldowns } = interaction.client;
    
    if (!cooldowns.has(command.data.name)) {
        cooldowns.set(command.data.name, new Map());
    }
    
    const now = Date.now();
    const timestamps = cooldowns.get(command.data.name);
    const cooldownAmount = command.cooldown || config.defaultCooldown;
    
    if (timestamps.has(interaction.user.id)) {
        const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
        
        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            const embedBuilder = new CustomEmbedBuilder();
            
            const cooldownEmbed = embedBuilder.createErrorEmbed(
                'Command Cooldown',
                `Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.data.name}\` command.`
            );
            
            try {
                return await interaction.reply({ embeds: [cooldownEmbed], flags: 64 });
            } catch (error) {
                logger.error('Failed to send cooldown message:', error);
                return;
            }
        }
    }
    
    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

    // Execute command
    try {
        logger.info(`${interaction.user.username} executed command: ${interaction.commandName} in ${interaction.guild?.name || 'DM'}`);
        await command.execute(interaction);
    } catch (error) {
        logger.error(`Error executing command ${interaction.commandName}:`, error);
        
        const embedBuilder = new CustomEmbedBuilder();
        const errorEmbed = embedBuilder.createErrorEmbed(
            'Command Error',
            'There was an error while executing this command. Please try again later.'
        );

        try {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errorEmbed], flags: 64 });
            } else {
                await interaction.reply({ embeds: [errorEmbed], flags: 64 });
            }
        } catch (replyError) {
            logger.error('Failed to send error message:', replyError);
        }
    }
}

async function handleButtonInteraction(interaction) {
    if (!interaction.customId.startsWith('help_')) return;

    // Check if interaction is still valid
    if (!interaction.isRepliable()) {
        logger.warning(`Button interaction ${interaction.id} is no longer repliable.`);
        return;
    }

    const embedBuilder = new CustomEmbedBuilder();
    const userId = interaction.user.id;
    
    try {
        if (interaction.customId === 'help_home') {
            // Return to main help menu
            const mainEmbed = embedBuilder.createMainHelpEmbed(interaction.client);
            const categoryButtons = paginationHandler.createCategoryButtons();
            
            paginationHandler.updatePaginationData(userId, {
                category: 'main',
                currentPage: 1,
                totalPages: 1
            });

            await interaction.update({
                embeds: [mainEmbed],
                components: categoryButtons
            });
            
        } else if (interaction.customId.startsWith('help_category_')) {
            // Show category commands
            const category = interaction.customId.replace('help_category_', '');
            const commands = interaction.client.commands.filter(cmd => cmd.category === category);
            const commandsArray = Array.from(commands.values());
            
            const totalPages = paginationHandler.getTotalPages(commandsArray.length, config.maxCommandsPerPage);
            const currentPage = 1;
            const paginatedCommands = paginationHandler.paginateArray(commandsArray, currentPage, config.maxCommandsPerPage);
            
            const categoryEmbed = embedBuilder.createHelpCategoryEmbed(category, paginatedCommands, currentPage, totalPages);
            
            // Create navigation components
            const navigationRow = paginationHandler.createNavigationButtons(currentPage, totalPages);
            const categoryButtons = paginationHandler.createCategoryButtons();
            
            paginationHandler.updatePaginationData(userId, {
                category,
                currentPage,
                totalPages,
                commands: commandsArray
            });

            await interaction.update({
                embeds: [categoryEmbed],
                components: [navigationRow, ...categoryButtons]
            });
            
        } else if (interaction.customId === 'help_previous' || interaction.customId === 'help_next') {
            // Handle pagination
            const paginationData = paginationHandler.getPaginationData(userId);
            
            if (!paginationData || paginationData.category === 'main') {
                try {
                    return await interaction.reply({ 
                        content: 'Pagination data not found. Please use the help command again.', 
                        flags: 64
                    });
                } catch (error) {
                    logger.error('Failed to send pagination error message:', error);
                    return;
                }
            }
            
            let newPage = paginationData.currentPage;
            
            if (interaction.customId === 'help_next' && newPage < paginationData.totalPages) {
                newPage++;
            } else if (interaction.customId === 'help_previous' && newPage > 1) {
                newPage--;
            }
            
            const paginatedCommands = paginationHandler.paginateArray(
                paginationData.commands, 
                newPage, 
                config.maxCommandsPerPage
            );
            
            const categoryEmbed = embedBuilder.createHelpCategoryEmbed(
                paginationData.category, 
                paginatedCommands, 
                newPage, 
                paginationData.totalPages
            );
            
            // Update navigation buttons
            const navigationRow = paginationHandler.createNavigationButtons(newPage, paginationData.totalPages);
            const categoryButtons = paginationHandler.createCategoryButtons();
            
            paginationHandler.updatePaginationData(userId, { currentPage: newPage });

            await interaction.update({
                embeds: [categoryEmbed],
                components: [navigationRow, ...categoryButtons]
            });
        }
        
    } catch (error) {
        logger.error('Error handling button interaction:', error);
        
        const errorEmbed = embedBuilder.createErrorEmbed(
            'Interaction Error',
            'An error occurred while processing your request. Please try again.'
        );
        
        try {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errorEmbed], flags: 64 });
            } else {
                await interaction.reply({ embeds: [errorEmbed], flags: 64 });
            }
        } catch (replyError) {
            logger.error('Failed to send button interaction error message:', replyError);
        }
    }
}
