const { SlashCommandBuilder } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('compliment')
        .setDescription('Give someone a nice compliment')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('User to compliment (optional)')
                .setRequired(false)
        ),

    usage: '/compliment [target]',
    cooldown: 3000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        const target = interaction.options.getUser('target') || interaction.user;

        const compliments = [
            "You're an awesome friend.",
            "You light up the room.",
            "You have a great sense of humor.",
            "You're a smart cookie.",
            "You have impeccable manners.",
            "You're really courageous.",
            "Your kindness is a balm to all who encounter it.",
            "You're all that and a super-size bag of chips.",
            "You're even more beautiful on the inside than you are on the outside.",
            "You have the courage of your convictions.",
            "Your eyes are breathtaking.",
            "You're really something special.",
            "You're a gift to those around you.",
            "You're a smart cookie.",
            "You are making a difference.",
            "You're like sunshine on a rainy day.",
            "You bring out the best in other people.",
            "Your ability to recall random factoids at just the right time is impressive.",
            "You're a great listener.",
            "How is it that you always look great, even in sweatpants?",
            "Everything would be better if more people were like you!",
            "I bet you sweat glitter.",
            "You were cool way before hipsters were cool.",
            "That color is perfect on you.",
            "Hanging out with you is always a blast."
        ];

        const randomCompliment = compliments[Math.floor(Math.random() * compliments.length)];

        const complimentEmbed = embedBuilder.createSuccessEmbed(
            `${embedBuilder.addEmoji('fun')} Compliment Time!`,
            target.id === interaction.user.id ? 
                `${randomCompliment}` : 
                `Hey ${target.username}, ${randomCompliment.toLowerCase()}`
        );

        complimentEmbed.addFields(
            {
                name: '💝 Target',
                value: target.username,
                inline: true
            },
            {
                name: '😊 From',
                value: interaction.user.username,
                inline: true
            },
            {
                name: '✨ Spread Positivity',
                value: 'Kind words make everyone\'s day better!',
                inline: false
            }
        );

        complimentEmbed.setFooter({
            text: 'Spreading kindness one compliment at a time',
            iconURL: interaction.client.user.displayAvatarURL()
        });

        await interaction.reply({ embeds: [complimentEmbed] });
    }
};