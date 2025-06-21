const { SlashCommandBuilder } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('numberguess')
        .setDescription('Guess the secret number game')
        .addIntegerOption(option =>
            option.setName('guess')
                .setDescription('Your guess (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)
        )
        .addIntegerOption(option =>
            option.setName('range')
                .setDescription('Maximum number (default: 100)')
                .setRequired(false)
                .setMinValue(10)
                .setMaxValue(1000)
        ),

    usage: '/numberguess <guess> [range]',
    cooldown: 2000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        const guess = interaction.options.getInteger('guess');
        const maxRange = interaction.options.getInteger('range') || 100;
        
        if (guess > maxRange) {
            const errorEmbed = embedBuilder.createErrorEmbed(
                'Invalid Guess',
                `Your guess must be between 1 and ${maxRange}.`
            );
            return interaction.reply({ embeds: [errorEmbed], flags: 64 });
        }

        const secretNumber = Math.floor(Math.random() * maxRange) + 1;
        const difference = Math.abs(guess - secretNumber);

        let title, description, color, hint;

        if (guess === secretNumber) {
            title = 'Perfect Guess!';
            description = `You got it exactly right! The number was **${secretNumber}**.`;
            color = 'success';
            hint = 'Amazing intuition!';
        } else if (difference <= 5) {
            title = 'Very Close!';
            description = `You were very close! The number was **${secretNumber}**.`;
            color = 'warning';
            hint = guess < secretNumber ? 'You were just a bit low' : 'You were just a bit high';
        } else if (difference <= 15) {
            title = 'Close!';
            description = `Getting warmer! The number was **${secretNumber}**.`;
            color = 'info';
            hint = guess < secretNumber ? 'Try guessing higher' : 'Try guessing lower';
        } else {
            title = 'Not Quite!';
            description = `The number was **${secretNumber}**.`;
            color = 'error';
            hint = guess < secretNumber ? 'Your guess was too low' : 'Your guess was too high';
        }

        const resultEmbed = color === 'success' ? 
            embedBuilder.createSuccessEmbed(title, `${embedBuilder.addEmoji('games')} ${description}`) :
            color === 'warning' ?
            embedBuilder.createInfoEmbed(title, `${embedBuilder.addEmoji('games')} ${description}`) :
            color === 'info' ?
            embedBuilder.createInfoEmbed(title, `${embedBuilder.addEmoji('games')} ${description}`) :
            embedBuilder.createErrorEmbed(title, description);

        resultEmbed.addFields(
            {
                name: '🎯 Your Guess',
                value: `${guess}`,
                inline: true
            },
            {
                name: '🎲 Secret Number',
                value: `${secretNumber}`,
                inline: true
            },
            {
                name: '📊 Difference',
                value: `${difference}`,
                inline: true
            },
            {
                name: '💡 Hint for Next Time',
                value: hint,
                inline: false
            }
        );

        resultEmbed.setFooter({
            text: `Range: 1-${maxRange} • Played by ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL()
        });

        await interaction.reply({ embeds: [resultEmbed] });
    }
};