const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blackjack')
        .setDescription('Play Blackjack against the dealer'),

    usage: '/blackjack',
    cooldown: 10000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        
        const suits = ['♠️', '♥️', '♦️', '♣️'];
        const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        
        function createDeck() {
            const deck = [];
            for (const suit of suits) {
                for (const rank of ranks) {
                    deck.push({ rank, suit, value: rank === 'A' ? 11 : ['J', 'Q', 'K'].includes(rank) ? 10 : parseInt(rank) });
                }
            }
            return deck.sort(() => Math.random() - 0.5);
        }

        function calculateTotal(hand) {
            let total = hand.reduce((sum, card) => sum + card.value, 0);
            let aces = hand.filter(card => card.rank === 'A').length;
            
            while (total > 21 && aces > 0) {
                total -= 10;
                aces--;
            }
            return total;
        }

        function formatHand(hand, hideFirst = false) {
            return hand.map((card, index) => 
                hideFirst && index === 0 ? '🂠' : `${card.rank}${card.suit}`
            ).join(' ');
        }

        const deck = createDeck();
        const playerHand = [deck.pop(), deck.pop()];
        const dealerHand = [deck.pop(), deck.pop()];
        let gameOver = false;
        let result = '';

        function createGameButtons() {
            if (gameOver) return [];
            
            const row = new ActionRowBuilder();
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId('bj_hit')
                    .setLabel('Hit')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('bj_stand')
                    .setLabel('Stand')
                    .setStyle(ButtonStyle.Secondary)
            );
            return [row];
        }

        function updateGameEmbed() {
            const playerTotal = calculateTotal(playerHand);
            const dealerTotal = calculateTotal(dealerHand);
            const dealerShown = gameOver ? dealerTotal : calculateTotal([dealerHand[1]]);

            let title, description, color;
            if (gameOver) {
                if (playerTotal > 21) {
                    title = 'Bust!';
                    description = 'You went over 21. Dealer wins.';
                    color = 'error';
                } else if (dealerTotal > 21) {
                    title = 'Dealer Bust!';
                    description = 'Dealer went over 21. You win!';
                    color = 'success';
                } else if (playerTotal > dealerTotal) {
                    title = 'You Win!';
                    description = 'Your hand beats the dealer!';
                    color = 'success';
                } else if (dealerTotal > playerTotal) {
                    title = 'Dealer Wins!';
                    description = 'Dealer\'s hand beats yours.';
                    color = 'error';
                } else {
                    title = 'Push!';
                    description = 'It\'s a tie!';
                    color = 'info';
                }
            } else {
                title = 'Blackjack';
                description = 'Hit or Stand?';
                color = 'info';
            }

            const gameEmbed = color === 'success' ? 
                embedBuilder.createSuccessEmbed(title, `${embedBuilder.addEmoji('games')} ${description}`) :
                color === 'error' ?
                embedBuilder.createErrorEmbed(title, description) :
                embedBuilder.createInfoEmbed(title, `${embedBuilder.addEmoji('games')} ${description}`);

            gameEmbed.addFields(
                {
                    name: `🃏 Your Hand (${playerTotal})`,
                    value: formatHand(playerHand),
                    inline: false
                },
                {
                    name: `🤵 Dealer Hand ${gameOver ? `(${dealerTotal})` : `(${dealerShown})`}`,
                    value: formatHand(dealerHand, !gameOver),
                    inline: false
                }
            );

            return gameEmbed;
        }

        await interaction.reply({ embeds: [updateGameEmbed()], components: createGameButtons() });

        const filter = (i) => i.customId.startsWith('bj_') && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 300000 });

        collector.on('collect', async (i) => {
            const action = i.customId.split('_')[1];
            
            if (action === 'hit') {
                playerHand.push(deck.pop());
                if (calculateTotal(playerHand) > 21) {
                    gameOver = true;
                }
            } else if (action === 'stand') {
                gameOver = true;
                
                while (calculateTotal(dealerHand) < 17) {
                    dealerHand.push(deck.pop());
                }
            }

            const components = gameOver ? [] : createGameButtons();
            await i.update({ embeds: [updateGameEmbed()], components });
            
            if (gameOver) collector.stop();
        });
    }
};