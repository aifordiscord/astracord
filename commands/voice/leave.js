
const { SlashCommandBuilder } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Leave the current voice channel'),

    usage: '/leave',
    cooldown: 5000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();

        // Check if bot is in a voice channel
        const botVoiceChannel = interaction.guild.members.me.voice.channel;
        
        if (!botVoiceChannel) {
            const errorEmbed = embedBuilder.createErrorEmbed(
                'Not in Voice Channel',
                'I\'m not currently in a voice channel!'
            );
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        // Check if user is in the same voice channel (optional security check)
        const userVoiceChannel = interaction.member.voice.channel;
        
        if (userVoiceChannel && userVoiceChannel.id !== botVoiceChannel.id) {
            const warningEmbed = embedBuilder.createErrorEmbed(
                'Different Voice Channel',
                `You need to be in the same voice channel (${botVoiceChannel.name}) to make me leave!`
            );
            return interaction.reply({ embeds: [warningEmbed], ephemeral: true });
        }

        try {
            const channelName = botVoiceChannel.name;
            
            // Destroy voice connection
            const connection = interaction.client.voiceConnections?.get(interaction.guild.id);
            if (connection) {
                connection.destroy();
                interaction.client.voiceConnections.delete(interaction.guild.id);
            }

            // Stop audio player
            const player = interaction.client.audioPlayers?.get(interaction.guild.id);
            if (player) {
                player.stop();
                interaction.client.audioPlayers.delete(interaction.guild.id);
            }
            
            const successEmbed = embedBuilder.createSuccessEmbed(
                'Voice Channel Left',
                `${embedBuilder.addEmoji('voice')} Successfully left **${channelName}**!`
            );

            successEmbed.addFields(
                {
                    name: '📍 Left Channel',
                    value: channelName,
                    inline: true
                },
                {
                    name: '👋 Status',
                    value: 'Disconnected',
                    inline: true
                },
                {
                    name: '⏱️ Session',
                    value: 'Ended',
                    inline: true
                }
            );

            successEmbed.setFooter({
                text: `Disconnected by ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL()
            });

            await interaction.reply({ embeds: [successEmbed] });

        } catch (error) {
            console.error('Error leaving voice channel:', error);
            
            const errorEmbed = embedBuilder.createErrorEmbed(
                'Disconnect Failed',
                'An error occurred while trying to leave the voice channel. Please try again later.'
            );
            
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};
