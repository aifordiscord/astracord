const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('Add or remove a role from a user')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Add or remove the role')
                .setRequired(true)
                .addChoices(
                    { name: 'Add', value: 'add' },
                    { name: 'Remove', value: 'remove' }
                )
        )
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to modify roles for')
                .setRequired(true)
        )
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('The role to add or remove')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the role change')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    usage: '/role <action> <user> <role> [reason]',
    cooldown: 3000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        const action = interaction.options.getString('action');
        const targetUser = interaction.options.getUser('user');
        const role = interaction.options.getRole('role');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        try {
            const targetMember = await interaction.guild.members.fetch(targetUser.id);
            
            if (!targetMember) {
                const errorEmbed = embedBuilder.createErrorEmbed(
                    'User Not Found',
                    'This user is not a member of this server.'
                );
                return interaction.reply({ embeds: [errorEmbed], flags: 64 });
            }

            // Check role hierarchy
            if (role.position >= interaction.member.roles.highest.position) {
                const errorEmbed = embedBuilder.createErrorEmbed(
                    'Insufficient Permissions',
                    'You cannot manage a role that is equal to or higher than your highest role.'
                );
                return interaction.reply({ embeds: [errorEmbed], flags: 64 });
            }

            if (role.position >= interaction.guild.members.me.roles.highest.position) {
                const errorEmbed = embedBuilder.createErrorEmbed(
                    'Insufficient Permissions',
                    'I cannot manage a role that is equal to or higher than my highest role.'
                );
                return interaction.reply({ embeds: [errorEmbed], flags: 64 });
            }

            if (action === 'add') {
                if (targetMember.roles.cache.has(role.id)) {
                    const errorEmbed = embedBuilder.createErrorEmbed(
                        'Role Already Assigned',
                        `${targetUser.username} already has the ${role.name} role.`
                    );
                    return interaction.reply({ embeds: [errorEmbed], flags: 64 });
                }

                await targetMember.roles.add(role, `${reason} | Role added by: ${interaction.user.username}`);

                const successEmbed = embedBuilder.createSuccessEmbed(
                    'Role Added Successfully',
                    `${embedBuilder.addEmoji('moderation')} Added **${role.name}** role to **${targetUser.username}**.`
                );

                successEmbed.addFields(
                    {
                        name: 'User',
                        value: `${targetUser.username} (${targetUser.id})`,
                        inline: true
                    },
                    {
                        name: 'Role',
                        value: role.toString(),
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

            } else {
                if (!targetMember.roles.cache.has(role.id)) {
                    const errorEmbed = embedBuilder.createErrorEmbed(
                        'Role Not Assigned',
                        `${targetUser.username} doesn't have the ${role.name} role.`
                    );
                    return interaction.reply({ embeds: [errorEmbed], flags: 64 });
                }

                await targetMember.roles.remove(role, `${reason} | Role removed by: ${interaction.user.username}`);

                const successEmbed = embedBuilder.createSuccessEmbed(
                    'Role Removed Successfully',
                    `${embedBuilder.addEmoji('moderation')} Removed **${role.name}** role from **${targetUser.username}**.`
                );

                successEmbed.addFields(
                    {
                        name: 'User',
                        value: `${targetUser.username} (${targetUser.id})`,
                        inline: true
                    },
                    {
                        name: 'Role',
                        value: role.toString(),
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
            }

        } catch (error) {
            console.error('Error managing role:', error);
            
            const errorEmbed = embedBuilder.createErrorEmbed(
                'Role Management Failed',
                'An error occurred while managing the role. Please check my permissions and try again.'
            );
            
            await interaction.reply({ embeds: [errorEmbed], flags: 64 });
        }
    }
};