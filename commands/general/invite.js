const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');
const config = require('../../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Get the bot invite link with customizable permissions')
        .addStringOption(option =>
            option.setName('permissions')
                .setDescription('Permission level for the bot')
                .setRequired(false)
                .addChoices(
                    { name: 'Basic (Send Messages, Embed Links)', value: 'basic' },
                    { name: 'Moderation (Kick, Ban, Manage Messages)', value: 'moderation' },
                    { name: 'Advanced (Most Permissions)', value: 'advanced' },
                    { name: 'Administrator (All Permissions)', value: 'admin' }
                )
        ),

    usage: '/invite [permissions]',
    cooldown: 5000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        const permissionLevel = interaction.options.getString('permissions') || 'basic';

        try {
            let permissions;
            let description;

            switch (permissionLevel) {
                case 'basic':
                    permissions = [
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.EmbedLinks,
                        PermissionFlagsBits.UseExternalEmojis,
                        PermissionFlagsBits.ReadMessageHistory
                    ];
                    description = 'Basic permissions for general commands';
                    break;
                case 'moderation':
                    permissions = [
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.EmbedLinks,
                        PermissionFlagsBits.UseExternalEmojis,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.KickMembers,
                        PermissionFlagsBits.BanMembers,
                        PermissionFlagsBits.ManageMessages,
                        PermissionFlagsBits.ViewAuditLog
                    ];
                    description = 'Moderation permissions for server management';
                    break;
                case 'advanced':
                    permissions = [
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.EmbedLinks,
                        PermissionFlagsBits.UseExternalEmojis,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.KickMembers,
                        PermissionFlagsBits.BanMembers,
                        PermissionFlagsBits.ManageMessages,
                        PermissionFlagsBits.ViewAuditLog,
                        PermissionFlagsBits.Connect,
                        PermissionFlagsBits.Speak,
                        PermissionFlagsBits.ManageRoles,
                        PermissionFlagsBits.ManageChannels
                    ];
                    description = 'Advanced permissions for full functionality';
                    break;
                case 'admin':
                    permissions = [PermissionFlagsBits.Administrator];
                    description = 'Administrator permissions (full access)';
                    break;
                default:
                    permissions = [PermissionFlagsBits.SendMessages];
                    description = 'Basic permissions';
            }

            const permissionsValue = permissions.reduce((a, b) => a | b, 0n);
            const inviteURL = `https://discord.com/api/oauth2/authorize?client_id=${config.clientId}&permissions=${permissionsValue}&scope=bot%20applications.commands`;

            const inviteEmbed = embedBuilder.createInfoEmbed(
                `${embedBuilder.addEmoji('invite')} Bot Invite Link`,
                `Add ${interaction.client.user.username} to your server!`
            );

            inviteEmbed.addFields(
                {
                    name: '🔗 Invite Link',
                    value: `[Click here to invite the bot](${inviteURL})`,
                    inline: false
                },
                {
                    name: '🔐 Permission Level',
                    value: `**${permissionLevel.charAt(0).toUpperCase() + permissionLevel.slice(1)}**\n${description}`,
                    inline: true
                },
                {
                    name: '📋 What you get',
                    value: `• ${interaction.client.commands.size} slash commands\n• Interactive help system\n• Custom emoji support\n• Advanced moderation tools`,
                    inline: true
                }
            );

            inviteEmbed.setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true, size: 256 }));
            inviteEmbed.setFooter({
                text: `Bot ID: ${config.clientId} • Requested by ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL()
            });

            await interaction.reply({ embeds: [inviteEmbed] });

        } catch (error) {
            console.error('Error generating invite:', error);
            
            const errorEmbed = embedBuilder.createErrorEmbed(
                'Error Generating Invite',
                'An error occurred while generating the invite link. Please try again later.'
            );
            
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};