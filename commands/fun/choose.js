const { SlashCommandBuilder } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('choose')
        .setDescription('Let the bot choose between multiple options')
        .addStringOption(option =>
            option.setName('options')
                .setDescription('Separate options with commas (e.g., pizza, burger, sushi)')
                .setRequired(true)
                .setMaxLength(500)
        ),

    usage: '/choose <options>',
    cooldown: 2000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        const optionsString = interaction.options.getString('options');
        
        const options = optionsString.split(',').map(option => option.trim()).filter(option => option.length > 0);
        
        if (options.length < 2) {
            const errorEmbed = embedBuilder.createErrorEmbed(
                'Invalid Options',
                'Please provide at least 2 options separated by commas.'
            );
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        const chosenOption = options[Math.floor(Math.random() * options.length)];

        const chooseEmbed = embedBuilder.createInfoEmbed(
            `${embedBuilder.addEmoji('fun')} Decision Made!`,
            `I choose: **${chosenOption}**`
        );

        chooseEmbed.addFields(
            {
                name: '🎯 Selected Option',
                value: chosenOption,
                inline: true
            },
            {
                name: '📝 Total Options',
                value: `${options.length}`,
                inline: true
            },
            {
                name: '📋 All Options',
                value: options.join(', '),
                inline: false
            }
        );

        chooseEmbed.setFooter({
            text: `Decision for ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL()
        });

        await interaction.reply({ embeds: [chooseEmbed] });
    }
};