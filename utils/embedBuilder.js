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
            .setTitle(`${this.addEmoji('astracord')} ${client.user.username} Help`)
            .setDescription('Welcome to the advanced help system! Choose a category below to explore commands.')
            .setThumbnail(client.user.displayAvatarURL())
            .setTimestamp();

        // Add category information
        Object.entries(config.categories).forEach(([key, category]) => {
            const commandCount = client.commands.filter(cmd => cmd.category === key).size;
            embed.addFields({
                name: `${this.addEmoji(category.emoji)} ${category.name}`,
                value: `${category.description}\n**Commands:** ${commandCount}`,
                inline: true
            });
        });

        embed.addFields(
            {
                name: `${this.addEmoji('info')} How to Use`,
                value: 'Use the buttons below to navigate through different command categories.',
                inline: false
            },
            {
                name: `${this.addEmoji('link')} Important Links`,
                value: `${this.addEmoji('invite')} [Support Server](${config.links.support})\n${this.addEmoji('js')} [GitHub Source](${config.links.github})\n${this.addEmoji('link')} [Bot Invite](${config.links.invite})\n${this.addEmoji('astracord')} [Website](${config.links.website})`,
                inline: false
            }
        );

        embed.setFooter({
            text: `Total Commands: ${client.commands.size} • Use /help [command] for detailed info`
        });

        return embed;
    }

    build() {
        return this.embed;
    }
}

module.exports = CustomEmbedBuilder;
