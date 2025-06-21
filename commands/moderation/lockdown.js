const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lockdown')
        .setDescription('Lock or unlock a channel to prevent/allow message sending')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Lock or unlock the channel')
                .setRequired(true)
                .addChoices(
                    { name: 'Lock', value: 'lock' },
                    { name: 'Unlock', value: 'unlock' }
                )
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the lockdown')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    usage: '/lockdown <action> [reason]',
    cooldown: 5000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        const action = interaction.options.getString('action');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        try {
            const channel = interaction.channel;
            const everyoneRole = interaction.guild.roles.everyone;

            if (action === 'lock') {
                await channel.permissionOverwrites.edit(everyoneRole, {
                    SendMessages: false
                });

                const lockEmbed = embedBuilder.createErrorEmbed(
                    'Channel Locked',
                    `${embedBuilder.addEmoji('moderation')} This channel has been locked.`
                );

                lockEmbed.addFields(
                    {
                        name: 'Moderator',
                        value: interaction.user.username,
                        inline: true
                    },
                    {
                        name: 'Reason',
                        value: reason,
                        inline: false
                    }
                );

                await interaction.reply({ embeds: [lockEmbed] });

            } else {
                await channel.permissionOverwrites.edit(everyoneRole, {
                    SendMessages: null
                });

                const unlockEmbed = embedBuilder.createSuccessEmbed(
                    'Channel Unlocked',
                    `${embedBuilder.addEmoji('moderation')} This channel has been unlocked.`
                );

                unlockEmbed.addFields(
                    {
                        name: 'Moderator',
                        value: interaction.user.username,
                        inline: true
                    },
                    {
                        name: 'Reason',
                        value: reason,
                        inline: false
                    }
                );

                await interaction.reply({ embeds: [unlockEmbed] });
            }

        } catch (error) {
            console.error('Error with lockdown:', error);
            
            const errorEmbed = embedBuilder.createErrorEmbed(
                'Lockdown Failed',
                'An error occurred while modifying channel permissions. Please check my permissions and try again.'
            );
            
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};