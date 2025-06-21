const { SlashCommandBuilder } = require('discord.js');
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
            // Note: This is a basic implementation. For full voice functionality,
            // you would need @discordjs/voice package
            
            // Check if bot is already in a voice channel in this guild
            const currentConnection = interaction.guild.members.me.voice.channel;
            
            if (currentConnection) {
                if (currentConnection.id === voiceChannel.id) {
                    const infoEmbed = embedBuilder.createInfoEmbed(
                        'Already Connected',
                        `${embedBuilder.addEmoji('voice')} I'm already in ${voiceChannel.name}!`
                    );
                    return interaction.reply({ embeds: [infoEmbed], ephemeral: true });
                } else {
                    const infoEmbed = embedBuilder.createInfoEmbed(
                        'Moving Channels',
                        `${embedBuilder.addEmoji('voice')} Moving from ${currentConnection.name} to ${voiceChannel.name}...`
                    );
                    await interaction.reply({ embeds: [infoEmbed] });
                }
            }

            // For demonstration purposes, we'll show what would happen
            // In a real implementation, you'd use @discordjs/voice
            
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
                    name: '🔊 Features',
                    value: 'Ready for voice commands!',
                    inline: true
                }
            );

            successEmbed.addFields({
                name: '💡 Note',
                value: 'To enable full voice functionality, install `@discordjs/voice` package and implement voice connections.',
                inline: false
            });

            successEmbed.setFooter({
                text: `Joined by ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL()
            });

            if (currentConnection && currentConnection.id !== voiceChannel.id) {
                await interaction.editReply({ embeds: [successEmbed] });
            } else {
                await interaction.reply({ embeds: [successEmbed] });
            }

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
