const { SlashCommandBuilder } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('riddle')
        .setDescription('Get a random riddle to solve')
        .addStringOption(option =>
            option.setName('difficulty')
                .setDescription('Choose riddle difficulty')
                .setRequired(false)
                .addChoices(
                    { name: 'Easy', value: 'easy' },
                    { name: 'Medium', value: 'medium' },
                    { name: 'Hard', value: 'hard' }
                )
        ),

    usage: '/riddle [difficulty]',
    cooldown: 5000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        const difficulty = interaction.options.getString('difficulty') || 'medium';

        const riddles = {
            easy: [
                { question: "What has keys but no locks, space but no room, and you can enter but not go inside?", answer: "A keyboard" },
                { question: "What gets wet while drying?", answer: "A towel" },
                { question: "What has hands but cannot clap?", answer: "A clock" },
                { question: "What can travel around the world while staying in a corner?", answer: "A stamp" },
                { question: "What has a head and a tail but no body?", answer: "A coin" }
            ],
            medium: [
                { question: "I am not alive, but I grow. I don't have lungs, but I need air. I don't have a mouth, but water kills me. What am I?", answer: "Fire" },
                { question: "The more you take, the more you leave behind. What am I?", answer: "Footsteps" },
                { question: "What comes once in a minute, twice in a moment, but never in a thousand years?", answer: "The letter M" },
                { question: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?", answer: "A map" },
                { question: "What breaks but never falls, and what falls but never breaks?", answer: "Day breaks and night falls" }
            ],
            hard: [
                { question: "I speak without a mouth and hear without ears. I have no body, but come alive with wind. What am I?", answer: "An echo" },
                { question: "The person who makes it sells it. The person who buys it never uses it. The person who uses it never knows they're using it. What is it?", answer: "A coffin" },
                { question: "What can run but never walks, has a mouth but never talks, has a head but never weeps, has a bed but never sleeps?", answer: "A river" },
                { question: "I am something people love or hate. I change people's appearances and thoughts. If a person takes care of themselves, I will go up even higher. What am I?", answer: "Age" },
                { question: "Forward I am heavy, backward I am not. What am I?", answer: "The word 'ton'" }
            ]
        };

        const categoryRiddles = riddles[difficulty];
        const randomRiddle = categoryRiddles[Math.floor(Math.random() * categoryRiddles.length)];

        const riddleEmbed = embedBuilder.createInfoEmbed(
            `${embedBuilder.addEmoji('fun')} Brain Teaser`,
            'Can you solve this riddle?'
        );

        riddleEmbed.addFields(
            {
                name: '🧩 Riddle',
                value: randomRiddle.question,
                inline: false
            },
            {
                name: '📊 Difficulty',
                value: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
                inline: true
            },
            {
                name: '💡 Hint',
                value: 'Think carefully and consider multiple meanings!',
                inline: true
            }
        );

        riddleEmbed.setFooter({
            text: `Think you know the answer? • Requested by ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL()
        });

        await interaction.reply({ embeds: [riddleEmbed] });

        // Send the answer after 30 seconds
        setTimeout(async () => {
            try {
                const answerEmbed = embedBuilder.createSuccessEmbed(
                    'Riddle Answer Revealed!',
                    `The answer was: **${randomRiddle.answer}**`
                );
                
                answerEmbed.addFields({
                    name: '🧩 Original Riddle',
                    value: randomRiddle.question,
                    inline: false
                });

                await interaction.followUp({ embeds: [answerEmbed] });
            } catch (error) {
                // Interaction might have expired
            }
        }, 30000);
    }
};