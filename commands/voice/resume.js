const { SlashCommandBuilder } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resume paused audio playback'),

    usage: '/resume',
    cooldown: 3000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();

        const botVoiceChannel = interaction.guild.members.me.voice.channel;
        
        if (!botVoiceChannel) {
            const errorEmbed = embedBuilder.createErrorEmbed(
                'Not in Voice Channel',
                'I\'m not currently in a voice channel!'
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

        // Get the audio player and resume playback
        if (interaction.client.audioPlayers) {
            const player = interaction.client.audioPlayers.get(interaction.guild.id);
            if (player) {
                player.unpause();
            }
        }

        const resumeEmbed = embedBuilder.createSuccessEmbed(
            'Audio Resumed',
            `${embedBuilder.addEmoji('voice')} Playback has been resumed.`
        );

        resumeEmbed.addFields(
            {
                name: '▶️ Status',
                value: 'Playing',
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

        resumeEmbed.setFooter({
            text: 'Use /pause to pause playback again',
            iconURL: interaction.user.displayAvatarURL()
        });

        // Get the audio player and resume playback
        if (interaction.client.audioPlayers) {
            const player = interaction.client.audioPlayers.get(interaction.guild.id);
            if (player) {
                player.unpause();
            }
        }

        await interaction.reply({ embeds: [resumeEmbed] });
    }
};