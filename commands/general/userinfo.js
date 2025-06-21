const { SlashCommandBuilder } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Display detailed information about a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to get information about')
                .setRequired(false)
        ),

    usage: '/userinfo [user]',
    cooldown: 5000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const targetMember = interaction.guild?.members.cache.get(targetUser.id);

        try {
            const userEmbed = embedBuilder.createInfoEmbed(
                `${embedBuilder.addEmoji('info')} User Information`,
                `Detailed information about ${targetUser.username}`
            );

            userEmbed.setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }));

            // Basic user info
            userEmbed.addFields(
                {
                    name: '👤 Basic Info',
                    value: `**Username:** ${targetUser.username}\n**Display Name:** ${targetUser.displayName}\n**ID:** ${targetUser.id}\n**Bot:** ${targetUser.bot ? 'Yes' : 'No'}`,
                    inline: false
                },
                {
                    name: '📅 Account Created',
                    value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:F>\n<t:${Math.floor(targetUser.createdTimestamp / 1000)}:R>`,
                    inline: true
                }
            );

            // Server-specific info if in a guild
            if (targetMember && interaction.guild) {
                const roles = targetMember.roles.cache
                    .filter(role => role.id !== interaction.guild.id)
                    .sort((a, b) => b.position - a.position)
                    .map(role => role.toString())
                    .slice(0, 20);

                userEmbed.addFields(
                    {
                        name: '🏠 Server Info',
                        value: `**Joined:** <t:${Math.floor(targetMember.joinedTimestamp / 1000)}:F>\n**Nickname:** ${targetMember.nickname || 'None'}`,
                        inline: true
                    },
                    {
                        name: '🎭 Roles',
                        value: roles.length > 0 ? roles.join(', ') : 'No roles',
                        inline: false
                    }
                );

                // Permissions
                const keyPermissions = targetMember.permissions.toArray()
                    .filter(perm => ['Administrator', 'ManageGuild', 'ManageRoles', 'ManageChannels', 'BanMembers', 'KickMembers'].includes(perm))
                    .slice(0, 6);

                if (keyPermissions.length > 0) {
                    userEmbed.addFields({
                        name: '🔑 Key Permissions',
                        value: keyPermissions.join(', '),
                        inline: false
                    });
                }
            }

            // Presence info
            if (targetMember?.presence) {
                const status = targetMember.presence.status;
                const activities = targetMember.presence.activities;
                
                let statusText = status.charAt(0).toUpperCase() + status.slice(1);
                if (activities.length > 0) {
                    const activity = activities[0];
                    statusText += `\n**Activity:** ${activity.name}`;
                }

                userEmbed.addFields({
                    name: '🟢 Status',
                    value: statusText,
                    inline: true
                });
            }

            userEmbed.setFooter({
                text: `Requested by ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL()
            });

            await interaction.reply({ embeds: [userEmbed] });

        } catch (error) {
            console.error('Error fetching user info:', error);
            
            const errorEmbed = embedBuilder.createErrorEmbed(
                'Error Fetching User Info',
                'An error occurred while gathering user information. Please try again later.'
            );
            
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};