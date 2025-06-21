const { SlashCommandBuilder, ChannelType } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Display detailed bot and server statistics'),

    usage: '/stats',
    cooldown: 10000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        const client = interaction.client;

        try {
            const totalGuilds = client.guilds.cache.size;
            const totalUsers = client.users.cache.size;
            const totalChannels = client.channels.cache.size;
            const totalCommands = client.commands.size;
            
            const uptime = process.uptime();
            const uptimeString = `${Math.floor(uptime / 86400)}d ${Math.floor((uptime % 86400) / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`;
            
            const memoryUsage = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
            const ping = Math.round(client.ws.ping);

            const statsEmbed = embedBuilder.createInfoEmbed(
                `${embedBuilder.addEmoji('info')} Bot Statistics`,
                'Comprehensive statistics and performance metrics'
            );

            // Global bot stats
            statsEmbed.addFields(
                {
                    name: '🌐 Global Stats',
                    value: `**Servers:** ${totalGuilds}\n**Users:** ${totalUsers}\n**Channels:** ${totalChannels}\n**Commands:** ${totalCommands}`,
                    inline: true
                },
                {
                    name: '⚡ Performance',
                    value: `**Uptime:** ${uptimeString}\n**Memory:** ${memoryUsage}MB\n**Ping:** ${ping}ms\n**Shards:** ${client.ws.shards.size}`,
                    inline: true
                }
            );

            // Server-specific stats if in a guild
            if (interaction.guild) {
                const guild = interaction.guild;
                const channels = guild.channels.cache;
                const textChannels = channels.filter(c => c.type === ChannelType.GuildText).size;
                const voiceChannels = channels.filter(c => c.type === ChannelType.GuildVoice).size;
                const members = guild.members.cache;
                const bots = members.filter(m => m.user.bot).size;
                const humans = members.size - bots;

                statsEmbed.addFields({
                    name: '🏠 This Server',
                    value: `**Members:** ${guild.memberCount}\n**Humans:** ${humans}\n**Bots:** ${bots}\n**Text Channels:** ${textChannels}\n**Voice Channels:** ${voiceChannels}\n**Roles:** ${guild.roles.cache.size}`,
                    inline: true
                });
            }

            statsEmbed.setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 256 }));
            statsEmbed.setFooter({
                text: `Bot ID: ${client.user.id} • Requested by ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL()
            });

            await interaction.reply({ embeds: [statsEmbed] });

        } catch (error) {
            console.error('Error fetching stats:', error);
            
            const errorEmbed = embedBuilder.createErrorEmbed(
                'Error Fetching Statistics',
                'An error occurred while gathering statistics. Please try again later.'
            );
            
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};