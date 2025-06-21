const { SlashCommandBuilder } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('Check how long the bot has been running'),

    usage: '/uptime',
    cooldown: 5000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();

        try {
            const uptime = process.uptime();
            const days = Math.floor(uptime / 86400);
            const hours = Math.floor((uptime % 86400) / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = Math.floor(uptime % 60);

            const uptimeEmbed = embedBuilder.createInfoEmbed(
                `${embedBuilder.addEmoji('info')} Bot Uptime`,
                'Current session runtime information'
            );

            uptimeEmbed.addFields(
                {
                    name: '⏱️ Detailed Uptime',
                    value: `**${days}** days, **${hours}** hours, **${minutes}** minutes, **${seconds}** seconds`,
                    inline: false
                },
                {
                    name: '🕒 Started',
                    value: `<t:${Math.floor((Date.now() - (uptime * 1000)) / 1000)}:F>`,
                    inline: true
                },
                {
                    name: '📊 Raw Seconds',
                    value: `${Math.floor(uptime)} seconds`,
                    inline: true
                }
            );

            uptimeEmbed.setFooter({
                text: `Requested by ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL()
            });

            await interaction.reply({ embeds: [uptimeEmbed] });

        } catch (error) {
            console.error('Error fetching uptime:', error);
            
            const errorEmbed = embedBuilder.createErrorEmbed(
                'Error Fetching Uptime',
                'An error occurred while fetching uptime information.'
            );
            
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};