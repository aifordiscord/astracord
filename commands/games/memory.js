const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('memory')
        .setDescription('Play a memory matching game with emojis')
        .addStringOption(option =>
            option.setName('size')
                .setDescription('Grid size for the game')
                .setRequired(false)
                .addChoices(
                    { name: '2x2 (Easy)', value: '2x2' },
                    { name: '3x2 (Medium)', value: '3x2' },
                    { name: '4x2 (Hard)', value: '4x2' }
                )
        ),

    usage: '/memory [size]',
    cooldown: 10000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        const size = interaction.options.getString('size') || '3x2';
        
        const [cols, rows] = size.split('x').map(Number);
        const totalCards = cols * rows;
        
        const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐸'];
        const gameEmojis = emojis.slice(0, totalCards / 2);
        const cards = [...gameEmojis, ...gameEmojis].sort(() => Math.random() - 0.5);
        
        let revealed = Array(totalCards).fill(false);
        let matched = Array(totalCards).fill(false);
        let flippedCards = [];
        let moves = 0;

        function createButtons() {
            const components = [];
            for (let row = 0; row < rows; row++) {
                const actionRow = new ActionRowBuilder();
                for (let col = 0; col < cols; col++) {
                    const index = row * cols + col;
                    actionRow.addComponents(
                        new ButtonBuilder()
                            .setCustomId(`memory_${index}`)
                            .setEmoji(revealed[index] || matched[index] ? cards[index] : '❓')
                            .setStyle(matched[index] ? ButtonStyle.Success : ButtonStyle.Secondary)
                            .setDisabled(matched[index] || revealed[index])
                    );
                }
                components.push(actionRow);
            }
            return components;
        }

        function updateGameEmbed() {
            const matchedPairs = matched.filter(m => m).length / 2;
            const totalPairs = totalCards / 2;
            const isGameWon = matchedPairs === totalPairs;

            let title, description, color;
            if (isGameWon) {
                title = 'Memory Game Complete!';
                description = `Congratulations! You found all pairs in ${moves} moves!`;
                color = 'success';
            } else {
                title = 'Memory Game';
                description = `Find the matching pairs! ${matchedPairs}/${totalPairs} pairs found`;
                color = 'info';
            }

            const gameEmbed = color === 'success' ? 
                embedBuilder.createSuccessEmbed(title, `${embedBuilder.addEmoji('games')} ${description}`) :
                embedBuilder.createInfoEmbed(title, `${embedBuilder.addEmoji('games')} ${description}`);

            gameEmbed.addFields(
                {
                    name: '🎯 Progress',
                    value: `Pairs found: ${matchedPairs}/${totalPairs}`,
                    inline: true
                },
                {
                    name: '📊 Moves',
                    value: `${moves}`,
                    inline: true
                }
            );

            return { embed: gameEmbed, gameOver: isGameWon };
        }

        const initialUpdate = updateGameEmbed();
        await interaction.reply({ embeds: [initialUpdate.embed], components: createButtons() });

        const filter = (i) => i.customId.startsWith('memory_') && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 300000 });

        collector.on('collect', async (i) => {
            const index = parseInt(i.customId.split('_')[1]);
            
            if (flippedCards.length < 2) {
                revealed[index] = true;
                flippedCards.push(index);
                
                if (flippedCards.length === 2) {
                    moves++;
                    const [first, second] = flippedCards;
                    
                    if (cards[first] === cards[second]) {
                        matched[first] = true;
                        matched[second] = true;
                        flippedCards = [];
                        revealed = Array(totalCards).fill(false);
                    } else {
                        setTimeout(async () => {
                            revealed = Array(totalCards).fill(false);
                            flippedCards = [];
                            
                            const update = updateGameEmbed();
                            const components = update.gameOver ? [] : createButtons();
                            
                            try {
                                await interaction.editReply({ embeds: [update.embed], components });
                            } catch (error) {
                                // Interaction may have expired
                            }
                        }, 2000);
                    }
                }
            }

            const update = updateGameEmbed();
            const components = update.gameOver ? [] : createButtons();
            
            await i.update({ embeds: [update.embed], components });
            
            if (update.gameOver) {
                collector.stop();
            }
        });
    }
};