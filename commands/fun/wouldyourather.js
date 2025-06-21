const { SlashCommandBuilder } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wouldyourather')
        .setDescription('Get a would you rather question with voting buttons')
        .addStringOption(option =>
            option.setName('category')
                .setDescription('Choose question category')
                .setRequired(false)
                .addChoices(
                    { name: 'General', value: 'general' },
                    { name: 'Superpowers', value: 'superpowers' },
                    { name: 'Food', value: 'food' },
                    { name: 'Technology', value: 'technology' }
                )
        ),

    usage: '/wouldyourather [category]',
    cooldown: 5000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        const category = interaction.options.getString('category') || 'general';

        const questions = {
            general: [
                { optionA: "Have the ability to fly", optionB: "Have the ability to be invisible" },
                { optionA: "Live forever", optionB: "Stop aging at your current age" },
                { optionA: "Know everything", optionB: "Be able to do anything" },
                { optionA: "Always be 10 minutes late", optionB: "Always be 20 minutes early" },
                { optionA: "Have unlimited money", optionB: "Have unlimited time" }
            ],
            superpowers: [
                { optionA: "Read minds", optionB: "Control time" },
                { optionA: "Super strength", optionB: "Super speed" },
                { optionA: "Teleportation", optionB: "Telepathy" },
                { optionA: "Breathe underwater", optionB: "Fly through space" },
                { optionA: "See the future", optionB: "Change the past" }
            ],
            food: [
                { optionA: "Never eat pizza again", optionB: "Never eat chocolate again" },
                { optionA: "Only eat sweet foods", optionB: "Only eat salty foods" },
                { optionA: "Never drink coffee", optionB: "Never drink tea" },
                { optionA: "Eat the same meal every day", optionB: "Never eat the same meal twice" },
                { optionA: "Only eat with chopsticks", optionB: "Only eat with your hands" }
            ],
            technology: [
                { optionA: "Live without internet", optionB: "Live without your phone" },
                { optionA: "Only use voice commands", optionB: "Only use touchscreen" },
                { optionA: "Have all your texts public", optionB: "Never text again" },
                { optionA: "Use only old technology", optionB: "Use only new technology" },
                { optionA: "Never use social media", optionB: "Never watch movies/TV" }
            ]
        };

        const categoryQuestions = questions[category];
        const randomQuestion = categoryQuestions[Math.floor(Math.random() * categoryQuestions.length)];

        const wyrEmbed = embedBuilder.createInfoEmbed(
            `${embedBuilder.addEmoji('games')} Would You Rather?`,
            'Choose your option and see what others think!'
        );

        wyrEmbed.addFields(
            {
                name: '🅰️ Option A',
                value: randomQuestion.optionA,
                inline: true
            },
            {
                name: '🅱️ Option B',
                value: randomQuestion.optionB,
                inline: true
            },
            {
                name: '📊 Category',
                value: category.charAt(0).toUpperCase() + category.slice(1),
                inline: false
            }
        );

        wyrEmbed.setFooter({
            text: `Question by ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL()
        });

        await interaction.reply({ embeds: [wyrEmbed] });
    }
};