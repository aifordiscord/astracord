const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Timeout a member for a specified duration')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to timeout')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('Duration in minutes (1-10080)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(10080)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the timeout')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    usage: '/mute <user> <duration> [reason]',
    cooldown: 3000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        const targetUser = interaction.options.getUser('user');
        const duration = interaction.options.getInteger('duration');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (targetUser.id === interaction.user.id) {
            const errorEmbed = embedBuilder.createErrorEmbed(
                'Invalid Action',
                'You cannot timeout yourself!'
            );
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        if (targetUser.id === interaction.client.user.id) {
            const errorEmbed = embedBuilder.createErrorEmbed(
                'Invalid Action',
                'I cannot timeout myself!'
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
                    'You cannot timeout a member with equal or higher role than you.'
                );
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            if (targetMember.isCommunicationDisabled()) {
                const errorEmbed = embedBuilder.createErrorEmbed(
                    'User Already Timed Out',
                    'This user is already timed out.'
                );
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            const timeoutDuration = duration * 60 * 1000; // Convert minutes to milliseconds
            const timeoutUntil = new Date(Date.now() + timeoutDuration);

            await targetMember.timeout(timeoutDuration, `${reason} | Timed out by: ${interaction.user.username}`);

            // Send DM to user
            try {
                const dmEmbed = embedBuilder.createErrorEmbed(
                    `You have been timed out in ${interaction.guild.name}`,
                    `**Duration:** ${duration} minute(s)\n**Reason:** ${reason}\n**Moderator:** ${interaction.user.username}\n**Ends:** <t:${Math.floor(timeoutUntil.getTime() / 1000)}:F>`
                );
                await targetUser.send({ embeds: [dmEmbed] });
            } catch (error) {
                // User has DMs disabled
            }

            const successEmbed = embedBuilder.createSuccessEmbed(
                'User Timed Out Successfully',
                `${embedBuilder.addEmoji('moderation')} **${targetUser.username}** has been timed out for ${duration} minute(s).`
            );

            successEmbed.addFields(
                {
                    name: 'User',
                    value: `${targetUser.username} (${targetUser.id})`,
                    inline: true
                },
                {
                    name: 'Duration',
                    value: `${duration} minute(s)`,
                    inline: true
                },
                {
                    name: 'Ends',
                    value: `<t:${Math.floor(timeoutUntil.getTime() / 1000)}:R>`,
                    inline: true
                },
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

            await interaction.reply({ embeds: [successEmbed] });

        } catch (error) {
            console.error('Error timing out user:', error);
            
            const errorEmbed = embedBuilder.createErrorEmbed(
                'Timeout Failed',
                'An error occurred while timing out the user. Please check my permissions and try again.'
            );
            
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};