const { SlashCommandBuilder } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check the bot\'s latency and API response time'),

    usage: '/ping',
    cooldown: 5000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        
        // Get initial timestamp
        const sent = await interaction.reply({
            embeds: [embedBuilder.createInfoEmbed(
                'Pinging...',
                `${embedBuilder.addEmoji('info')} Calculating latency...`
            )],
            fetchReply: true
        });

        // Calculate latencies
        const roundtripLatency = sent.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = Math.round(interaction.client.ws.ping);

        // Determine latency quality
        let latencyEmoji;
        let latencyColor;
        
        if (roundtripLatency < 100) {
            latencyEmoji = embedBuilder.addEmoji('right');
            latencyColor = 'success';
        } else if (roundtripLatency < 300) {
            latencyEmoji = '⚠️';
            latencyColor = 'warning';
        } else {
            latencyEmoji = '❌';
            latencyColor = 'error';
        }

        // Create response embed
        const responseEmbed = embedBuilder.createInfoEmbed(
            `${latencyEmoji} Pong!`,
            'Here are the current latency statistics:'
        );

        if (latencyColor === 'success') {
            responseEmbed.setColor(embedBuilder.embed.data.color = require('../../config.js').colors.success);
        } else if (latencyColor === 'warning') {
            responseEmbed.setColor(require('../../config.js').colors.warning);
        } else {
            responseEmbed.setColor(require('../../config.js').colors.error);
        }

        responseEmbed.addFields(
            {
                name: '🏓 Roundtrip Latency',
                value: `\`${roundtripLatency}ms\``,
                inline: true
            },
            {
                name: '💓 API Latency',
                value: `\`${apiLatency}ms\``,
                inline: true
            },
            {
                name: '📊 Status',
                value: roundtripLatency < 100 ? 'Excellent' : roundtripLatency < 300 ? 'Good' : 'Poor',
                inline: true
            }
        );

        responseEmbed.setFooter({
            text: `Requested by ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL()
        });

        await interaction.editReply({ embeds: [responseEmbed] });
    }
};
