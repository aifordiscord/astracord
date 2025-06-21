const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Remove timeout from a member')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to remove timeout from')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for removing timeout')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    usage: '/unmute <user> [reason]',
    cooldown: 3000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        const targetUser = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        try {
            const targetMember = await interaction.guild.members.fetch(targetUser.id);
            
            if (!targetMember) {
                const errorEmbed = embedBuilder.createErrorEmbed(
                    'User Not Found',
                    'This user is not a member of this server.'
                );
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            if (!targetMember.isCommunicationDisabled()) {
                const errorEmbed = embedBuilder.createErrorEmbed(
                    'User Not Timed Out',
                    'This user is not currently timed out.'
                );
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            await targetMember.timeout(null, `${reason} | Timeout removed by: ${interaction.user.username}`);

            // Send DM to user
            try {
                const dmEmbed = embedBuilder.createSuccessEmbed(
                    `Your timeout has been removed in ${interaction.guild.name}`,
                    `**Reason:** ${reason}\n**Moderator:** ${interaction.user.username}`
                );
                await targetUser.send({ embeds: [dmEmbed] });
            } catch (error) {
                // User has DMs disabled
            }

            const successEmbed = embedBuilder.createSuccessEmbed(
                'Timeout Removed Successfully',
                `${embedBuilder.addEmoji('moderation')} **${targetUser.username}**'s timeout has been removed.`
            );

            successEmbed.addFields(
                {
                    name: 'User',
                    value: `${targetUser.username} (${targetUser.id})`,
                    inline: true
                },
                {
                    name: 'Moderator',
                    value: interaction.user.username,
                    inline: true
                },
                {
                    name: 'Reason',
                    value: reason,
                    inline: false
                }
            );

            await interaction.reply({ embeds: [successEmbed] });

        } catch (error) {
            console.error('Error removing timeout:', error);
            
            const errorEmbed = embedBuilder.createErrorEmbed(
                'Unmute Failed',
                'An error occurred while removing the timeout. Please check my permissions and try again.'
            );
            
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};