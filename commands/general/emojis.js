const { SlashCommandBuilder } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('emojis')
        .setDescription('Display all custom emojis in the server')
        .addStringOption(option =>
            option.setName('search')
                .setDescription('Search for specific emoji by name')
                .setRequired(false)
        ),

    usage: '/emojis [search]',
    cooldown: 5000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        const searchTerm = interaction.options.getString('search');

        if (!interaction.guild) {
            const errorEmbed = embedBuilder.createErrorEmbed(
                'Server Only Command',
                'This command can only be used in a server!'
            );
            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        try {
            let emojis = interaction.guild.emojis.cache;

            if (searchTerm) {
                emojis = emojis.filter(emoji => 
                    emoji.name.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }

            const emojiArray = Array.from(emojis.values());

            const emojisEmbed = embedBuilder.createInfoEmbed(
                `${embedBuilder.addEmoji('fun')} Server Emojis`,
                searchTerm ? 
                    `Found ${emojiArray.length} emoji${emojiArray.length !== 1 ? 's' : ''} matching "${searchTerm}"` :
                    `${emojiArray.length} custom emoji${emojiArray.length !== 1 ? 's' : ''} in ${interaction.guild.name}`
            );

            if (emojiArray.length === 0) {
                emojisEmbed.addFields({
                    name: searchTerm ? 'No Results' : 'No Emojis',
                    value: searchTerm ? 
                        `No emojis found matching "${searchTerm}"` :
                        'This server has no custom emojis.',
                    inline: false
                });
            } else {
                const emojiChunks = [];
                let currentChunk = '';

                for (const emoji of emojiArray) {
                    const emojiInfo = `${emoji} \`:${emoji.name}:\`\n`;
                    
                    if ((currentChunk + emojiInfo).length > 1024) {
                        emojiChunks.push(currentChunk);
                        currentChunk = emojiInfo;
                    } else {
                        currentChunk += emojiInfo;
                    }
                }
                
                if (currentChunk) {
                    emojiChunks.push(currentChunk);
                }

                emojiChunks.forEach((chunk, index) => {
                    emojisEmbed.addFields({
                        name: index === 0 ? '😀 Emojis' : '\u200b',
                        value: chunk,
                        inline: false
                    });
                });
            }

            emojisEmbed.setFooter({
                text: `${searchTerm ? `Search: "${searchTerm}" • ` : ''}Requested by ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL()
            });

            await interaction.reply({ embeds: [emojisEmbed] });

        } catch (error) {
            console.error('Error fetching emojis:', error);
            
            const errorEmbed = embedBuilder.createErrorEmbed(
                'Error Fetching Emojis',
                'An error occurred while fetching server emojis. Please try again later.'
            );
            
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
};