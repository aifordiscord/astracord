const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Delete a specified number of messages')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Number of messages to delete (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)
        )
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Only delete messages from this user')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    usage: '/clear <amount> [user]',
    cooldown: 5000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        const amount = interaction.options.getInteger('amount');
        const targetUser = interaction.options.getUser('user');

        try {
            await interaction.deferReply({ ephemeral: true });

            const messages = await interaction.channel.messages.fetch({ limit: 100 });
            let messagesToDelete = messages.first(amount);

            if (targetUser) {
                messagesToDelete = messages.filter(msg => msg.author.id === targetUser.id).first(amount);
            }

            const deletedMessages = await interaction.channel.bulkDelete(messagesToDelete, true);

            const successEmbed = embedBuilder.createSuccessEmbed(
                'Messages Cleared Successfully',
                `${embedBuilder.addEmoji('moderation')} Deleted **${deletedMessages.size}** message(s).`
            );

            successEmbed.addFields(
                {
                    name: 'Channel',
                    value: `<#${interaction.channel.id}>`,
                    inline: true
                },
                {
                    name: 'Moderator',
                    value: interaction.user.username,
                    inline: true
                },
                {
                    name: 'Filter',
                    value: targetUser ? `Messages from ${targetUser.username}` : 'All messages',
                    inline: true
                }
            );

            await interaction.editReply({ embeds: [successEmbed] });

            // Log to channel after a delay
            setTimeout(async () => {
                try {
                    const logEmbed = embedBuilder.createInfoEmbed(
                        'Bulk Delete',
                        `${deletedMessages.size} message(s) were deleted by ${interaction.user.username}`
                    );
                    await interaction.followUp({ embeds: [logEmbed] });
                } catch (error) {
                    // Channel might be deleted or bot lacks permissions
                }
            }, 2000);

        } catch (error) {
            console.error('Error clearing messages:', error);
            
            const errorEmbed = embedBuilder.createErrorEmbed(
                'Clear Failed',
                'An error occurred while deleting messages. Messages older than 14 days cannot be bulk deleted.'
            );
            
            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], flags: 64 });
            }
        }
    }
};