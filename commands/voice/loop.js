const { SlashCommandBuilder } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Toggle loop mode for music playback')
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('Select loop mode')
                .setRequired(false)
                .addChoices(
                    { name: 'Off', value: 'off' },
                    { name: 'Current Song', value: 'song' },
                    { name: 'Queue', value: 'queue' }
                )
        ),

    usage: '/loop [mode]',
    cooldown: 3000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        const mode = interaction.options.getString('mode') || 'off';

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
                `You need to be in the same voice channel (${botVoiceChannel.name}) to control loop settings!`
            );
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        let loopEmoji, loopDescription;
        switch (mode) {
            case 'off':
                loopEmoji = '⏹️';
                loopDescription = 'Loop mode disabled';
                break;
            case 'song':
                loopEmoji = '🔂';
                loopDescription = 'Current song will repeat';
                break;
            case 'queue':
                loopEmoji = '🔁';
                loopDescription = 'Entire queue will repeat';
                break;
        }

        const loopEmbed = embedBuilder.createSuccessEmbed(
            'Loop Mode Updated',
            `${embedBuilder.addEmoji('voice')} ${loopDescription}`
        );

        loopEmbed.addFields(
            {
                name: `${loopEmoji} Loop Mode`,
                value: mode.charAt(0).toUpperCase() + mode.slice(1),
                inline: true
            },
            {
                name: '📍 Channel',
                value: botVoiceChannel.name,
                inline: true
            },
            {
                name: '👤 Set by',
                value: interaction.user.username,
                inline: true
            }
        );

        loopEmbed.setFooter({
            text: 'Use /loop to cycle through modes',
            iconURL: interaction.user.displayAvatarURL()
        });

        await interaction.reply({ embeds: [loopEmbed] });
    }
};