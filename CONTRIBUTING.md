# Contributing to AstraCord

Thank you for your interest in contributing to AstraCord! This document provides guidelines for contributing to the project.

## Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/aifordiscord/astracord.git
   cd astracord
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   DISCORD_TOKEN=your_bot_token
   CLIENT_ID=your_client_id
   ```

4. **Test your changes**
   ```bash
   npm start
   ```

## Code Style Guidelines

- Use consistent indentation (2 spaces)
- Follow existing naming conventions
- Add proper error handling
- Include JSDoc comments for functions
- Use Discord.js v14 patterns

## Adding New Commands

1. Create command file in appropriate category folder
2. Follow the existing command structure:
   ```javascript
   const { SlashCommandBuilder } = require('discord.js');
   const CustomEmbedBuilder = require('../../utils/embedBuilder.js');

   module.exports = {
       data: new SlashCommandBuilder()
           .setName('commandname')
           .setDescription('Command description'),
       
       usage: '/commandname',
       cooldown: 3000,
       
       async execute(interaction) {
           // Command logic here
       }
   };
   ```

3. Test the command thoroughly
4. Update documentation if needed

## Pull Request Process

1. Create a feature branch from main
2. Make your changes
3. Test thoroughly
4. Submit a pull request with:
   - Clear description of changes
   - Testing evidence
   - Any breaking changes noted

## Reporting Issues

When reporting bugs:
- Include Discord.js version
- Provide error logs
- Describe expected vs actual behavior
- Include steps to reproduce

## Code of Conduct

- Be respectful and professional
- Help others learn and grow
- Focus on constructive feedback
- Follow Discord's Terms of Service

## Questions?

Join our support server: https://dsc.gg/aifordiscord