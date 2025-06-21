const { SlashCommandBuilder } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');
const paginationHandler = require('../../utils/pagination.js');
const config = require('../../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Display help information for commands')
        .addStringOption(option =>
            option.setName('command')
                .setDescription('Get detailed help for a specific command')
                .setRequired(false)
        ),

    usage: '/help [command]',

    async execute(interaction) {
        const commandName = interaction.options.getString('command');
        const embedBuilder = new CustomEmbedBuilder();

        // If specific command is requested
        if (commandName) {
            const command = interaction.client.commands.get(commandName.toLowerCase());
            
            if (!command) {
                const errorEmbed = embedBuilder.createErrorEmbed(
                    'Command Not Found',
                    `The command \`${commandName}\` does not exist.`
                );
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            // Create detailed command help embed
            const helpEmbed = embedBuilder.createInfoEmbed(
                `Command: /${command.data.name}`,
                command.data.description
            );

            if (command.usage) {
                helpEmbed.addFields({
                    name: `${embedBuilder.addEmoji('info')} Usage`,
                    value: `\`${command.usage}\``,
                    inline: false
                });
            }

            if (command.data.options && command.data.options.length > 0) {
                const options = command.data.options.map(option => {
                    const required = option.required ? '**[Required]**' : '*[Optional]*';
                    return `**${option.name}** ${required} - ${option.description}`;
                }).join('\n');

                helpEmbed.addFields({
                    name: `${embedBuilder.addEmoji('slash')} Options`,
                    value: options,
                    inline: false
                });
            }

            helpEmbed.addFields({
                name: `${embedBuilder.addEmoji('info')} Category`,
                value: config.categories[command.category]?.name || 'Unknown',
                inline: true
            });

            if (command.cooldown) {
                helpEmbed.addFields({
                    name: '⏱️ Cooldown',
                    value: `${command.cooldown / 1000} seconds`,
                    inline: true
                });
            }

            helpEmbed.setFooter({
                text: `Use /help to see all commands`,
                iconURL: interaction.client.user.displayAvatarURL()
            });

            return interaction.reply({ embeds: [helpEmbed] });
        }

        // Main help menu
        const mainEmbed = embedBuilder.createMainHelpEmbed(interaction.client);
        const categoryButtons = paginationHandler.createCategoryButtons();

        // Store pagination data
        paginationHandler.createPaginationData(
            interaction.user.id,
            'main',
            1,
            1,
            []
        );

        await interaction.reply({
            embeds: [mainEmbed],
            components: categoryButtons
        });
    }
};
