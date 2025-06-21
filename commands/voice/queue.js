const { SlashCommandBuilder } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Display the current music queue')
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View the current queue')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('clear')
                .setDescription('Clear the entire queue')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('shuffle')
                .setDescription('Shuffle the queue')
        ),

    usage: '/queue <view|clear|shuffle>',
    cooldown: 3000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        const subcommand = interaction.options.getSubcommand();

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
                `You need to be in the same voice channel (${botVoiceChannel.name}) to manage the queue!`
            );
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        // Mock queue for demonstration
        const mockQueue = [
            { title: 'Song 1', duration: '3:45', requestedBy: 'User1' },
            { title: 'Song 2', duration: '4:20', requestedBy: 'User2' },
            { title: 'Song 3', duration: '2:58', requestedBy: 'User3' }
        ];

        switch (subcommand) {
            case 'view':
                const queueEmbed = embedBuilder.createInfoEmbed(
                    'Music Queue',
                    `${embedBuilder.addEmoji('voice')} Current queue status`
                );

                if (mockQueue.length === 0) {
                    queueEmbed.addFields({
                        name: '📭 Empty Queue',
                        value: 'No songs in queue. Use `/play` to add music!',
                        inline: false
                    });
                } else {
                    const queueList = mockQueue.map((song, index) => 
                        `**${index + 1}.** ${song.title} \`${song.duration}\` - ${song.requestedBy}`
                    ).join('\n');

                    queueEmbed.addFields(
                        {
                            name: '🎵 Upcoming Songs',
                            value: queueList,
                            inline: false
                        },
                        {
                            name: '📊 Queue Info',
                            value: `${mockQueue.length} songs | Total duration: ~11:03`,
                            inline: false
                        }
                    );
                }
                break;

            case 'clear':
                const clearEmbed = embedBuilder.createSuccessEmbed(
                    'Queue Cleared',
                    `${embedBuilder.addEmoji('voice')} All songs removed from queue.`
                );
                clearEmbed.addFields({
                    name: '🗑️ Action',
                    value: `Queue cleared by ${interaction.user.username}`,
                    inline: false
                });
                return interaction.reply({ embeds: [clearEmbed] });

            case 'shuffle':
                const shuffleEmbed = embedBuilder.createSuccessEmbed(
                    'Queue Shuffled',
                    `${embedBuilder.addEmoji('voice')} Queue order randomized.`
                );
                shuffleEmbed.addFields({
                    name: '🔀 Action',
                    value: `Queue shuffled by ${interaction.user.username}`,
                    inline: false
                });
                return interaction.reply({ embeds: [shuffleEmbed] });
        }

        await interaction.reply({ embeds: [queueEmbed] });
    }
};