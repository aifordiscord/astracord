const { SlashCommandBuilder } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Roll dice with customizable sides and quantity')
        .addIntegerOption(option =>
            option.setName('sides')
                .setDescription('Number of sides on the die (default: 6)')
                .setRequired(false)
                .setMinValue(2)
                .setMaxValue(100)
        )
        .addIntegerOption(option =>
            option.setName('count')
                .setDescription('Number of dice to roll (default: 1)')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(20)
        ),

    usage: '/roll [sides] [count]',
    cooldown: 2000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        const sides = interaction.options.getInteger('sides') || 6;
        const count = interaction.options.getInteger('count') || 1;

        const rolls = [];
        let total = 0;

        for (let i = 0; i < count; i++) {
            const roll = Math.floor(Math.random() * sides) + 1;
            rolls.push(roll);
            total += roll;
        }

        const rollEmbed = embedBuilder.createInfoEmbed(
            `${embedBuilder.addEmoji('games')} Dice Roll`,
            `Rolling ${count}d${sides}`
        );

        rollEmbed.addFields(
            {
                name: '🎲 Results',
                value: rolls.join(', '),
                inline: false
            },
            {
                name: '📊 Total',
                value: `${total}`,
                inline: true
            },
            {
                name: '🎯 Average',
                value: `${(total / count).toFixed(1)}`,
                inline: true
            }
        );

        if (count > 1) {
            rollEmbed.addFields({
                name: '📈 Range',
                value: `${Math.min(...rolls)} - ${Math.max(...rolls)}`,
                inline: true
            });
        }

        rollEmbed.setFooter({
            text: `Rolled by ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL()
        });

        await interaction.reply({ embeds: [rollEmbed] });
    }
};