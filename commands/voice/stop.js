const { SlashCommandBuilder } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop audio playback and clear the queue'),

    usage: '/stop',
    cooldown: 3000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();

        const botVoiceChannel = interaction.guild.members.me.voice.channel;
        
        if (!botVoiceChannel) {
            const errorEmbed = embedBuilder.createErrorEmbed(
                'Not Playing Audio',
                'I\'m not currently playing any audio!'
            );
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        const userVoiceChannel = interaction.member.voice.channel;
        
        if (!userVoiceChannel || userVoiceChannel.id !== botVoiceChannel.id) {
            const errorEmbed = embedBuilder.createErrorEmbed(
                'Different Voice Channel',
                `You need to be in the same voice channel (${botVoiceChannel.name}) to control playback!`
            );
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        // Stop the audio player
        if (interaction.client.audioPlayers) {
            const player = interaction.client.audioPlayers.get(interaction.guild.id);
            if (player) {
                player.stop();
            }
        }

        const stopEmbed = embedBuilder.createSuccessEmbed(
            'Audio Stopped',
            `${embedBuilder.addEmoji('voice')} Playback stopped and queue cleared.`
        );

        stopEmbed.addFields(
            {
                name: '⏹️ Status',
                value: 'Stopped',
                inline: true
            },
            {
                name: '📍 Channel',
                value: botVoiceChannel.name,
                inline: true
            },
            {
                name: '👤 Action by',
                value: interaction.user.username,
                inline: true
            }
        );

        stopEmbed.addFields({
            name: '🗑️ Queue',
            value: 'Cleared',
            inline: true
        });

        stopEmbed.setFooter({
            text: `Stopped by ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL()
        });

        await interaction.reply({ embeds: [stopEmbed] });
    }
};