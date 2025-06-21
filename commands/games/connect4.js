const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('connect4')
        .setDescription('Play Connect 4 against the bot'),

    usage: '/connect4',
    cooldown: 15000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        const ROWS = 6;
        const COLS = 7;
        let board = Array(ROWS).fill().map(() => Array(COLS).fill('⬜'));
        const playerPiece = '🔴';
        const botPiece = '🟡';

        function createButtons() {
            const row = new ActionRowBuilder();
            for (let col = 0; col < COLS; col++) {
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`c4_${col}`)
                        .setLabel(`${col + 1}`)
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(board[0][col] !== '⬜')
                );
            }
            return [row];
        }

        function dropPiece(col, piece) {
            for (let row = ROWS - 1; row >= 0; row--) {
                if (board[row][col] === '⬜') {
                    board[row][col] = piece;
                    return row;
                }
            }
            return -1;
        }

        function checkWinner() {
            // Check horizontal, vertical, and diagonal
            for (let row = 0; row < ROWS; row++) {
                for (let col = 0; col < COLS; col++) {
                    if (board[row][col] === '⬜') continue;
                    
                    const piece = board[row][col];
                    // Check right
                    if (col <= COLS - 4 && 
                        board[row][col + 1] === piece && 
                        board[row][col + 2] === piece && 
                        board[row][col + 3] === piece) return piece;
                    
                    // Check down
                    if (row <= ROWS - 4 && 
                        board[row + 1][col] === piece && 
                        board[row + 2][col] === piece && 
                        board[row + 3][col] === piece) return piece;
                    
                    // Check diagonal down-right
                    if (row <= ROWS - 4 && col <= COLS - 4 && 
                        board[row + 1][col + 1] === piece && 
                        board[row + 2][col + 2] === piece && 
                        board[row + 3][col + 3] === piece) return piece;
                    
                    // Check diagonal down-left
                    if (row <= ROWS - 4 && col >= 3 && 
                        board[row + 1][col - 1] === piece && 
                        board[row + 2][col - 2] === piece && 
                        board[row + 3][col - 3] === piece) return piece;
                }
            }
            
            return board[0].every(cell => cell !== '⬜') ? 'tie' : null;
        }

        function getBotMove() {
            const validCols = [];
            for (let col = 0; col < COLS; col++) {
                if (board[0][col] === '⬜') validCols.push(col);
            }
            return validCols[Math.floor(Math.random() * validCols.length)];
        }

        function updateGameEmbed() {
            const winner = checkWinner();
            let title, description, color;

            if (winner === playerPiece) {
                title = 'You Won!';
                description = 'Congratulations! Four in a row!';
                color = 'success';
            } else if (winner === botPiece) {
                title = 'Bot Wins!';
                description = 'Bot got four in a row!';
                color = 'error';
            } else if (winner === 'tie') {
                title = 'Board Full!';
                description = 'It\'s a tie!';
                color = 'info';
            } else {
                title = 'Connect 4';
                description = `Drop your ${playerPiece} piece!`;
                color = 'info';
            }

            const gameEmbed = color === 'success' ? 
                embedBuilder.createSuccessEmbed(title, `${embedBuilder.addEmoji('games')} ${description}`) :
                color === 'error' ?
                embedBuilder.createErrorEmbed(title, description) :
                embedBuilder.createInfoEmbed(title, `${embedBuilder.addEmoji('games')} ${description}`);

            const boardDisplay = board.map(row => row.join('')).join('\n');
            gameEmbed.addFields({
                name: '🎮 Board',
                value: boardDisplay,
                inline: false
            });

            return { embed: gameEmbed, gameOver: winner !== null };
        }

        const initialUpdate = updateGameEmbed();
        await interaction.reply({ embeds: [initialUpdate.embed], components: createButtons() });

        const filter = (i) => i.customId.startsWith('c4_') && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 300000 });

        collector.on('collect', async (i) => {
            const col = parseInt(i.customId.split('_')[1]);
            
            dropPiece(col, playerPiece);
            let update = updateGameEmbed();
            
            if (!update.gameOver) {
                const botCol = getBotMove();
                if (botCol !== undefined) {
                    dropPiece(botCol, botPiece);
                    update = updateGameEmbed();
                }
            }

            const components = update.gameOver ? [] : createButtons();
            await i.update({ embeds: [update.embed], components });

            if (update.gameOver) collector.stop();
        });
    }
};