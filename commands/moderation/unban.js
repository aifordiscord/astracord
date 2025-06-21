const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unban a user from the server')
        .addStringOption(option =>
            option.setName('user_id')
                .setDescription('The ID of the user to unban')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for unbanning')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    usage: '/unban <user_id> [reason]',
    cooldown: 5000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        const userId = interaction.options.getString('user_id');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        try {
            // Check if user is banned
            const bannedUsers = await interaction.guild.bans.fetch();
            const bannedUser = bannedUsers.get(userId);

            if (!bannedUser) {
                const errorEmbed = embedBuilder.createErrorEmbed(
                    'User Not Banned',
                    'This user is not banned from the server.'
                );
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            await interaction.guild.members.unban(userId, `${reason} | Unbanned by: ${interaction.user.username}`);

            const successEmbed = embedBuilder.createSuccessEmbed(
                'User Unbanned Successfully',
                `${embedBuilder.addEmoji('moderation')} **${bannedUser.user.username}** has been unbanned from the server.`
            );

            successEmbed.addFields(
                {
                    name: 'User',
                    value: `${bannedUser.user.username} (${bannedUser.user.id})`,
                    inline: true
                },
                {
                    name: 'Moderator',
                    value: interaction.user.username,
                    inline: true
                },
                {
                    name: 'Original Ban Reason',
                    value: bannedUser.reason || 'No reason provided',
                    inline: false
                },
                {
                    name: 'Unban Reason',
                    value: reason,
                    inline: false
                }
            );

            await interaction.reply({ embeds: [successEmbed] });

        } catch (error) {
            console.error('Error unbanning user:', error);
            
            const errorEmbed = embedBuilder.createErrorEmbed(
                'Unban Failed',
                'An error occurred while unbanning the user. Please check the user ID and my permissions.'
            );
            
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};