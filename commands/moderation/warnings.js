const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('View warnings for a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to check warnings for')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    usage: '/warnings <user>',
    cooldown: 3000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        const targetUser = interaction.options.getUser('user');

        try {
            const warningsDir = path.join(__dirname, '../../data/warnings');
            const userWarningsFile = path.join(warningsDir, `${targetUser.id}.json`);
            
            let warnings = [];
            if (fs.existsSync(userWarningsFile)) {
                warnings = JSON.parse(fs.readFileSync(userWarningsFile, 'utf8'));
            }

            const warningsEmbed = embedBuilder.createInfoEmbed(
                `${embedBuilder.addEmoji('moderation')} Warning History`,
                `Warnings for ${targetUser.username}`
            );

            warningsEmbed.setThumbnail(targetUser.displayAvatarURL({ dynamic: true }));

            if (warnings.length === 0) {
                warningsEmbed.addFields({
                    name: 'No Warnings',
                    value: 'This user has no warnings.',
                    inline: false
                });
            } else {
                warnings.slice(0, 10).forEach((warning, index) => {
                    const moderator = interaction.client.users.cache.get(warning.moderator);
                    warningsEmbed.addFields({
                        name: `Warning #${index + 1}`,
                        value: `**Reason:** ${warning.reason}\n**Moderator:** ${moderator ? moderator.username : 'Unknown'}\n**Date:** <t:${Math.floor(warning.timestamp / 1000)}:F>`,
                        inline: false
                    });
                });

                if (warnings.length > 10) {
                    warningsEmbed.addFields({
                        name: 'Additional Warnings',
                        value: `And ${warnings.length - 10} more warning(s)...`,
                        inline: false
                    });
                }
            }

            warningsEmbed.addFields({
                name: 'Total Warnings',
                value: `${warnings.length}`,
                inline: true
            });

            warningsEmbed.setFooter({
                text: `User ID: ${targetUser.id} • Requested by ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL()
            });

            await interaction.reply({ embeds: [warningsEmbed] });

        } catch (error) {
            console.error('Error fetching warnings:', error);
            
            const errorEmbed = embedBuilder.createErrorEmbed(
                'Error Fetching Warnings',
                'An error occurred while fetching user warnings. Please try again later.'
            );
            
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};