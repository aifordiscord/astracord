const { SlashCommandBuilder } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Ask the magic 8-ball a question')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('Your question for the magic 8-ball')
                .setRequired(true)
                .setMaxLength(200)
        ),

    usage: '/8ball <question>',
    cooldown: 3000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        const question = interaction.options.getString('question');

        const responses = [
            // Positive responses
            "It is certain",
            "It is decidedly so", 
            "Without a doubt",
            "Yes definitely",
            "You may rely on it",
            "As I see it, yes",
            "Most likely",
            "Outlook good",
            "Yes",
            "Signs point to yes",
            
            // Negative responses
            "Don't count on it",
            "My reply is no",
            "My sources say no",
            "Outlook not so good",
            "Very doubtful",
            "No",
            "Absolutely not",
            "I don't think so",
            
            // Neutral responses
            "Reply hazy, try again",
            "Ask again later",
            "Better not tell you now",
            "Cannot predict now",
            "Concentrate and ask again",
            "Maybe",
            "It's possible",
            "Unclear at this time"
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];

        const ballEmbed = embedBuilder.createInfoEmbed(
            `${embedBuilder.addEmoji('fun')} Magic 8-Ball`,
            ''
        );

        ballEmbed.addFields(
            {
                name: '❓ Your Question',
                value: question,
                inline: false
            },
            {
                name: '🎱 The Magic 8-Ball Says',
                value: `*${randomResponse}*`,
                inline: false
            }
        );

        ballEmbed.setFooter({
            text: `Asked by ${interaction.user.username} • The magic 8-ball has spoken!`,
            iconURL: interaction.user.displayAvatarURL()
        });

        await interaction.reply({ embeds: [ballEmbed] });
    }
};