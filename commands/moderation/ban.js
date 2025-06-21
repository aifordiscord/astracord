const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a member from the server')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to ban')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the ban')
                .setRequired(false)
        )
        .addIntegerOption(option =>
            option.setName('delete_days')
                .setDescription('Number of days of messages to delete (0-7)')
                .setMinValue(0)
                .setMaxValue(7)
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    usage: '/ban <user> [reason] [delete_days]',
    cooldown: 5000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        const targetUser = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const deleteDays = interaction.options.getInteger('delete_days') || 0;

        // Check if user is trying to ban themselves
        if (targetUser.id === interaction.user.id) {
            const errorEmbed = embedBuilder.createErrorEmbed(
                'Invalid Action',
                'You cannot ban yourself!'
            );
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        // Check if user is trying to ban the bot
        if (targetUser.id === interaction.client.user.id) {
            const errorEmbed = embedBuilder.createErrorEmbed(
                'Invalid Action',
                'I cannot ban myself!'
            );
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        try {
            // Get the member object
            const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
            
            // Check if user is already banned
            const bannedUsers = await interaction.guild.bans.fetch();
            if (bannedUsers.has(targetUser.id)) {
                const errorEmbed = embedBuilder.createErrorEmbed(
                    'User Already Banned',
                    `${targetUser.username} is already banned from this server.`
                );
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            // Check role hierarchy if member exists
            if (targetMember) {
                if (targetMember.roles.highest.position >= interaction.member.roles.highest.position) {
                    const errorEmbed = embedBuilder.createErrorEmbed(
                        'Insufficient Permissions',
                        'You cannot ban a member with equal or higher role than you.'
                    );
                    return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                }

                if (targetMember.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
                    const errorEmbed = embedBuilder.createErrorEmbed(
                        'Insufficient Permissions',
                        'I cannot ban a member with equal or higher role than me.'
                    );
                    return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                }
            }

            // Attempt to send DM to user before banning
            try {
                const dmEmbed = embedBuilder.createErrorEmbed(
                    `You have been banned from ${interaction.guild.name}`,
                    `**Reason:** ${reason}\n**Moderator:** ${interaction.user.username}`
                );
                await targetUser.send({ embeds: [dmEmbed] });
            } catch (error) {
                // User has DMs disabled or can't receive DMs
            }

            // Ban the user
            await interaction.guild.members.ban(targetUser, {
                reason: `${reason} | Banned by: ${interaction.user.username}`,
                deleteMessageDays: deleteDays
            });

            // Success embed
            const successEmbed = embedBuilder.createSuccessEmbed(
                'User Banned Successfully',
                `${embedBuilder.addEmoji('moderation')} **${targetUser.username}** has been banned from the server.`
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

            if (deleteDays > 0) {
                successEmbed.addFields({
                    name: 'Messages Deleted',
                    value: `${deleteDays} day(s) of messages`,
                    inline: true
                });
            }

            await interaction.reply({ embeds: [successEmbed] });

        } catch (error) {
            console.error('Error banning user:', error);
            
            const errorEmbed = embedBuilder.createErrorEmbed(
                'Ban Failed',
                'An error occurred while trying to ban the user. Please check my permissions and try again.'
            );
            
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};
