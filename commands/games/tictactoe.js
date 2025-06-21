const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tictactoe')
        .setDescription('Play Tic-Tac-Toe against the bot')
        .addStringOption(option =>
            option.setName('difficulty')
                .setDescription('Choose bot difficulty')
                .setRequired(false)
                .addChoices(
                    { name: 'Easy', value: 'easy' },
                    { name: 'Medium', value: 'medium' },
                    { name: 'Hard', value: 'hard' }
                )
        ),

    usage: '/tictactoe [difficulty]',
    cooldown: 10000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        const difficulty = interaction.options.getString('difficulty') || 'medium';

        let board = Array(9).fill('⬜');
        const playerSymbol = '❌';
        const botSymbol = '⭕';

        function createBoard() {
            const rows = [];
            for (let i = 0; i < 3; i++) {
                const row = new ActionRowBuilder();
                for (let j = 0; j < 3; j++) {
                    const index = i * 3 + j;
                    row.addComponents(
                        new ButtonBuilder()
                            .setCustomId(`ttt_${index}`)
                            .setEmoji(board[index])
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(board[index] !== '⬜')
                    );
                }
                rows.push(row);
            }
            return rows;
        }

        function checkWinner() {
            const winPatterns = [
                [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
                [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
                [0, 4, 8], [2, 4, 6] // diagonals
            ];

            for (const pattern of winPatterns) {
                const [a, b, c] = pattern;
                if (board[a] !== '⬜' && board[a] === board[b] && board[b] === board[c]) {
                    return board[a];
                }
            }

            return board.includes('⬜') ? null : 'tie';
        }

        function getBotMove() {
            const availableSpots = board.map((cell, index) => cell === '⬜' ? index : null).filter(val => val !== null);
            
            if (difficulty === 'easy') {
                return availableSpots[Math.floor(Math.random() * availableSpots.length)];
            }

            // Medium/Hard AI: Check for winning moves and blocking moves
            const winPatterns = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
            
            // Check for winning move
            for (const pattern of winPatterns) {
                const [a, b, c] = pattern;
                const line = [board[a], board[b], board[c]];
                if (line.filter(cell => cell === botSymbol).length === 2 && line.includes('⬜')) {
                    return pattern[line.indexOf('⬜')];
                }
            }

            // Check for blocking move
            for (const pattern of winPatterns) {
                const [a, b, c] = pattern;
                const line = [board[a], board[b], board[c]];
                if (line.filter(cell => cell === playerSymbol).length === 2 && line.includes('⬜')) {
                    return pattern[line.indexOf('⬜')];
                }
            }

            // For hard difficulty, prefer center and corners
            if (difficulty === 'hard') {
                if (board[4] === '⬜') return 4; // center
                const corners = [0, 2, 6, 8].filter(i => board[i] === '⬜');
                if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];
            }

            return availableSpots[Math.floor(Math.random() * availableSpots.length)];
        }

        function updateGameEmbed() {
            const winner = checkWinner();
            let title, description, color;

            if (winner === playerSymbol) {
                title = 'You Won!';
                description = 'Congratulations! You beat the bot!';
                color = 'success';
            } else if (winner === botSymbol) {
                title = 'Bot Wins!';
                description = 'Better luck next time!';
                color = 'error';
            } else if (winner === 'tie') {
                title = 'It\'s a Tie!';
                description = 'Good game! Nobody wins this round.';
                color = 'info';
            } else {
                title = 'Tic-Tac-Toe';
                description = `Your turn! You are ${playerSymbol}`;
                color = 'info';
            }

            const gameEmbed = color === 'success' ? 
                embedBuilder.createSuccessEmbed(title, `${embedBuilder.addEmoji('games')} ${description}`) :
                color === 'error' ?
                embedBuilder.createErrorEmbed(title, description) :
                embedBuilder.createInfoEmbed(title, `${embedBuilder.addEmoji('games')} ${description}`);

            gameEmbed.addFields({
                name: '🎮 Game Board',
                value: `${board[0]}${board[1]}${board[2]}\n${board[3]}${board[4]}${board[5]}\n${board[6]}${board[7]}${board[8]}`,
                inline: false
            });

            return { embed: gameEmbed, gameOver: winner !== null };
        }

        const initialUpdate = updateGameEmbed();
        await interaction.reply({ embeds: [initialUpdate.embed], components: createBoard() });

        const filter = (i) => i.customId.startsWith('ttt_') && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 300000 });

        collector.on('collect', async (i) => {
            const position = parseInt(i.customId.split('_')[1]);
            board[position] = playerSymbol;

            let update = updateGameEmbed();
            if (!update.gameOver) {
                const botMove = getBotMove();
                if (botMove !== undefined) {
                    board[botMove] = botSymbol;
                    update = updateGameEmbed();
                }
            }

            const components = update.gameOver ? [] : createBoard();
            await i.update({ embeds: [update.embed], components });

            if (update.gameOver) {
                collector.stop();
            }
        });

        collector.on('end', async () => {
            // Game ended
        });
    }
};