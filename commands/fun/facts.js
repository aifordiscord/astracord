const { SlashCommandBuilder } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('facts')
        .setDescription('Get random interesting facts')
        .addStringOption(option =>
            option.setName('category')
                .setDescription('Choose a fact category')
                .setRequired(false)
                .addChoices(
                    { name: 'Science', value: 'science' },
                    { name: 'Animals', value: 'animals' },
                    { name: 'Space', value: 'space' },
                    { name: 'History', value: 'history' },
                    { name: 'Technology', value: 'technology' }
                )
        ),

    usage: '/facts [category]',
    cooldown: 3000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();
        const category = interaction.options.getString('category') || 'science';

        const facts = {
            science: [
                "A day on Venus is longer than its year.",
                "Bananas are berries, but strawberries aren't.",
                "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old.",
                "A group of flamingos is called a 'flamboyance'.",
                "Octopuses have three hearts and blue blood.",
                "Lightning strikes the Earth about 100 times per second.",
                "The human brain contains approximately 86 billion neurons."
            ],
            animals: [
                "Dolphins have names for each other.",
                "A shrimp's heart is in its head.",
                "Elephants can't jump.",
                "A group of pandas is called an 'embarrassment'.",
                "Penguins propose to their mates with pebbles.",
                "Cats can't taste sweetness.",
                "A single cloud can weigh more than a million pounds.",
                "Butterflies taste with their feet."
            ],
            space: [
                "One day on Mercury lasts about 59 Earth days.",
                "The footprints on the Moon will be there for 100 million years.",
                "Space is completely silent.",
                "The Sun makes up 99.86% of the Solar System's mass.",
                "A year on Venus is shorter than a day on Venus.",
                "Saturn would float if you could find a bathtub big enough.",
                "The largest volcano in the solar system is on Mars."
            ],
            history: [
                "Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid.",
                "The Great Wall of China isn't visible from space with the naked eye.",
                "Napoleon wasn't actually short for his time period.",
                "The first computer bug was an actual bug - a moth trapped in a computer.",
                "Oxford University is older than the Aztec Empire.",
                "The shortest war in history lasted only 38-45 minutes.",
                "Vikings never actually wore horned helmets."
            ],
            technology: [
                "The first computer was the size of a room and weighed 30 tons.",
                "More people have mobile phones than toilets.",
                "The first camera took 8 hours to take a single photograph.",
                "Email was invented before the World Wide Web.",
                "The first YouTube video was uploaded on April 23, 2005.",
                "Google processes over 8.5 billion searches per day.",
                "The Internet weighs about the same as a strawberry."
            ]
        };

        const categoryFacts = facts[category];
        const randomFact = categoryFacts[Math.floor(Math.random() * categoryFacts.length)];

        const factEmbed = embedBuilder.createInfoEmbed(
            `${embedBuilder.addEmoji('fun')} Fun Fact`,
            ''
        );

        factEmbed.addFields(
            {
                name: '💡 Did You Know?',
                value: randomFact,
                inline: false
            },
            {
                name: '📚 Category',
                value: category.charAt(0).toUpperCase() + category.slice(1),
                inline: true
            },
            {
                name: '🧠 Learn More',
                value: 'Knowledge is power!',
                inline: true
            }
        );

        factEmbed.setFooter({
            text: `Fact requested by ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL()
        });

        await interaction.reply({ embeds: [factEmbed] });
    }
};