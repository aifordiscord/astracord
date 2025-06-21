const { EmbedBuilder } = require('discord.js');
const config = require('../config.js');
const emojis = require('../data/emojis.json');

class CustomEmbedBuilder {
    constructor() {
        this.embed = new EmbedBuilder();
    }

    setDefaultFooter(client) {
        this.embed.setFooter({
            text: `${client.user.username} • Advanced Discord Bot`,
            iconURL: client.user.displayAvatarURL()
        });
        return this;
    }

    setTimestamp() {
        this.embed.setTimestamp();
        return this;
    }

    setSuccessColor() {
        this.embed.setColor(config.colors.success);
        return this;
    }

    setErrorColor() {
        this.embed.setColor(config.colors.error);
        return this;
    }

    setInfoColor() {
        this.embed.setColor(config.colors.info);
        return this;
    }

    setWarningColor() {
        this.embed.setColor(config.colors.warning);
        return this;
    }

    setPrimaryColor() {
        this.embed.setColor(config.colors.primary);
        return this;
    }

    addEmoji(emojiName) {
        return emojis[emojiName] || '';
    }

    createSuccessEmbed(title, description) {
        return new EmbedBuilder()
            .setColor(config.colors.success)
            .setTitle(`${this.addEmoji('right')} ${title}`)
            .setDescription(description)
            .setTimestamp();
    }

    createErrorEmbed(title, description) {
        return new EmbedBuilder()
            .setColor(config.colors.error)
            .setTitle(`❌ ${title}`)
            .setDescription(description)
            .setTimestamp();
    }

    createInfoEmbed(title, description) {
        return new EmbedBuilder()
            .setColor(config.colors.info)
            .setTitle(`${this.addEmoji('info')} ${title}`)
            .setDescription(description)
            .setTimestamp();
    }

    createHelpCategoryEmbed(category, commands, currentPage, totalPages) {
        const categoryInfo = config.categories[category];
        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle(`${this.addEmoji(categoryInfo.emoji)} ${categoryInfo.name} Commands`)
            .setDescription(categoryInfo.description)
            .setTimestamp();

        if (commands.length === 0) {
            embed.addFields({
                name: 'No Commands',
                value: 'No commands available in this category.',
                inline: false
            });
        } else {
            commands.forEach(command => {
                embed.addFields({
                    name: `${this.addEmoji('slash')} /${command.data.name}`,
                    value: `${command.data.description}\n${command.usage ? `**Usage:** \`${command.usage}\`` : ''}`,
                    inline: false
                });
            });
        }

        if (totalPages > 1) {
            embed.setFooter({
                text: `Page ${currentPage}/${totalPages} • Use the buttons to navigate`
            });
        }

        return embed;
    }

    createMainHelpEmbed(client) {
        const embed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle(`${this.addEmoji('astracord')} ${client.user.username} Help Center`)
            .setDescription(`**Welcome to ${client.user.username}!** 🎉\n\nA powerful Discord bot with **${client.commands.size} commands** across multiple categories.\nSelect a category below to explore available commands.`)
            .setThumbnail(client.user.displayAvatarURL())
            .setTimestamp();

        // Add category information in a cleaner format
        const categories = Object.entries(config.categories).map(([key, category]) => {
            const commandCount = client.commands.filter(cmd => cmd.category === key).size;
            return `${this.addEmoji(category.emoji)} **${category.name}** - ${commandCount} commands\n${category.description}`;
        }).join('\n\n');

        embed.addFields(
            {
                name: `📋 Command Categories`,
                value: categories,
                inline: false
            },
            {
                name: `${this.addEmoji('info')} Quick Help`,
                value: `• Use buttons below to browse categories\n• Use \`/help [command]\` for detailed command info\n• All commands use slash (/) syntax`,
                inline: false
            }
        );

        embed.setFooter({
            text: `${config.botName} v${config.version} • Made by ${config.author}`,
            iconURL: client.user.displayAvatarURL({ size: 64 })
        });

        return embed;
    }

    build() {
        return this.embed;
    }
}

module.exports = CustomEmbedBuilder;
