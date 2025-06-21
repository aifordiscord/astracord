const { SlashCommandBuilder } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quote')
        .setDescription('Get an inspirational or funny quote')
        .addStringOption(option =>
            option.setName('category')
                .setDescription('Choose a quote category')
                .setRequired(false)
                .addChoices(
                    { name: 'Inspirational', value: 'inspirational' },
                    { name: 'Funny', value: 'funny' },
                    { name: 'Programming', value: 'programming' },
                    { name: 'Wisdom', value: 'wisdom' }
                )
        ),

    usage: '/quote [category]',
    cooldown: 3000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        const category = interaction.options.getString('category') || 'inspirational';

        const quotes = {
            inspirational: [
                { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
                { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
                { text: "Life is what happens to you while you're busy making other plans.", author: "John Lennon" },
                { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
                { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
                { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
                { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
                { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" }
            ],
            funny: [
                { text: "I'm not arguing, I'm just explaining why I'm right.", author: "Anonymous" },
                { text: "I told my wife she was drawing her eyebrows too high. She looked surprised.", author: "Anonymous" },
                { text: "I'm not lazy, I'm just very relaxed.", author: "Anonymous" },
                { text: "I'm not addicted to social media, I'm just very social.", author: "Anonymous" },
                { text: "The early bird might get the worm, but the second mouse gets the cheese.", author: "Anonymous" },
                { text: "I haven't failed, I've just found 10,000 ways that don't work.", author: "Thomas Edison (adapted)" },
                { text: "Why do they call it rush hour when nobody's moving?", author: "Robin Williams" },
                { text: "I'm not procrastinating, I'm doing side quests.", author: "Anonymous" }
            ],
            programming: [
                { text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", author: "Martin Fowler" },
                { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
                { text: "Experience is the name everyone gives to their mistakes.", author: "Oscar Wilde" },
                { text: "The best error message is the one that never shows up.", author: "Thomas Fuchs" },
                { text: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House" },
                { text: "Programming isn't about what you know; it's about what you can figure out.", author: "Chris Pine" },
                { text: "The most disastrous thing that you can ever learn is your first programming language.", author: "Alan Kay" },
                { text: "There are only two hard things in Computer Science: cache invalidation and naming things.", author: "Phil Karlton" }
            ],
            wisdom: [
                { text: "The only true wisdom is in knowing you know nothing.", author: "Socrates" },
                { text: "Yesterday is history, tomorrow is a mystery, today is a gift.", author: "Eleanor Roosevelt" },
                { text: "Be yourself; everyone else is already taken.", author: "Oscar Wilde" },
                { text: "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe.", author: "Albert Einstein" },
                { text: "A room without books is like a body without a soul.", author: "Marcus Tullius Cicero" },
                { text: "You only live once, but if you do it right, once is enough.", author: "Mae West" },
                { text: "The only way to get rid of temptation is to yield to it.", author: "Oscar Wilde" },
                { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" }
            ]
        };

        const categoryQuotes = quotes[category];
        const randomQuote = categoryQuotes[Math.floor(Math.random() * categoryQuotes.length)];

        const quoteEmbed = embedBuilder.createInfoEmbed(
            `${embedBuilder.addEmoji('fun')} Daily Quote`,
            ''
        );

        quoteEmbed.addFields(
            {
                name: '💭 Quote',
                value: `*"${randomQuote.text}"*`,
                inline: false
            },
            {
                name: '✍️ Author',
                value: `— ${randomQuote.author}`,
                inline: true
            },
            {
                name: '📚 Category',
                value: category.charAt(0).toUpperCase() + category.slice(1),
                inline: true
            }
        );

        quoteEmbed.setFooter({
            text: `Requested by ${interaction.user.username} • Wisdom for the day`,
            iconURL: interaction.user.displayAvatarURL()
        });

        await interaction.reply({ embeds: [quoteEmbed] });
    }
};