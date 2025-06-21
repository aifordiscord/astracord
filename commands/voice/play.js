const { SlashCommandBuilder } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play audio from a URL or search query')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('URL or search term for audio')
                .setRequired(true)
                .setMaxLength(500)
        ),

    usage: '/play <query>',
    cooldown: 5000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        const query = interaction.options.getString('query');

        const voiceChannel = interaction.member.voice.channel;
        
        if (!voiceChannel) {
            const errorEmbed = embedBuilder.createErrorEmbed(
                'No Voice Channel',
                'You need to be in a voice channel to play audio!'
            );
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        const permissions = voiceChannel.permissionsFor(interaction.guild.members.me);
        
        if (!permissions.has('Connect') || !permissions.has('Speak')) {
            const errorEmbed = embedBuilder.createErrorEmbed(
                'Missing Permissions',
                'I need permission to connect and speak in your voice channel!'
            );
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        const playEmbed = embedBuilder.createSuccessEmbed(
            'Audio Request Received',
            `${embedBuilder.addEmoji('voice')} Processing your request...`
        );

        playEmbed.addFields(
            {
                name: '🎵 Query',
                value: query,
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

        playEmbed.addFields({
            name: '💡 Implementation Note',
            value: 'To enable full audio playback, install `@discordjs/voice` and implement audio streaming. This command shows the structure for audio functionality.',
            inline: false
        });

        playEmbed.setFooter({
            text: 'Audio system ready for implementation',
            iconURL: interaction.client.user.displayAvatarURL()
        });

        await interaction.reply({ embeds: [playEmbed] });
    }
};