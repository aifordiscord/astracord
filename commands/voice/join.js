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

        try {
            // Initialize voice connections map if not exists
            if (!interaction.client.voiceConnections) {
                interaction.client.voiceConnections = new Map();
            }

            // Create voice connection
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });

            // Store the connection
            interaction.client.voiceConnections.set(interaction.guild.id, connection);

            // Wait for connection to be ready with longer timeout
            await entersState(connection, VoiceConnectionStatus.Ready, 30000);

            const successEmbed = embedBuilder.createSuccessEmbed(
                'Voice Channel Joined',
                `${embedBuilder.addEmoji('voice')} Successfully joined **${voiceChannel.name}**!`
            );

            successEmbed.addFields(
                {
                    name: '📍 Channel',
                    value: voiceChannel.name,
                    inline: true
                },
                {
                    name: '👥 Members',
                    value: `${voiceChannel.members.size} member(s)`,
                    inline: true
                },
                {
                    name: '🔊 Status',
                    value: 'Connected and ready!',
                    inline: true
                }
            );

            successEmbed.setFooter({
                text: `Joined by ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL()
            });

            await interaction.reply({ embeds: [successEmbed] });

        } catch (error) {
            console.error('Error joining voice channel:', error);

            const errorEmbed = embedBuilder.createErrorEmbed(
                'Connection Failed',
                'An error occurred while trying to join the voice channel. Please try again later.'
            );

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};