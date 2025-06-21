const { SlashCommandBuilder } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rps')
        .setDescription('Play Rock, Paper, Scissors with the bot')
        .addStringOption(option =>
            option.setName('choice')
                .setDescription('Your choice')
                .setRequired(true)
                .addChoices(
                    { name: '🪨 Rock', value: 'rock' },
                    { name: '📄 Paper', value: 'paper' },
                    { name: '✂️ Scissors', value: 'scissors' }
                )
        ),

    usage: '/rps <choice>',
    cooldown: 2000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        const userChoice = interaction.options.getString('choice');
        const choices = ['rock', 'paper', 'scissors'];
        const botChoice = choices[Math.floor(Math.random() * choices.length)];

        // Emoji mapping
        const emojiMap = {
            rock: '🪨',
            paper: '📄',
            scissors: '✂️'
        };

        // Determine winner
        function determineWinner(user, bot) {
            if (user === bot) return 'tie';
            
            const winConditions = {
                rock: 'scissors',
                paper: 'rock',
                scissors: 'paper'
            };
            
            return winConditions[user] === bot ? 'win' : 'lose';
        }

        const result = determineWinner(userChoice, botChoice);

        // Create result embed
        let resultEmbed;
        let resultTitle;
        let resultDescription;

        switch (result) {
            case 'win':
                resultTitle = `${embedBuilder.addEmoji('right')} You Win!`;
                resultDescription = 'Congratulations! You beat the bot!';
                resultEmbed = embedBuilder.createSuccessEmbed(resultTitle, resultDescription);
                break;
            case 'lose':
                resultTitle = '❌ You Lose!';
                resultDescription = 'Better luck next time!';
                resultEmbed = embedBuilder.createErrorEmbed(resultTitle, resultDescription);
                break;
            case 'tie':
                resultTitle = '🤝 It\'s a Tie!';
                resultDescription = 'Great minds think alike!';
                resultEmbed = embedBuilder.createInfoEmbed(resultTitle, resultDescription);
                break;
        }

        resultEmbed.addFields(
            {
                name: `${embedBuilder.addEmoji('games')} Game Results`,
                value: '\u200b',
                inline: false
            },
            {
                name: '👤 Your Choice',
                value: `${emojiMap[userChoice]} ${userChoice.charAt(0).toUpperCase() + userChoice.slice(1)}`,
                inline: true
            },
            {
                name: '🤖 Bot Choice',
                value: `${emojiMap[botChoice]} ${botChoice.charAt(0).toUpperCase() + botChoice.slice(1)}`,
                inline: true
            },
            {
                name: '📊 Result',
                value: result === 'win' ? 'Victory!' : result === 'lose' ? 'Defeat!' : 'Draw!',
                inline: true
            }
        );

        // Add some fun facts
        const facts = [
            'Rock crushes Scissors',
            'Paper covers Rock',
            'Scissors cut Paper',
            'Did you know? Rock Paper Scissors originated in China!',
            'This game is called "Jan-ken" in Japan',
            'The World RPS Championship is held annually!'
        ];

        const randomFact = facts[Math.floor(Math.random() * facts.length)];
        
        resultEmbed.addFields({
            name: '💡 Fun Fact',
            value: randomFact,
            inline: false
        });

        resultEmbed.setFooter({
            text: `Requested by ${interaction.user.username} • Play again anytime!`,
            iconURL: interaction.user.displayAvatarURL()
        });

        await interaction.reply({ embeds: [resultEmbed] });
    }
};
