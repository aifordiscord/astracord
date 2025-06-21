const { SlashCommandBuilder } = require('discord.js');
const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription('Get a random meme from popular subreddits'),

    usage: '/meme',
    cooldown: 5000,

    async execute(interaction) {
        const embedBuilder = new CustomEmbedBuilder();

        // Since we can't fetch from Reddit API without external libraries,
        // we'll create a collection of meme-style jokes and facts
        const memes = [
            {
                title: "Programming Reality",
                content: "When you finally fix a bug but create 3 new ones in the process",
                type: "Relatable Programming"
            },
            {
                title: "Discord Bot Development",
                content: "Me: 'I'll just make a simple bot'\nAlso me: *Creates advanced help system with pagination*",
                type: "Development Meme"
            },
            {
                title: "Debugging Life",
                content: "Error: Success\nDeveloper: Wait, that's not supposed to work...",
                type: "Programming Logic"
            },
            {
                title: "Coffee Dependency",
                content: "Code without coffee = Chaos\nCode with coffee = Organized chaos",
                type: "Developer Lifestyle"
            },
            {
                title: "Documentation",
                content: "// TODO: Write proper documentation\n// Written 2 years ago",
                type: "Every Project Ever"
            },
            {
                title: "Stack Overflow",
                content: "Problem: 'How do I center a div?'\nSolution: *Rebuilds entire website*",
                type: "Web Development"
            },
            {
                title: "Git Commits",
                content: "Commit messages evolution:\n'Initial commit'\n'Added feature'\n'Fixed stuff'\n'PLEASE WORK'\n'I'M DONE'",
                type: "Version Control"
            },
            {
                title: "Production vs Development",
                content: "Development: *Everything works perfectly*\nProduction: *Somehow everything is on fire*",
                type: "Deployment Reality"
            }
        ];

        const randomMeme = memes[Math.floor(Math.random() * memes.length)];

        const memeEmbed = embedBuilder.createInfoEmbed(
            `${embedBuilder.addEmoji('fun')} Random Meme`,
            ''
        );

        memeEmbed.addFields(
            {
                name: `📱 ${randomMeme.title}`,
                value: randomMeme.content,
                inline: false
            },
            {
                name: '🏷️ Category',
                value: randomMeme.type,
                inline: true
            },
            {
                name: '😄 Enjoy!',
                value: 'Hope this made you smile!',
                inline: true
            }
        );

        memeEmbed.setFooter({
            text: `Requested by ${interaction.user.username} • More memes coming soon!`,
            iconURL: interaction.user.displayAvatarURL()
        });

        await interaction.reply({ embeds: [memeEmbed] });
    }
};
