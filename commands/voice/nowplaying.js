const { SlashCommandBuilder } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Display information about the currently playing song'),

    usage: '/nowplaying',
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

        // Mock current song for demonstration
        const currentSong = {
            title: 'Example Song Title',
            artist: 'Example Artist',
            duration: '4:32',
            currentTime: '2:15',
            requestedBy: interaction.user.username,
            thumbnail: 'https://via.placeholder.com/300x300/7289da/ffffff?text=Music'
        };

        const nowPlayingEmbed = embedBuilder.createInfoEmbed(
            'Now Playing',
            `${embedBuilder.addEmoji('voice')} Currently playing music`
        );

        nowPlayingEmbed.setThumbnail(currentSong.thumbnail);

        nowPlayingEmbed.addFields(
            {
                name: '🎵 Song',
                value: `**${currentSong.title}**\nby ${currentSong.artist}`,
                inline: false
            },
            {
                name: '⏱️ Progress',
                value: `${currentSong.currentTime} / ${currentSong.duration}`,
                inline: true
            },
            {
                name: '📍 Channel',
                value: botVoiceChannel.name,
                inline: true
            },
            {
                name: '👤 Requested by',
                value: currentSong.requestedBy,
                inline: true
            }
        );

        // Progress bar
        const progressPercent = 50; // Mock 50% progress
        const progressBar = '█'.repeat(Math.floor(progressPercent / 10)) + '░'.repeat(10 - Math.floor(progressPercent / 10));
        
        nowPlayingEmbed.addFields({
            name: '📊 Progress Bar',
            value: `\`${progressBar}\` ${progressPercent}%`,
            inline: false
        });

        nowPlayingEmbed.setFooter({
            text: 'Use /skip to skip this song',
            iconURL: interaction.client.user.displayAvatarURL()
        });

        await interaction.reply({ embeds: [nowPlayingEmbed] });
    }
};