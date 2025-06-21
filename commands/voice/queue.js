
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

        // Initialize queue if not exists
        if (!interaction.client.musicQueues) {
            interaction.client.musicQueues = new Map();
        }

        const guildQueue = interaction.client.musicQueues.get(interaction.guild.id) || [];

        switch (subcommand) {
            case 'view':
                const queueEmbed = embedBuilder.createInfoEmbed(
                    'Music Queue',
                    `${embedBuilder.addEmoji('voice')} Current queue status`
                );

                if (guildQueue.length === 0) {
                    queueEmbed.addFields({
                        name: '📭 Empty Queue',
                        value: 'No songs in queue. Use `/play` to add music!',
                        inline: false
                    });
                } else {
                    const queueList = guildQueue.slice(0, 10).map((song, index) => 
                        `**${index + 1}.** ${song.title} \`${song.duration || 'Unknown'}\` - ${song.requestedBy}`
                    ).join('\n');

                    queueEmbed.addFields({
                        name: `🎵 Queue (${guildQueue.length} songs)`,
                        value: queueList + (guildQueue.length > 10 ? `\n... and ${guildQueue.length - 10} more` : ''),
                        inline: false
                    });
                }

                queueEmbed.addFields(
                    {
                        name: '📍 Channel',
                        value: botVoiceChannel.name,
                        inline: true
                    },
                    {
                        name: '🔊 Status',
                        value: 'Ready',
                        inline: true
                    }
                );

                break;

            case 'clear':
                interaction.client.musicQueues.set(interaction.guild.id, []);
                
                const clearEmbed = embedBuilder.createSuccessEmbed(
                    'Queue Cleared',
                    `${embedBuilder.addEmoji('voice')} The music queue has been cleared.`
                );

                clearEmbed.addFields(
                    {
                        name: '🗑️ Action',
                        value: 'Queue cleared',
                        inline: true
                    },
                    {
                        name: '👤 Cleared by',
                        value: interaction.user.username,
                        inline: true
                    }
                );

                await interaction.reply({ embeds: [clearEmbed] });
                return;

            case 'shuffle':
                if (guildQueue.length < 2) {
                    const errorEmbed = embedBuilder.createErrorEmbed(
                        'Not Enough Songs',
                        'Need at least 2 songs in queue to shuffle!'
                    );
                    return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                }

                // Shuffle the queue
                for (let i = guildQueue.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [guildQueue[i], guildQueue[j]] = [guildQueue[j], guildQueue[i]];
                }

                interaction.client.musicQueues.set(interaction.guild.id, guildQueue);

                const shuffleEmbed = embedBuilder.createSuccessEmbed(
                    'Queue Shuffled',
                    `${embedBuilder.addEmoji('voice')} The music queue has been shuffled.`
                );

                shuffleEmbed.addFields(
                    {
                        name: '🔀 Action',
                        value: `Shuffled ${guildQueue.length} songs`,
                        inline: true
                    },
                    {
                        name: '👤 Shuffled by',
                        value: interaction.user.username,
                        inline: true
                    }
                );

                await interaction.reply({ embeds: [shuffleEmbed] });
                return;
        }

        await interaction.reply({ embeds: [queueEmbed] });
    }
};
