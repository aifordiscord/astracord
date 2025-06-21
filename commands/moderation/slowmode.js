const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('Set or remove slowmode in the current channel')
        .addIntegerOption(option =>
            option.setName('seconds')
                .setDescription('Slowmode duration in seconds (0-21600, 0 to disable)')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(21600)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    usage: '/slowmode <seconds>',
    cooldown: 3000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        const seconds = interaction.options.getInteger('seconds');

        try {
            await interaction.channel.setRateLimitPerUser(seconds);

            let title, description;
            if (seconds === 0) {
                title = 'Slowmode Disabled';
                description = `${embedBuilder.addEmoji('moderation')} Slowmode has been disabled in this channel.`;
            } else {
                title = 'Slowmode Enabled';
                description = `${embedBuilder.addEmoji('moderation')} Slowmode set to **${seconds}** second(s) in this channel.`;
            }

            const successEmbed = embedBuilder.createSuccessEmbed(title, description);

            successEmbed.addFields(
                {
                    name: 'Channel',
                    value: `<#${interaction.channel.id}>`,
                    inline: true
                },
                {
                    name: 'Duration',
                    value: seconds === 0 ? 'Disabled' : `${seconds} second(s)`,
                    inline: true
                },
                {
                    name: 'Moderator',
                    value: interaction.user.username,
                    inline: true
                }
            );

            await interaction.reply({ embeds: [successEmbed] });

        } catch (error) {
            console.error('Error setting slowmode:', error);
            
            const errorEmbed = embedBuilder.createErrorEmbed(
                'Slowmode Failed',
                'An error occurred while setting slowmode. Please check my permissions and try again.'
            );
            
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};