const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Adjust the bot\'s volume level')
        .addIntegerOption(option =>
            option.setName('level')
                .setDescription('Volume level (0-100)')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(100)
        ),

    usage: '/volume <level>',
    cooldown: 3000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        const volume = interaction.options.getInteger('level');

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
                `You need to be in the same voice channel (${botVoiceChannel.name}) to control volume!`
            );
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        let volumeEmoji;
        if (volume === 0) volumeEmoji = '🔇';
        else if (volume <= 30) volumeEmoji = '🔈';
        else if (volume <= 70) volumeEmoji = '🔉';
        else volumeEmoji = '🔊';

        const successEmbed = embedBuilder.createSuccessEmbed(
            'Volume Adjusted',
            `${embedBuilder.addEmoji('voice')} Volume set to **${volume}%**`
        );

        successEmbed.addFields(
            {
                name: `${volumeEmoji} Volume Level`,
                value: `${volume}%`,
                inline: true
            },
            {
                name: '📍 Channel',
                value: botVoiceChannel.name,
                inline: true
            },
            {
                name: '🎛️ Status',
                value: volume === 0 ? 'Muted' : 'Active',
                inline: true
            }
        );

        successEmbed.addFields({
            name: '💡 Note',
            value: 'To enable full audio functionality, install `@discordjs/voice` package and implement audio player.',
            inline: false
        });

        successEmbed.setFooter({
            text: `Volume adjusted by ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL()
        });

        await interaction.reply({ embeds: [successEmbed] });
    }
};