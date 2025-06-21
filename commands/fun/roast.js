const { SlashCommandBuilder } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roast')
        .setDescription('Get a light-hearted roast or use it on someone')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('User to roast (optional)')
                .setRequired(false)
        ),

    usage: '/roast [target]',
    cooldown: 5000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        const target = interaction.options.getUser('target') || interaction.user;

        const roasts = [
            "I'd challenge you to a battle of wits, but I see you're unarmed.",
            "You're not stupid; you just have bad luck thinking.",
            "I would ask how old you are, but I know you can't count that high.",
            "You bring everyone so much joy when you leave the room.",
            "If laughter is the best medicine, your face must be curing the world.",
            "I'm not saying you're slow, but you make a snail look like it's on speed.",
            "You're like a cloud. When you disappear, it's a beautiful day.",
            "I'd explain it to you, but I don't have any crayons with me.",
            "You're proof that evolution can go in reverse.",
            "If I wanted to hear from someone with your IQ, I'd watch a nature documentary.",
            "You're like a Monday morning - nobody's happy to see you.",
            "I'm not insulting you, I'm describing you.",
            "You have the perfect face for radio.",
            "If you were any more inbred, you'd be a sandwich.",
            "You're the reason the gene pool needs a lifeguard."
        ];

        const randomRoast = roasts[Math.floor(Math.random() * roasts.length)];

        const roastEmbed = embedBuilder.createErrorEmbed(
            `${embedBuilder.addEmoji('fun')} Roast Time!`,
            target.id === interaction.user.id ? 
                `${randomRoast}` : 
                `Hey ${target.username}, ${randomRoast.toLowerCase()}`
        );

        roastEmbed.addFields(
            {
                name: '🎯 Target',
                value: target.username,
                inline: true
            },
            {
                name: '😈 Roasted by',
                value: interaction.user.username,
                inline: true
            },
            {
                name: '💡 Remember',
                value: 'It\'s all in good fun!',
                inline: false
            }
        );

        roastEmbed.setFooter({
            text: 'All roasts are light-hearted and meant for entertainment',
            iconURL: interaction.client.user.displayAvatarURL()
        });

        await interaction.reply({ embeds: [roastEmbed] });
    }
};