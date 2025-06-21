const { SlashCommandBuilder } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Flip a coin and get heads or tails')
        .addStringOption(option =>
            option.setName('choice')
                .setDescription('Make a prediction (optional)')
                .setRequired(false)
                .addChoices(
                    { name: 'Heads', value: 'heads' },
                    { name: 'Tails', value: 'tails' }
                )
        ),

    usage: '/coinflip [choice]',
    cooldown: 2000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        const userChoice = interaction.options.getString('choice');
        
        const result = Math.random() < 0.5 ? 'heads' : 'tails';
        const emoji = result === 'heads' ? '🟡' : '🥈';
        
        let title, description, color;
        
        if (userChoice) {
            const correct = userChoice === result;
            title = correct ? 'Correct Prediction!' : 'Wrong Prediction!';
            description = `You predicted **${userChoice}** and the coin landed on **${result}**`;
            color = correct ? 'success' : 'error';
        } else {
            title = 'Coin Flip Result';
            description = `The coin landed on **${result}**`;
            color = 'info';
        }

        const flipEmbed = color === 'success' ? 
            embedBuilder.createSuccessEmbed(title, `${embedBuilder.addEmoji('fun')} ${description}`) :
            color === 'error' ?
            embedBuilder.createErrorEmbed(title, `${emoji} ${description}`) :
            embedBuilder.createInfoEmbed(title, `${emoji} ${description}`);

        flipEmbed.addFields({
            name: `${emoji} Result`,
            value: result.charAt(0).toUpperCase() + result.slice(1),
            inline: true
        });

        if (userChoice) {
            flipEmbed.addFields({
                name: '🎯 Your Prediction',
                value: userChoice.charAt(0).toUpperCase() + userChoice.slice(1),
                inline: true
            });
        }

        flipEmbed.setFooter({
            text: `Flipped by ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL()
        });

        await interaction.reply({ embeds: [flipEmbed] });
    }
};