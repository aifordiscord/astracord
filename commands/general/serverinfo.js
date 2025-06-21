const { SlashCommandBuilder, ChannelType } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Display detailed information about the current server'),

    usage: '/serverinfo',
    cooldown: 10000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        const guild = interaction.guild;

        if (!guild) {
            const errorEmbed = embedBuilder.createErrorEmbed(
                'Server Only Command',
                'This command can only be used in a server!'
            );
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        try {
            // Fetch guild data
            const owner = await guild.fetchOwner();
            const channels = guild.channels.cache;
            const roles = guild.roles.cache;
            const emojis = guild.emojis.cache;
            const members = guild.members.cache;

            // Count different channel types
            const textChannels = channels.filter(c => c.type === ChannelType.GuildText).size;
            const voiceChannels = channels.filter(c => c.type === ChannelType.GuildVoice).size;
            const categories = channels.filter(c => c.type === ChannelType.GuildCategory).size;

            // Fetch all members to get accurate count
            await guild.members.fetch();
            const updatedMembers = guild.members.cache;
            
            // Count member status
            const onlineMembers = updatedMembers.filter(m => m.presence?.status === 'online').size;
            const bots = updatedMembers.filter(m => m.user.bot).size;
            const humans = updatedMembers.size - bots;

            const serverEmbed = embedBuilder.createInfoEmbed(
                `${embedBuilder.addEmoji('info')} Server Information`,
                `Detailed information about **${guild.name}**`
            );

            serverEmbed.setThumbnail(guild.iconURL({ dynamic: true, size: 256 }));

            serverEmbed.addFields(
                {
                    name: '📋 Basic Info',
                    value: `**Name:** ${guild.name}\n**ID:** ${guild.id}\n**Owner:** ${owner.user.username}\n**Created:** <t:${Math.floor(guild.createdTimestamp / 1000)}:F>`,
                    inline: false
                },
                {
                    name: '👥 Members',
                    value: `**Total:** ${updatedMembers.size}\n**Humans:** ${humans}\n**Bots:** ${bots}\n**Online:** ${onlineMembers}`,
                    inline: true
                },
                {
                    name: '📺 Channels',
                    value: `**Text:** ${textChannels}\n**Voice:** ${voiceChannels}\n**Categories:** ${categories}\n**Total:** ${channels.size}`,
                    inline: true
                },
                {
                    name: '🎭 Server Features',
                    value: `**Roles:** ${roles.size}\n**Emojis:** ${emojis.size}\n**Boost Level:** ${guild.premiumTier}\n**Boosts:** ${guild.premiumSubscriptionCount || 0}`,
                    inline: true
                }
            );

            // Add server features if any
            const features = guild.features;
            if (features.length > 0) {
                const featureList = features.slice(0, 10).map(f => 
                    f.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                ).join(', ');
                
                serverEmbed.addFields({
                    name: '✨ Special Features',
                    value: featureList,
                    inline: false
                });
            }

            serverEmbed.setFooter({
                text: `Verification Level: ${guild.verificationLevel} • Requested by ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL()
            });

            if (guild.bannerURL()) {
                serverEmbed.setImage(guild.bannerURL({ dynamic: true, size: 1024 }));
            }

            await interaction.reply({ embeds: [serverEmbed] });

        } catch (error) {
            console.error('Error fetching server info:', error);
            
            const errorEmbed = embedBuilder.createErrorEmbed(
                'Error Fetching Server Info',
                'An error occurred while gathering server information. Please try again later.'
            );
            
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};