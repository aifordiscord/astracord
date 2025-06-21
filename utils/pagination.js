const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const emojis = require('../data/emojis.json');

class PaginationHandler {
    constructor() {
        this.activePaginations = new Map();
    }

    createNavigationButtons(currentPage, totalPages, disabled = false) {
        const row = new ActionRowBuilder();

        // Home button
        row.addComponents(
            new ButtonBuilder()
                .setCustomId('help_home')
                .setEmoji(emojis.home.match(/:(\d+)>/)?.[1] || '🏠')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(disabled)
        );

        // Previous button
        row.addComponents(
            new ButtonBuilder()
                .setCustomId('help_previous')
                .setEmoji(emojis.arrowleft.match(/:(\d+)>/)?.[1] || '⬅️')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(disabled || currentPage <= 1)
        );

        // Next button
        row.addComponents(
            new ButtonBuilder()
                .setCustomId('help_next')
                .setEmoji(emojis.arrow_right.match(/:(\d+)>/)?.[1] || '➡️')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(disabled || currentPage >= totalPages)
        );

        return row;
    }

    createCategoryButtons(disabled = false) {
        const rows = [];
        const config = require('../config.js');
        
        // First row
        const row1 = new ActionRowBuilder();
        
        row1.addComponents(
            new ButtonBuilder()
                .setCustomId('help_category_general')
                .setEmoji(emojis.info.match(/:(\d+)>/)?.[1] || 'ℹ️')
                .setLabel('General')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(disabled)
        );

        row1.addComponents(
            new ButtonBuilder()
                .setCustomId('help_category_moderation')
                .setEmoji(emojis.moderation.match(/:(\d+)>/)?.[1] || '🛡️')
                .setLabel('Moderation')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(disabled)
        );

        row1.addComponents(
            new ButtonBuilder()
                .setCustomId('help_category_fun')
                .setEmoji(emojis.fun.match(/:(\d+)>/)?.[1] || '🎉')
                .setLabel('Fun')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(disabled)
        );

        rows.push(row1);

        // Second row
        const row2 = new ActionRowBuilder();

        row2.addComponents(
            new ButtonBuilder()
                .setCustomId('help_category_games')
                .setEmoji(emojis.games.match(/:(\d+)>/)?.[1] || '🎮')
                .setLabel('Games')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(disabled)
        );

        rows.push(row2);

        return rows;
    }

    createLinkButtonsRow() {
        const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
        const config = require('../config.js');
        const emojis = require('../data/emojis.json');
        
        return new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Support Server')
                    .setEmoji(emojis.invite.match(/:(\d+)>/)?.[1] || '🔗')
                    .setStyle(ButtonStyle.Link)
                    .setURL(config.links.support),
                new ButtonBuilder()
                    .setLabel('GitHub Source')
                    .setEmoji(emojis.js.match(/:(\d+)>/)?.[1] || '📝')
                    .setStyle(ButtonStyle.Link)
                    .setURL(config.links.github),
                new ButtonBuilder()
                    .setLabel('Bot Invite')
                    .setEmoji(emojis.link.match(/:(\d+)>/)?.[1] || '🤖')
                    .setStyle(ButtonStyle.Link)
                    .setURL(config.links.invite),
                new ButtonBuilder()
                    .setLabel('Website')
                    .setEmoji(emojis.astracord.match(/:(\d+)>/)?.[1] || '🌐')
                    .setStyle(ButtonStyle.Link)
                    .setURL(config.links.website)
            );
    }

    createPaginationData(userId, category, currentPage, totalPages, commands) {
        const data = {
            userId,
            category,
            currentPage,
            totalPages,
            commands,
            timestamp: Date.now()
        };

        this.activePaginations.set(userId, data);
        
        // Auto-cleanup after 5 minutes
        setTimeout(() => {
            this.activePaginations.delete(userId);
        }, 5 * 60 * 1000);

        return data;
    }

    getPaginationData(userId) {
        return this.activePaginations.get(userId);
    }

    updatePaginationData(userId, updates) {
        const currentData = this.activePaginations.get(userId);
        if (currentData) {
            Object.assign(currentData, updates);
            this.activePaginations.set(userId, currentData);
        }
    }

    deletePaginationData(userId) {
        this.activePaginations.delete(userId);
    }

    paginateArray(array, page, itemsPerPage) {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return array.slice(startIndex, endIndex);
    }

    getTotalPages(arrayLength, itemsPerPage) {
        return Math.ceil(arrayLength / itemsPerPage) || 1;
    }
}

module.exports = new PaginationHandler();
