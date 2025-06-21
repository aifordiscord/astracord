const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trivia')
        .setDescription('Play a trivia game with multiple choice questions')
        .addStringOption(option =>
            option.setName('category')
                .setDescription('Choose trivia category')
                .setRequired(false)
                .addChoices(
                    { name: 'General Knowledge', value: 'general' },
                    { name: 'Science', value: 'science' },
                    { name: 'History', value: 'history' },
                    { name: 'Geography', value: 'geography' },
                    { name: 'Entertainment', value: 'entertainment' }
                )
        ),

    usage: '/trivia [category]',
    cooldown: 10000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        const category = interaction.options.getString('category') || 'general';

        const triviaQuestions = {
            general: [
                { question: "What is the largest planet in our solar system?", options: ["Earth", "Jupiter", "Saturn", "Neptune"], correct: 1 },
                { question: "How many continents are there?", options: ["5", "6", "7", "8"], correct: 2 },
                { question: "What is the smallest country in the world?", options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"], correct: 1 },
                { question: "Who painted the Mona Lisa?", options: ["Van Gogh", "Picasso", "Da Vinci", "Michelangelo"], correct: 2 }
            ],
            science: [
                { question: "What is the chemical symbol for gold?", options: ["Go", "Gd", "Au", "Ag"], correct: 2 },
                { question: "How many bones are in an adult human body?", options: ["206", "208", "210", "212"], correct: 0 },
                { question: "What gas makes up about 78% of Earth's atmosphere?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"], correct: 2 },
                { question: "What is the speed of light?", options: ["300,000 km/s", "299,792,458 m/s", "186,000 mph", "All of the above"], correct: 3 }
            ],
            history: [
                { question: "In which year did World War II end?", options: ["1944", "1945", "1946", "1947"], correct: 1 },
                { question: "Who was the first person to walk on the moon?", options: ["Buzz Aldrin", "Neil Armstrong", "John Glenn", "Alan Shepard"], correct: 1 },
                { question: "Which empire was ruled by Julius Caesar?", options: ["Greek", "Persian", "Roman", "Egyptian"], correct: 2 },
                { question: "When did the Berlin Wall fall?", options: ["1987", "1988", "1989", "1990"], correct: 2 }
            ],
            geography: [
                { question: "What is the capital of Australia?", options: ["Sydney", "Melbourne", "Canberra", "Perth"], correct: 2 },
                { question: "Which river is the longest in the world?", options: ["Amazon", "Nile", "Yangtze", "Mississippi"], correct: 1 },
                { question: "How many time zones does Russia have?", options: ["9", "11", "13", "15"], correct: 1 },
                { question: "Which mountain range contains Mount Everest?", options: ["Andes", "Alps", "Himalayas", "Rockies"], correct: 2 }
            ],
            entertainment: [
                { question: "Which movie won the Academy Award for Best Picture in 2020?", options: ["1917", "Joker", "Parasite", "Once Upon a Time in Hollywood"], correct: 2 },
                { question: "Who composed 'The Four Seasons'?", options: ["Bach", "Mozart", "Vivaldi", "Beethoven"], correct: 2 },
                { question: "What is the highest-grossing film of all time?", options: ["Avatar", "Avengers: Endgame", "Titanic", "Star Wars"], correct: 0 },
                { question: "Which TV show features the character Walter White?", options: ["Prison Break", "Breaking Bad", "Better Call Saul", "Lost"], correct: 1 }
            ]
        };

        const categoryQuestions = triviaQuestions[category];
        const randomQuestion = categoryQuestions[Math.floor(Math.random() * categoryQuestions.length)];

        const triviaEmbed = embedBuilder.createInfoEmbed(
            `${embedBuilder.addEmoji('games')} Trivia Challenge`,
            randomQuestion.question
        );

        triviaEmbed.addFields(
            {
                name: '📚 Category',
                value: category.charAt(0).toUpperCase() + category.slice(1),
                inline: true
            },
            {
                name: '⏱️ Time Limit',
                value: '30 seconds',
                inline: true
            }
        );

        const row = new ActionRowBuilder();
        randomQuestion.options.forEach((option, index) => {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`trivia_${index}`)
                    .setLabel(`${String.fromCharCode(65 + index)}. ${option}`)
                    .setStyle(ButtonStyle.Primary)
            );
        });

        await interaction.reply({ embeds: [triviaEmbed], components: [row] });

        // Handle button interactions
        const filter = (i) => i.customId.startsWith('trivia_') && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 30000 });

        collector.on('collect', async (i) => {
            const selectedIndex = parseInt(i.customId.split('_')[1]);
            const isCorrect = selectedIndex === randomQuestion.correct;

            const resultEmbed = isCorrect ? 
                embedBuilder.createSuccessEmbed('Correct!', `You got it right! The answer is **${randomQuestion.options[randomQuestion.correct]}**.`) :
                embedBuilder.createErrorEmbed('Incorrect!', `Sorry, the correct answer is **${randomQuestion.options[randomQuestion.correct]}**.`);

            resultEmbed.addFields({
                name: '📊 Your Answer',
                value: randomQuestion.options[selectedIndex],
                inline: true
            });

            await i.update({ embeds: [resultEmbed], components: [] });
            collector.stop();
        });

        collector.on('end', async (collected) => {
            if (collected.size === 0) {
                const timeoutEmbed = embedBuilder.createErrorEmbed(
                    'Time\'s Up!',
                    `The correct answer was **${randomQuestion.options[randomQuestion.correct]}**.`
                );
                await interaction.editReply({ embeds: [timeoutEmbed], components: [] });
            }
        });
    }
};