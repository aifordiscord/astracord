const { SlashCommandBuilder } = require('discord.js');
const { createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, joinVoiceChannel, entersState } = require('@discordjs/voice');
const ytdl = require('@distube/ytdl-core');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play audio from a YouTube URL')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('YouTube URL to play')
                .setRequired(true)
        ),

    usage: '/play <url>',
    cooldown: 5000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        const url = interaction.options.getString('url');

        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            const errorEmbed = embedBuilder.createErrorEmbed(
                'No Voice Channel',
                'You need to be in a voice channel to play music!'
            );
            return interaction.editReply({ embeds: [errorEmbed] });
        }

        const permissions = voiceChannel.permissionsFor(interaction.guild.members.me);

        if (!permissions.has('Connect')) {
            const errorEmbed = embedBuilder.createErrorEmbed(
                'Missing Permissions',
                'I don\'t have permission to connect to your voice channel!'
            );
            return interaction.editReply({ embeds: [errorEmbed] });
        }

        if (!permissions.has('Speak')) {
            const errorEmbed = embedBuilder.createErrorEmbed(
                'Missing Permissions',
                'I don\'t have permission to speak in your voice channel!'
            );
            return interaction.editReply({ embeds: [errorEmbed] });
        }

        // Validate YouTube URL with improved regex pattern
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)[\w-]+(&[\w=]*)?$/;

        if (!youtubeRegex.test(url)) {
            const errorEmbed = embedBuilder.createErrorEmbed(
                'Invalid YouTube URL',
                'Please provide a valid YouTube video URL!\n\nExample formats:\n• https://youtube.com/watch?v=VIDEO_ID\n• https://youtu.be/VIDEO_ID'
            );
            return interaction.reply({ embeds: [errorEmbed], flags: 64 });
        }

        // Additional validation with ytdl
        try {
            const isValid = ytdl.validateURL(url);
            if (!isValid) {
                const errorEmbed = embedBuilder.createErrorEmbed(
                    'Invalid YouTube URL',
                    'The provided URL is not a valid YouTube video URL!'
                );
                return interaction.editReply({ embeds: [errorEmbed] });
            }
        } catch (error) {
            console.error('URL validation error:', error);
            const errorEmbed = embedBuilder.createErrorEmbed(
                'URL Validation Failed',
                'Unable to validate the YouTube URL. Please try again.'
            );
            return interaction.editReply({ embeds: [errorEmbed] });
        }

        await interaction.deferReply();

        try {
            // Initialize voice connections map if not exists
            if (!interaction.client.voiceConnections) {
                interaction.client.voiceConnections = new Map();
            }

            // Get or create voice connection
            let connection = interaction.client.voiceConnections.get(interaction.guild.id);

            if (!connection || connection.state.status === VoiceConnectionStatus.Destroyed) {
                connection = joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: interaction.guild.id,
                    adapterCreator: interaction.guild.voiceAdapterCreator,
                });
                interaction.client.voiceConnections.set(interaction.guild.id, connection);
            }

            // Wait for connection to be ready with better error handling
            try {
                await entersState(connection, VoiceConnectionStatus.Ready, 15000);
            } catch (error) {
                console.error('Error joining voice channel:', error);

                // Clean up failed connection
                if (connection && connection.state.status !== VoiceConnectionStatus.Destroyed) {
                    connection.destroy();
                }
                interaction.client.voiceConnections.delete(interaction.guild.id);

                const errorEmbed = embedBuilder.createErrorEmbed(
                    'Playback Failed',
                    'Failed to play the audio. Please try again with a different URL.'
                );

                await interaction.editReply({ embeds: [errorEmbed] });
            }

            // Get video info with error handling
            let info, title;
            try {
                info = await ytdl.getInfo(url);
                title = info.videoDetails.title;
            } catch (error) {
                console.error('Error getting video info:', error);
                const errorEmbed = embedBuilder.createErrorEmbed(
                    'Video Info Error',
                    'Unable to get video information. The video might be private, age-restricted, or unavailable.'
                );
                return interaction.editReply({ embeds: [errorEmbed] });
            }

            // Create audio stream with improved options
            const stream = ytdl(url, {
                filter: 'audioonly',
                quality: 'highestaudio',
                highWaterMark: 1 << 25,
                dlChunkSize: 0
            });

            const resource = createAudioResource(stream, {
                inputType: 'arbitrary',
                inlineVolume: true
            });

            // Create or get audio player
            if (!interaction.client.audioPlayers) {
                interaction.client.audioPlayers = new Map();
            }

            let player = interaction.client.audioPlayers.get(interaction.guild.id);
            if (!player) {
                player = createAudioPlayer();
                interaction.client.audioPlayers.set(interaction.guild.id, player);
            }

            // Subscribe connection to player
            connection.subscribe(player);

            // Play the resource
            player.play(resource);

            const playEmbed = embedBuilder.createSuccessEmbed(
                'Now Playing',
                `${embedBuilder.addEmoji('voice')} **${title}**`
            );

            playEmbed.addFields(
                {
                    name: '🎵 Song',
                    value: title,
                    inline: false
                },
                {
                    name: '📍 Channel',
                    value: voiceChannel.name,
                    inline: true
                },
                {
                    name: '👤 Requested by',
                    value: interaction.user.username,
                    inline: true
                }
            );

            playEmbed.setFooter({
                text: 'Use /pause, /resume, /skip, or /stop to control playback',
                iconURL: interaction.client.user.displayAvatarURL()
            });

            await interaction.editReply({ embeds: [playEmbed] });

            // Handle player events
            player.on(AudioPlayerStatus.Idle, () => {
                console.log('Audio finished playing');
            });

            player.on('error', error => {
                console.error('Audio player error:', error);
            });

        } catch (error) {
            console.error('Error playing audio:', error);

            const errorEmbed = embedBuilder.createErrorEmbed(
                'Playback Failed',
                'An error occurred while trying to play the audio. Please check the URL and try again.'
            );

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};