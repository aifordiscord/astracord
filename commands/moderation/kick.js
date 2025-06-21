const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a member from the server')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to kick')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the kick')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

    usage: '/kick <user> [reason]',
    cooldown: 5000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        const targetUser = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        // Check if user is trying to kick themselves
        if (targetUser.id === interaction.user.id) {
            const errorEmbed = embedBuilder.createErrorEmbed(
                'Invalid Action',
                'You cannot kick yourself!'
            );
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        // Check if user is trying to kick the bot
        if (targetUser.id === interaction.client.user.id) {
            const errorEmbed = embedBuilder.createErrorEmbed(
                'Invalid Action',
                'I cannot kick myself!'
            );
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        try {
            // Get the member object
            const targetMember = await interaction.guild.members.fetch(targetUser.id);
            
            if (!targetMember) {
                const errorEmbed = embedBuilder.createErrorEmbed(
                    'User Not Found',
                    'This user is not a member of this server.'
                );
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            // Check role hierarchy
            if (targetMember.roles.highest.position >= interaction.member.roles.highest.position) {
                const errorEmbed = embedBuilder.createErrorEmbed(
                    'Insufficient Permissions',
                    'You cannot kick a member with equal or higher role than you.'
                );
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            if (targetMember.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
                const errorEmbed = embedBuilder.createErrorEmbed(
                    'Insufficient Permissions',
                    'I cannot kick a member with equal or higher role than me.'
                );
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            // Check if member is kickable
            if (!targetMember.kickable) {
                const errorEmbed = embedBuilder.createErrorEmbed(
                    'Cannot Kick User',
                    'I do not have permission to kick this user.'
                );
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            // Attempt to send DM to user before kicking
            try {
                const dmEmbed = embedBuilder.createWarningColor().embed
                    .setTitle(`You have been kicked from ${interaction.guild.name}`)
                    .setDescription(`**Reason:** ${reason}\n**Moderator:** ${interaction.user.username}`)
                    .setTimestamp();
                
                await targetUser.send({ embeds: [dmEmbed] });
            } catch (error) {
                // User has DMs disabled or can't receive DMs
            }

            // Kick the user
            await targetMember.kick(`${reason} | Kicked by: ${interaction.user.username}`);

            // Success embed
            const successEmbed = embedBuilder.createSuccessEmbed(
                'User Kicked Successfully',
                `${embedBuilder.addEmoji('moderation')} **${targetUser.username}** has been kicked from the server.`
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
            console.error('Error kicking user:', error);
            
            const errorEmbed = embedBuilder.createErrorEmbed(
                'Kick Failed',
                'An error occurred while trying to kick the user. Please check my permissions and try again.'
            );
            
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};
