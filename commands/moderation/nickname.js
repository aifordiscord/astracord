const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nickname')
        .setDescription('Change or reset a user\'s nickname')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to change nickname for')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('nickname')
                .setDescription('New nickname (leave empty to reset)')
                .setRequired(false)
                .setMaxLength(32)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for nickname change')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames),

    usage: '/nickname <user> [nickname] [reason]',
    cooldown: 3000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        const targetUser = interaction.options.getUser('user');
        const newNickname = interaction.options.getString('nickname');
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

            if (targetMember.roles.highest.position >= interaction.member.roles.highest.position && targetUser.id !== interaction.user.id) {
                const errorEmbed = embedBuilder.createErrorEmbed(
                    'Insufficient Permissions',
                    'You cannot change the nickname of a member with equal or higher role than you.'
                );
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            const oldNickname = targetMember.nickname || targetUser.username;
            
            await targetMember.setNickname(newNickname, `${reason} | Nickname changed by: ${interaction.user.username}`);

            const action = newNickname ? 'Changed' : 'Reset';
            const newDisplayName = newNickname || targetUser.username;

            const successEmbed = embedBuilder.createSuccessEmbed(
                `Nickname ${action} Successfully`,
                `${embedBuilder.addEmoji('moderation')} ${action} nickname for **${targetUser.username}**.`
            );

            successEmbed.addFields(
                {
                    name: 'User',
                    value: `${targetUser.username} (${targetUser.id})`,
                    inline: true
                },
                {
                    name: 'Old Nickname',
                    value: oldNickname,
                    inline: true
                },
                {
                    name: 'New Nickname',
                    value: newDisplayName,
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
            console.error('Error changing nickname:', error);
            
            const errorEmbed = embedBuilder.createErrorEmbed(
                'Nickname Change Failed',
                'An error occurred while changing the nickname. Please check my permissions and try again.'
            );
            
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};