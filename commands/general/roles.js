const { SlashCommandBuilder } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roles')
        .setDescription('Display all roles in the server with member counts'),

    usage: '/roles',
    cooldown: 10000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();

        if (!interaction.guild) {
            const errorEmbed = embedBuilder.createErrorEmbed(
                'Server Only Command',
                'This command can only be used in a server!'
            );
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        try {
            const roles = interaction.guild.roles.cache
                .filter(role => role.id !== interaction.guild.id)
                .sort((a, b) => b.position - a.position)
                .array();

            const rolesEmbed = embedBuilder.createInfoEmbed(
                `${embedBuilder.addEmoji('info')} Server Roles`,
                `${roles.length} roles in ${interaction.guild.name}`
            );

            if (roles.length === 0) {
                rolesEmbed.addFields({
                    name: 'No Roles',
                    value: 'This server has no custom roles.',
                    inline: false
                });
            } else {
                const roleChunks = [];
                let currentChunk = '';

                for (const role of roles) {
                    const memberCount = role.members.size;
                    const roleInfo = `${role} - **${memberCount}** member${memberCount !== 1 ? 's' : ''}\n`;
                    
                    if ((currentChunk + roleInfo).length > 1024) {
                        roleChunks.push(currentChunk);
                        currentChunk = roleInfo;
                    } else {
                        currentChunk += roleInfo;
                    }
                }
                
                if (currentChunk) {
                    roleChunks.push(currentChunk);
                }

                roleChunks.forEach((chunk, index) => {
                    rolesEmbed.addFields({
                        name: index === 0 ? '🎭 Roles' : '\u200b',
                        value: chunk,
                        inline: false
                    });
                });
            }

            rolesEmbed.setFooter({
                text: `Total roles: ${roles.length} • Requested by ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL()
            });

            await interaction.reply({ embeds: [rolesEmbed] });

        } catch (error) {
            console.error('Error fetching roles:', error);
            
            const errorEmbed = embedBuilder.createErrorEmbed(
                'Error Fetching Roles',
                'An error occurred while fetching server roles. Please try again later.'
            );
            
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};