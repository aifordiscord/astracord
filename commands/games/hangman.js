const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hangman')
        .setDescription('Play a word guessing game')
        .addStringOption(option =>
            option.setName('difficulty')
                .setDescription('Choose difficulty level')
                .setRequired(false)
                .addChoices(
                    { name: 'Easy (4-5 letters)', value: 'easy' },
                    { name: 'Medium (6-7 letters)', value: 'medium' },
                    { name: 'Hard (8+ letters)', value: 'hard' }
                )
        ),

    usage: '/hangman [difficulty]',
    cooldown: 15000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        const difficulty = interaction.options.getString('difficulty') || 'medium';

        const words = {
            easy: ['APPLE', 'HOUSE', 'RIVER', 'BEACH', 'MUSIC', 'PHONE', 'LIGHT', 'PAPER'],
            medium: ['RAINBOW', 'CHICKEN', 'LIBRARY', 'KITCHEN', 'GARDEN', 'WINTER', 'SUMMER'],
            hard: ['ADVENTURE', 'CHOCOLATE', 'BUTTERFLY', 'UMBRELLA', 'ELEPHANT', 'FANTASTIC']
        };

        const wordList = words[difficulty];
        const selectedWord = wordList[Math.floor(Math.random() * wordList.length)];
        const guessedLetters = new Set();
        const wrongGuesses = [];
        let maxWrongGuesses = 6;

        const hangmanStages = [
            '```\n      \n      \n      \n      \n      \n=========```',
            '```\n  +---+\n      |\n      |\n      |\n      |\n=========```',
            '```\n  +---+\n  |   |\n      |\n      |\n      |\n=========```',
            '```\n  +---+\n  |   |\n  O   |\n      |\n      |\n=========```',
            '```\n  +---+\n  |   |\n  O   |\n  |   |\n      |\n=========```',
            '```\n  +---+\n  |   |\n  O   |\n /|   |\n      |\n=========```',
            '```\n  +---+\n  |   |\n  O   |\n /|\\  |\n /    |\n=========```'
        ];

        function getDisplayWord() {
            return selectedWord.split('').map(letter => guessedLetters.has(letter) ? letter : '_').join(' ');
        }

        function createAlphabetButtons() {
            const rows = [];
            const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            
            for (let i = 0; i < 26; i += 5) {
                const row = new ActionRowBuilder();
                for (let j = i; j < Math.min(i + 5, 26); j++) {
                    const letter = alphabet[j];
                    row.addComponents(
                        new ButtonBuilder()
                            .setCustomId(`hangman_${letter}`)
                            .setLabel(letter)
                            .setStyle(guessedLetters.has(letter) ? ButtonStyle.Secondary : ButtonStyle.Primary)
                            .setDisabled(guessedLetters.has(letter))
                    );
                }
                rows.push(row);
            }
            return rows;
        }

        function updateGameEmbed() {
            const displayWord = getDisplayWord();
            const isGameWon = !displayWord.includes('_');
            const isGameLost = wrongGuesses.length >= maxWrongGuesses;

            let title, description, color;
            if (isGameWon) {
                title = 'You Won!';
                description = `Congratulations! You guessed the word: **${selectedWord}**`;
                color = 'success';
            } else if (isGameLost) {
                title = 'Game Over!';
                description = `The word was: **${selectedWord}**`;
                color = 'error';
            } else {
                title = 'Hangman Game';
                description = `Guess the word: **${displayWord}**`;
                color = 'info';
            }

            const gameEmbed = color === 'success' ? 
                embedBuilder.createSuccessEmbed(title, `${embedBuilder.addEmoji('games')} ${description}`) :
                color === 'error' ?
                embedBuilder.createErrorEmbed(title, description) :
                embedBuilder.createInfoEmbed(title, `${embedBuilder.addEmoji('games')} ${description}`);

            gameEmbed.addFields(
                {
                    name: '🎭 Hangman',
                    value: hangmanStages[wrongGuesses.length],
                    inline: true
                },
                {
                    name: '📊 Progress',
                    value: `Wrong guesses: ${wrongGuesses.length}/${maxWrongGuesses}\nGuessed letters: ${Array.from(guessedLetters).sort().join(', ') || 'None'}`,
                    inline: true
                }
            );

            return { embed: gameEmbed, gameOver: isGameWon || isGameLost };
        }

        const initialUpdate = updateGameEmbed();
        const components = initialUpdate.gameOver ? [] : createAlphabetButtons();

        await interaction.reply({ embeds: [initialUpdate.embed], components });

        if (!initialUpdate.gameOver) {
            const filter = (i) => i.customId.startsWith('hangman_') && i.user.id === interaction.user.id;
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 300000 });

            collector.on('collect', async (i) => {
                const letter = i.customId.split('_')[1];
                guessedLetters.add(letter);

                if (!selectedWord.includes(letter)) {
                    wrongGuesses.push(letter);
                }

                const update = updateGameEmbed();
                const newComponents = update.gameOver ? [] : createAlphabetButtons();

                await i.update({ embeds: [update.embed], components: newComponents });

                if (update.gameOver) {
                    collector.stop();
                }
            });

            collector.on('end', async () => {
                // Game ended naturally through win/loss or timeout
            });
        }
    }
};