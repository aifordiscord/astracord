const { SlashCommandBuilder } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mathquiz')
        .setDescription('Test your math skills with a random problem')
        .addStringOption(option =>
            option.setName('difficulty')
                .setDescription('Choose difficulty level')
                .setRequired(false)
                .addChoices(
                    { name: 'Easy', value: 'easy' },
                    { name: 'Medium', value: 'medium' },
                    { name: 'Hard', value: 'hard' }
                )
        ),

    usage: '/mathquiz [difficulty]',
    cooldown: 3000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        const difficulty = interaction.options.getString('difficulty') || 'medium';

        function generateProblem() {
            let num1, num2, operation, answer, question;
            
            switch (difficulty) {
                case 'easy':
                    num1 = Math.floor(Math.random() * 20) + 1;
                    num2 = Math.floor(Math.random() * 20) + 1;
                    operation = ['+', '-'][Math.floor(Math.random() * 2)];
                    break;
                case 'medium':
                    num1 = Math.floor(Math.random() * 50) + 1;
                    num2 = Math.floor(Math.random() * 20) + 1;
                    operation = ['+', '-', '*'][Math.floor(Math.random() * 3)];
                    break;
                case 'hard':
                    num1 = Math.floor(Math.random() * 100) + 1;
                    num2 = Math.floor(Math.random() * 50) + 1;
                    operation = ['+', '-', '*', '/'][Math.floor(Math.random() * 4)];
                    if (operation === '/' && num1 % num2 !== 0) {
                        num1 = num2 * Math.floor(Math.random() * 10) + num2;
                    }
                    break;
            }

            switch (operation) {
                case '+': answer = num1 + num2; break;
                case '-': answer = num1 - num2; break;
                case '*': answer = num1 * num2; break;
                case '/': answer = num1 / num2; break;
            }

            question = `${num1} ${operation} ${num2}`;
            return { question, answer };
        }

        const problem = generateProblem();

        const mathEmbed = embedBuilder.createInfoEmbed(
            `${embedBuilder.addEmoji('games')} Math Quiz`,
            `Solve this ${difficulty} problem:`
        );

        mathEmbed.addFields(
            {
                name: '📊 Problem',
                value: `**${problem.question} = ?**`,
                inline: false
            },
            {
                name: '📚 Difficulty',
                value: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
                inline: true
            },
            {
                name: '⏱️ Think Fast!',
                value: 'Answer will be revealed in 15 seconds',
                inline: true
            }
        );

        mathEmbed.setFooter({
            text: `Math quiz for ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL()
        });

        await interaction.reply({ embeds: [mathEmbed] });

        setTimeout(async () => {
            try {
                const answerEmbed = embedBuilder.createSuccessEmbed(
                    'Answer Revealed!',
                    `**${problem.question} = ${problem.answer}**`
                );
                
                answerEmbed.addFields({
                    name: '🧮 Solution',
                    value: `The correct answer is **${problem.answer}**`,
                    inline: false
                });

                await interaction.followUp({ embeds: [answerEmbed] });
            } catch (error) {
                // Interaction expired
            }
        }, 15000);
    }
};