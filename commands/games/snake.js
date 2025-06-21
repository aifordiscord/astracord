const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('snake')
        .setDescription('Play a simple snake game using buttons'),

    usage: '/snake',
    cooldown: 15000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        const GRID_SIZE = 5;
        let snake = [{x: 2, y: 2}];
        let food = {x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE)};
        let direction = {x: 0, y: 0};
        let score = 0;
        let gameOver = false;

        function createControlButtons() {
            const row1 = new ActionRowBuilder();
            row1.addComponents(
                new ButtonBuilder()
                    .setCustomId('snake_up')
                    .setEmoji('⬆️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(gameOver)
            );
            
            const row2 = new ActionRowBuilder();
            row2.addComponents(
                new ButtonBuilder()
                    .setCustomId('snake_left')
                    .setEmoji('⬅️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(gameOver),
                new ButtonBuilder()
                    .setCustomId('snake_down')
                    .setEmoji('⬇️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(gameOver),
                new ButtonBuilder()
                    .setCustomId('snake_right')
                    .setEmoji('➡️')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(gameOver)
            );

            return [row1, row2];
        }

        function generateGrid() {
            let grid = '';
            for (let y = 0; y < GRID_SIZE; y++) {
                for (let x = 0; x < GRID_SIZE; x++) {
                    if (snake.some(segment => segment.x === x && segment.y === y)) {
                        grid += snake[0].x === x && snake[0].y === y ? '🟢' : '🟩';
                    } else if (food.x === x && food.y === y) {
                        grid += '🍎';
                    } else {
                        grid += '⬛';
                    }
                }
                grid += '\n';
            }
            return grid;
        }

        function moveSnake() {
            if (direction.x === 0 && direction.y === 0) return false;

            const head = {...snake[0]};
            head.x += direction.x;
            head.y += direction.y;

            // Check walls
            if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
                gameOver = true;
                return true;
            }

            // Check self collision
            if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
                gameOver = true;
                return true;
            }

            snake.unshift(head);

            // Check food
            if (head.x === food.x && head.y === food.y) {
                score++;
                do {
                    food = {x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE)};
                } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
            } else {
                snake.pop();
            }

            return false;
        }

        function updateGameEmbed() {
            let title, description, color;
            if (gameOver) {
                title = 'Game Over!';
                description = `Your snake crashed! Final score: ${score}`;
                color = 'error';
            } else {
                title = 'Snake Game';
                description = 'Use the arrow buttons to control your snake!';
                color = 'info';
            }

            const gameEmbed = gameOver ? 
                embedBuilder.createErrorEmbed(title, description) :
                embedBuilder.createInfoEmbed(title, `${embedBuilder.addEmoji('games')} ${description}`);

            gameEmbed.addFields(
                {
                    name: '🎮 Game Grid',
                    value: generateGrid(),
                    inline: false
                },
                {
                    name: '📊 Score',
                    value: `${score}`,
                    inline: true
                },
                {
                    name: '🐍 Length',
                    value: `${snake.length}`,
                    inline: true
                }
            );

            return gameEmbed;
        }

        await interaction.reply({ embeds: [updateGameEmbed()], components: createControlButtons() });

        const filter = (i) => i.customId.startsWith('snake_') && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 300000 });

        collector.on('collect', async (i) => {
            const dir = i.customId.split('_')[1];
            
            switch (dir) {
                case 'up': direction = {x: 0, y: -1}; break;
                case 'down': direction = {x: 0, y: 1}; break;
                case 'left': direction = {x: -1, y: 0}; break;
                case 'right': direction = {x: 1, y: 0}; break;
            }

            moveSnake();
            const components = gameOver ? [] : createControlButtons();
            
            await i.update({ embeds: [updateGameEmbed()], components });
            
            if (gameOver) collector.stop();
        });
    }
};