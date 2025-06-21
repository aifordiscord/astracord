const { SlashCommandBuilder } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Display a user\'s avatar in high quality')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user whose avatar to display')
                .setRequired(false)
        ),

    usage: '/avatar [user]',
    cooldown: 3000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        const targetUser = interaction.options.getUser('user') || interaction.user;

        try {
            const avatarEmbed = embedBuilder.createInfoEmbed(
                `${embedBuilder.addEmoji('info')} ${targetUser.username}'s Avatar`,
                `High quality avatar for ${targetUser.displayName}`
            );

            const avatarURL = targetUser.displayAvatarURL({ dynamic: true, size: 4096 });
            
            avatarEmbed.setImage(avatarURL);
            avatarEmbed.addFields(
                {
                    name: '🔗 Direct Links',
                    value: `[PNG](${targetUser.displayAvatarURL({ extension: 'png', size: 4096 })}) | [JPG](${targetUser.displayAvatarURL({ extension: 'jpg', size: 4096 })}) | [WEBP](${targetUser.displayAvatarURL({ extension: 'webp', size: 4096 })})${targetUser.avatar?.startsWith('a_') ? ` | [GIF](${targetUser.displayAvatarURL({ extension: 'gif', size: 4096 })})` : ''}`,
                    inline: false
                }
            );

            avatarEmbed.setFooter({
                text: `User ID: ${targetUser.id} • Requested by ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL()
            });

            await interaction.reply({ embeds: [avatarEmbed] });

        } catch (error) {
            console.error('Error fetching avatar:', error);
            
            const errorEmbed = embedBuilder.createErrorEmbed(
                'Error Fetching Avatar',
                'An error occurred while fetching the avatar. Please try again later.'
            );
            
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};