const { SlashCommandBuilder, version } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Display information about the bot'),

    usage: '/botinfo',
    cooldown: 10000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        const client = interaction.client;

        try {
            const uptime = process.uptime();
            const uptimeString = `${Math.floor(uptime / 86400)}d ${Math.floor((uptime % 86400) / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`;
            
            const memoryUsage = process.memoryUsage();
            const memoryUsed = Math.round(memoryUsage.heapUsed / 1024 / 1024);
            const memoryTotal = Math.round(memoryUsage.heapTotal / 1024 / 1024);

            const botEmbed = embedBuilder.createInfoEmbed(
                `${embedBuilder.addEmoji('astracord')} Bot Information`,
                `Advanced Discord Bot built with Discord.js`
            );

            botEmbed.setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 256 }));

            botEmbed.addFields(
                {
                    name: '🤖 Bot Stats',
                    value: `**Name:** ${client.user.username}\n**ID:** ${client.user.id}\n**Uptime:** ${uptimeString}\n**Commands:** ${client.commands.size}`,
                    inline: true
                },
                {
                    name: '📊 Server Stats',
                    value: `**Servers:** ${client.guilds.cache.size}\n**Users:** ${client.users.cache.size}\n**Channels:** ${client.channels.cache.size}\n**Ping:** ${Math.round(client.ws.ping)}ms`,
                    inline: true
                },
                {
                    name: '💻 System Info',
                    value: `**Memory:** ${memoryUsed}MB / ${memoryTotal}MB\n**Node.js:** ${process.version}\n**Discord.js:** v${version}\n**Platform:** ${process.platform}`,
                    inline: true
                },
                {
                    name: '✨ Features',
                    value: `• Interactive Help System\n• Custom Emoji Support\n• Modular Command Structure\n• Advanced Error Handling\n• Pagination & Navigation`,
                    inline: false
                }
            );

            botEmbed.setFooter({
                text: `Created with ❤️ • Requested by ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL()
            });

            await interaction.reply({ embeds: [botEmbed] });

        } catch (error) {
            console.error('Error fetching bot info:', error);
            
            const errorEmbed = embedBuilder.createErrorEmbed(
                'Error Fetching Bot Info',
                'An error occurred while gathering bot information. Please try again later.'
            );
            
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};