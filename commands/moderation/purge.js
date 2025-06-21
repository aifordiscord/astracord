const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Advanced message deletion with multiple filters')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Number of messages to scan (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)
        )
        .addStringOption(option =>
            option.setName('filter')
                .setDescription('Type of messages to delete')
                .setRequired(false)
                .addChoices(
                    { name: 'All Messages', value: 'all' },
                    { name: 'Bot Messages', value: 'bots' },
                    { name: 'Human Messages', value: 'humans' },
                    { name: 'Messages with Attachments', value: 'attachments' },
                    { name: 'Messages with Embeds', value: 'embeds' },
                    { name: 'Messages with Links', value: 'links' }
                )
        )
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Only delete messages from this specific user')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    usage: '/purge <amount> [filter] [user]',
    cooldown: 10000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        const amount = interaction.options.getInteger('amount');
        const filter = interaction.options.getString('filter') || 'all';
        const targetUser = interaction.options.getUser('user');

        try {
            await interaction.deferReply({ ephemeral: true });

            const messages = await interaction.channel.messages.fetch({ limit: amount });
            let messagesToDelete = [];

            messages.forEach(message => {
                // Skip messages older than 14 days (can't be bulk deleted)
                if (Date.now() - message.createdTimestamp > 14 * 24 * 60 * 60 * 1000) return;

                // User filter
                if (targetUser && message.author.id !== targetUser.id) return;

                // Content filters
                switch (filter) {
                    case 'all':
                        messagesToDelete.push(message);
                        break;
                    case 'bots':
                        if (message.author.bot) messagesToDelete.push(message);
                        break;
                    case 'humans':
                        if (!message.author.bot) messagesToDelete.push(message);
                        break;
                    case 'attachments':
                        if (message.attachments.size > 0) messagesToDelete.push(message);
                        break;
                    case 'embeds':
                        if (message.embeds.length > 0) messagesToDelete.push(message);
                        break;
                    case 'links':
                        if (message.content.includes('http://') || message.content.includes('https://')) {
                            messagesToDelete.push(message);
                        }
                        break;
                }
            });

            if (messagesToDelete.length === 0) {
                const noMessagesEmbed = embedBuilder.createErrorEmbed(
                    'No Messages Found',
                    'No messages matching the specified criteria were found.'
                );
                return interaction.editReply({ embeds: [noMessagesEmbed] });
            }

            const deletedMessages = await interaction.channel.bulkDelete(messagesToDelete, true);

            const successEmbed = embedBuilder.createSuccessEmbed(
                'Messages Purged Successfully',
                `${embedBuilder.addEmoji('moderation')} Deleted **${deletedMessages.size}** message(s) out of ${messagesToDelete.length} found.`
            );

            successEmbed.addFields(
                {
                    name: 'Channel',
                    value: `<#${interaction.channel.id}>`,
                    inline: true
                },
                {
                    name: 'Filter',
                    value: filter.charAt(0).toUpperCase() + filter.slice(1),
                    inline: true
                },
                {
                    name: 'Moderator',
                    value: interaction.user.username,
                    inline: true
                }
            );

            if (targetUser) {
                successEmbed.addFields({
                    name: 'Target User',
                    value: targetUser.username,
                    inline: true
                });
            }

            await interaction.editReply({ embeds: [successEmbed] });

            // Log to channel after a delay
            setTimeout(async () => {
                try {
                    const logEmbed = embedBuilder.createInfoEmbed(
                        'Advanced Purge',
                        `${deletedMessages.size} message(s) were purged by ${interaction.user.username}\n**Filter:** ${filter}${targetUser ? `\n**Target:** ${targetUser.username}` : ''}`
                    );
                    await interaction.followUp({ embeds: [logEmbed] });
                } catch (error) {
                    // Channel might be deleted or bot lacks permissions
                }
            }, 2000);

        } catch (error) {
            console.error('Error purging messages:', error);
            
            const errorEmbed = embedBuilder.createErrorEmbed(
                'Purge Failed',
                'An error occurred while purging messages. Messages older than 14 days cannot be bulk deleted.'
            );
            
            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], flags: 64 });
            }
        }
    }
};