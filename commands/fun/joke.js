const { SlashCommandBuilder } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('joke')
        .setDescription('Get a random joke')
        .addStringOption(option =>
            option.setName('category')
                .setDescription('Choose a joke category')
                .setRequired(false)
                .addChoices(
                    { name: 'Programming', value: 'programming' },
                    { name: 'Dad Jokes', value: 'dad' },
                    { name: 'General', value: 'general' }
                )
        ),

    usage: '/joke [category]',
    cooldown: 3000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        const category = interaction.options.getString('category') || 'general';

        const jokes = {
            programming: [
                {
                    setup: "Why do programmers prefer dark mode?",
                    punchline: "Because light attracts bugs!"
                },
                {
                    setup: "How many programmers does it take to change a light bulb?",
                    punchline: "None. That's a hardware problem."
                },
                {
                    setup: "Why do Java developers wear glasses?",
                    punchline: "Because they don't see sharp!"
                },
                {
                    setup: "What's a programmer's favorite hangout place?",
                    punchline: "Foo Bar!"
                },
                {
                    setup: "Why did the programmer quit his job?",
                    punchline: "He didn't get arrays!"
                }
            ],
            dad: [
                {
                    setup: "Why don't scientists trust atoms?",
                    punchline: "Because they make up everything!"
                },
                {
                    setup: "Did you hear about the mathematician who's afraid of negative numbers?",
                    punchline: "He'll stop at nothing to avoid them!"
                },
                {
                    setup: "Why do fathers take an extra pair of socks when they go golfing?",
                    punchline: "In case they get a hole in one!"
                },
                {
                    setup: "What do you call a fake noodle?",
                    punchline: "An impasta!"
                },
                {
                    setup: "How do you organize a space party?",
                    punchline: "You planet!"
                }
            ],
            general: [
                {
                    setup: "Why don't eggs tell jokes?",
                    punchline: "They'd crack each other up!"
                },
                {
                    setup: "What do you call a sleeping bull?",
                    punchline: "A bulldozer!"
                },
                {
                    setup: "Why don't robots ever panic?",
                    punchline: "They have nerves of steel!"
                },
                {
                    setup: "What's orange and sounds like a parrot?",
                    punchline: "A carrot!"
                },
                {
                    setup: "Why did the scarecrow win an award?",
                    punchline: "He was outstanding in his field!"
                }
            ]
        };

        const categoryJokes = jokes[category];
        const randomJoke = categoryJokes[Math.floor(Math.random() * categoryJokes.length)];

        const jokeEmbed = embedBuilder.createInfoEmbed(
            `${embedBuilder.addEmoji('fun')} Random Joke`,
            ''
        );

        jokeEmbed.addFields(
            {
                name: '🎭 Setup',
                value: randomJoke.setup,
                inline: false
            },
            {
                name: '😂 Punchline',
                value: randomJoke.punchline,
                inline: false
            }
        );

        jokeEmbed.setFooter({
            text: `Category: ${category.charAt(0).toUpperCase() + category.slice(1)} • Requested by ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL()
        });

        await interaction.reply({ embeds: [jokeEmbed] });
    }
};
