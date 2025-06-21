const { SlashCommandBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause the currently playing audio'),

    usage: '/pause',
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

        const pauseEmbed = embedBuilder.createSuccessEmbed(
            'Audio Paused',
            `${embedBuilder.addEmoji('voice')} Playback has been paused.`
        );

        pauseEmbed.addFields(
            {
                name: '⏸️ Status',
                value: 'Paused',
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

        pauseEmbed.addFields({
            name: '🎵 Controls',
            value: 'Use `/resume` to continue playback',
            inline: false
        });

        pauseEmbed.setFooter({
            text: 'Audio controls ready for implementation',
            iconURL: interaction.user.displayAvatarURL()
        });

        // Get the audio player and pause playback
        if (interaction.client.audioPlayers) {
            const player = interaction.client.audioPlayers.get(interaction.guild.id);
            if (player) {
                player.pause();
            }
        }

        await interaction.reply({ embeds: [pauseEmbed] }); });
    }
};