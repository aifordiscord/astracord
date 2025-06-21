const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a member with an optional reason')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to warn')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the warning')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    usage: '/warn <user> [reason]',
    cooldown: 3000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        const targetUser = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (targetUser.id === interaction.user.id) {
            const errorEmbed = embedBuilder.createErrorEmbed(
                'Invalid Action',
                'You cannot warn yourself!'
            );
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        if (targetUser.id === interaction.client.user.id) {
            const errorEmbed = embedBuilder.createErrorEmbed(
                'Invalid Action',
                'I cannot warn myself!'
            );
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        try {
            const targetMember = await interaction.guild.members.fetch(targetUser.id);
            
            if (!targetMember) {
                const errorEmbed = embedBuilder.createErrorEmbed(
                    'User Not Found',
                    'This user is not a member of this server.'
                );
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            if (targetMember.roles.highest.position >= interaction.member.roles.highest.position) {
                const errorEmbed = embedBuilder.createErrorEmbed(
                    'Insufficient Permissions',
                    'You cannot warn a member with equal or higher role than you.'
                );
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            // Store warning (in a real bot, you'd use a database)
            const warningsDir = path.join(__dirname, '../../data/warnings');
            if (!fs.existsSync(warningsDir)) {
                fs.mkdirSync(warningsDir, { recursive: true });
            }

            const warningData = {
                userId: targetUser.id,
                moderator: interaction.user.id,
                reason: reason,
                timestamp: Date.now(),
                guildId: interaction.guild.id
            };

            const userWarningsFile = path.join(warningsDir, `${targetUser.id}.json`);
            let warnings = [];
            
            if (fs.existsSync(userWarningsFile)) {
                warnings = JSON.parse(fs.readFileSync(userWarningsFile, 'utf8'));
            }
            
            warnings.push(warningData);
            fs.writeFileSync(userWarningsFile, JSON.stringify(warnings, null, 2));

            // Send DM to user
            try {
                const dmEmbed = embedBuilder.createErrorEmbed(
                    `You have been warned in ${interaction.guild.name}`,
                    `**Reason:** ${reason}\n**Moderator:** ${interaction.user.username}\n**Warning #:** ${warnings.length}`
                );
                await targetUser.send({ embeds: [dmEmbed] });
            } catch (error) {
                // User has DMs disabled
            }

            const successEmbed = embedBuilder.createSuccessEmbed(
                'User Warned Successfully',
                `${embedBuilder.addEmoji('moderation')} **${targetUser.username}** has been warned.`
            );

            successEmbed.addFields(
                {
                    name: 'User',
                    value: `${targetUser.username} (${targetUser.id})`,
                    inline: true
                },
                {
                    name: 'Moderator',
                    value: interaction.user.username,
                    inline: true
                },
                {
                    name: 'Warning Count',
                    value: `${warnings.length}`,
                    inline: true
                },
                {
                    name: 'Reason',
                    value: reason,
                    inline: false
                }
            );

            await interaction.reply({ embeds: [successEmbed] });

        } catch (error) {
            console.error('Error warning user:', error);
            
            const errorEmbed = embedBuilder.createErrorEmbed(
                'Warning Failed',
                'An error occurred while warning the user. Please try again later.'
            );
            
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};