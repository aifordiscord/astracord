const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Join your current voice channel'),

    usage: '/join',
    cooldown: 5000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();

        // Check if user is in a voice channel
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            const errorEmbed = embedBuilder.createErrorEmbed(
                'No Voice Channel',
                'You need to be in a voice channel for me to join!'
            );
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        // Check permissions
        const permissions = voiceChannel.permissionsFor(interaction.guild.members.me);

        if (!permissions.has('Connect')) {
            const errorEmbed = embedBuilder.createErrorEmbed(
                'Missing Permissions',
                'I don\'t have permission to connect to your voice channel!'
            );
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        if (!permissions.has('Speak')) {
            const errorEmbed = embedBuilder.createErrorEmbed(
                'Missing Permissions',
                'I don\'t have permission to speak in your voice channel!'
            );
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        await interaction.deferReply();

        try {
            // Initialize voice connections map if not exists
            if (!interaction.client.voiceConnections) {
                interaction.client.voiceConnections = new Map();
            }

            // Check if already connected to this channel
            const existingConnection = interaction.client.voiceConnections.get(interaction.guild.id);
            if (existingConnection && existingConnection.joinConfig.channelId === voiceChannel.id) {
                const alreadyConnectedEmbed = embedBuilder.createInfoEmbed(
                    'Already Connected',
                    `${embedBuilder.addEmoji('voice')} I'm already connected to ${voiceChannel.name}!`
                );
                return interaction.editReply({ embeds: [alreadyConnectedEmbed] });
            }

            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });

            // Store the connection
            interaction.client.voiceConnections.set(interaction.guild.id, connection);

            // Wait for connection to be ready
            await entersState(connection, VoiceConnectionStatus.Ready, 15000);

            const joinEmbed = embedBuilder.createSuccessEmbed(
                'Joined Voice Channel',
                `${embedBuilder.addEmoji('voice')} Successfully joined ${voiceChannel.name}!`
            );

            joinEmbed.addFields(
                {
                    name: '📍 Channel',
                    value: voiceChannel.name,
                    inline: true
                },
                {
                    name: '👥 Members',
                    value: voiceChannel.members.size.toString(),
                    inline: true
                },
                {
                    name: '🎵 Ready for',
                    value: 'Music playback',
                    inline: true
                }
            );

            joinEmbed.setFooter({
                text: 'Use /play to start playing music!',
                iconURL: interaction.client.user.displayAvatarURL()
            });

            await interaction.editReply({ embeds: [joinEmbed] });

        } catch (error) {
            console.error('Error joining voice channel:', error);

            // Clean up failed connection
            if (interaction.client.voiceConnections) {
                const connection = interaction.client.voiceConnections.get(interaction.guild.id);
                if (connection && connection.state.status !== VoiceConnectionStatus.Destroyed) {
                    connection.destroy();
                }
                interaction.client.voiceConnections.delete(interaction.guild.id);
            }

            const errorEmbed = embedBuilder.createErrorEmbed(
                'Connection Failed',
                'Failed to connect to the voice channel. Please make sure the bot has proper permissions and try again.'
            );

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};