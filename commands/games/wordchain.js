const { SlashCommandBuilder } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wordchain')
        .setDescription('Start or continue a word chain game')
        .addStringOption(option =>
            option.setName('word')
                .setDescription('Your word for the chain')
                .setRequired(true)
                .setMinLength(2)
                .setMaxLength(20)
        ),

    usage: '/wordchain <word>',
    cooldown: 3000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        const userWord = interaction.options.getString('word').toLowerCase().trim();

        // Simple word validation
        if (!/^[a-z]+$/.test(userWord)) {
            const errorEmbed = embedBuilder.createErrorEmbed(
                'Invalid Word',
                'Please use only letters (no numbers or special characters).'
            );
            return interaction.reply({ embeds: [errorEmbed], flags: 64 });
        }

        // Generate bot response based on last letter
        const lastLetter = userWord.slice(-1);
        const botWords = {
            'a': ['apple', 'amazing', 'anchor', 'adventure', 'animal'],
            'b': ['banana', 'beautiful', 'bridge', 'butterfly', 'brilliant'],
            'c': ['computer', 'creative', 'challenge', 'celebration', 'curious'],
            'd': ['dragon', 'delicious', 'discovery', 'diamond', 'dynamic'],
            'e': ['elephant', 'exciting', 'energy', 'excellent', 'experience'],
            'f': ['fantastic', 'friendship', 'flower', 'freedom', 'future'],
            'g': ['galaxy', 'generous', 'garden', 'graceful', 'genuine'],
            'h': ['harmony', 'happiness', 'horizon', 'helpful', 'hopeful'],
            'i': ['imagination', 'incredible', 'island', 'innovative', 'inspiring'],
            'j': ['journey', 'joyful', 'jungle', 'jumping', 'justice'],
            'k': ['kindness', 'knowledge', 'keyboard', 'kaleidoscope', 'kingdom'],
            'l': ['lightning', 'laughter', 'library', 'luminous', 'legendary'],
            'm': ['mountain', 'magical', 'memory', 'magnificent', 'mysterious'],
            'n': ['nature', 'navigation', 'notebook', 'nurturing', 'nebula'],
            'o': ['ocean', 'opportunity', 'optimistic', 'outstanding', 'original'],
            'p': ['paradise', 'peaceful', 'phoenix', 'powerful', 'precious'],
            'q': ['quality', 'question', 'quantum', 'quiver', 'quest'],
            'r': ['rainbow', 'resilient', 'revolution', 'remarkable', 'radiant'],
            's': ['sunshine', 'spectacular', 'symphony', 'strength', 'serenity'],
            't': ['treasure', 'triumphant', 'telescope', 'transformation', 'thunder'],
            'u': ['universe', 'understanding', 'unique', 'unlimited', 'uplifting'],
            'v': ['victory', 'vibrant', 'volcano', 'valuable', 'visionary'],
            'w': ['wonderful', 'wisdom', 'waterfall', 'welcoming', 'whimsical'],
            'x': ['xenial', 'xerophyte', 'xylophone', 'xerus', 'xenon'],
            'y': ['yesterday', 'youthful', 'yearning', 'yielding', 'yonder'],
            'z': ['zenith', 'zephyr', 'zigzag', 'zodiac', 'zestful']
        };

        const possibleWords = botWords[lastLetter] || ['end'];
        const botWord = possibleWords[Math.floor(Math.random() * possibleWords.length)];

        const chainEmbed = embedBuilder.createInfoEmbed(
            `${embedBuilder.addEmoji('games')} Word Chain`,
            `Building the word chain together!`
        );

        chainEmbed.addFields(
            {
                name: '👤 Your Word',
                value: `**${userWord.toUpperCase()}**`,
                inline: true
            },
            {
                name: '🤖 Bot\'s Response',
                value: `**${botWord.toUpperCase()}**`,
                inline: true
            },
            {
                name: '🔗 Chain Rule',
                value: `Next word must start with **${botWord.slice(-1).toUpperCase()}**`,
                inline: false
            }
        );

        if (botWord === 'end') {
            chainEmbed.addFields({
                name: '🏁 Game Over',
                value: 'I couldn\'t find a word starting with that letter. You win this round!',
                inline: false
            });
        }

        chainEmbed.setFooter({
            text: `Word Chain by ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL()
        });

        await interaction.reply({ embeds: [chainEmbed] });
    }
};