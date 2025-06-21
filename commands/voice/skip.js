
const { SlashCommandBuilder } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip the currently playing song')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Number of songs to skip (default: 1)')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(10)
        ),

    usage: '/skip [amount]',
    cooldown: 3000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        const skipAmount = interaction.options.getInteger('amount') || 1;

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

        // Get the audio player and stop current track
        if (interaction.client.audioPlayers) {
            const player = interaction.client.audioPlayers.get(interaction.guild.id);
            if (player) {
                player.stop();
            }
        }

        const skipEmbed = embedBuilder.createSuccessEmbed(
            skipAmount === 1 ? 'Song Skipped' : 'Songs Skipped',
            `${embedBuilder.addEmoji('voice')} Skipped ${skipAmount} song${skipAmount > 1 ? 's' : ''}.`
        );

        skipEmbed.addFields(
            {
                name: '⏭️ Action',
                value: `Skipped ${skipAmount} song${skipAmount > 1 ? 's' : ''}`,
                inline: true
            },
            {
                name: '📍 Channel',
                value: botVoiceChannel.name,
                inline: true
            },
            {
                name: '👤 Skipped by',
                value: interaction.user.username,
                inline: true
            }
        );

        skipEmbed.setFooter({
            text: 'Use /play to add more music',
            iconURL: interaction.user.displayAvatarURL()
        });

        await interaction.reply({ embeds: [skipEmbed] });
    }
};
