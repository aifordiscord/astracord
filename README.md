
# AstraCord

<div align="center">
  <img src="https://github.com/aifordiscord/astracord/raw/main/assets/banner.png" alt="AstraCord Banner" width="800"/>
  
  <p><strong>A powerful, feature-rich Discord bot with 47+ commands across 4 categories</strong></p>
  
  [![Discord](https://img.shields.io/discord/YOUR_SERVER_ID?color=7289da&logo=discord&logoColor=white&label=Support%20Server)](https://dsc.gg/aifordiscord)
  [![Bot Invite](https://img.shields.io/badge/Invite%20Bot-AstraCord-7289da?logo=discord&logoColor=white)](https://dsc.gg/astracord)
  [![GitHub Stars](https://img.shields.io/github/stars/aifordiscord/astracord?style=social)](https://github.com/aifordiscord/astracord)
  [![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
  [![Discord.js](https://img.shields.io/badge/Discord.js-14.x-blue.svg)](https://discord.js.org)
</div>

## ✨ Features

AstraCord is a comprehensive Discord bot built with modern architecture and advanced features:

- **🎮 Interactive Games** - Play games like Blackjack, Connect 4, Snake, Memory, and more
- **🛡️ Advanced Moderation** - Complete moderation suite with warnings, bans, role management
- **🎭 Fun Commands** - Entertainment commands including memes, jokes, trivia, and utilities
- **📊 Server Management** - Server info, user info, statistics, and administration tools
- **🔧 Advanced Help System** - Interactive navigation with pagination and category browsing
- **🎨 Custom Emoji Integration** - Rich embeds with custom emojis stored in JSON format
- **📝 Professional Logging** - Comprehensive logging system for monitoring and debugging

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- Discord Bot Token
- Discord Application Client ID

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/aifordiscord/astracord.git
   cd astracord
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Create .env file and add:
   DISCORD_TOKEN=your_bot_token_here
   CLIENT_ID=your_application_client_id_here
   ```

4. **Deploy slash commands**
   ```bash
   node deploy-commands.js
   ```

5. **Start the bot**
   ```bash
   npm start
   ```

## 📋 Command Categories

### 🎮 Games (11 Commands)
Interactive games with button controls and advanced gameplay mechanics:
- `blackjack` - Play Blackjack against the dealer
- `connect4` - Play Connect 4 against the bot
- `hangman` - Word guessing game with multiple difficulties
- `mathquiz` - Test your math skills with customizable difficulty
- `memory` - Memory matching game with emojis
- `numberguess` - Guess the secret number
- `rps` - Rock, Paper, Scissors with the bot
- `snake` - Classic Snake game using Discord buttons
- `tictactoe` - Play Tic-Tac-Toe against the bot
- `trivia` - Multiple choice trivia questions
- `wordchain` - Collaborative word chain game

### 🛡️ Moderation (13 Commands)
Comprehensive moderation tools with permission checks:
- `ban` / `unban` - Ban and unban members
- `kick` - Remove members from the server
- `mute` / `unmute` - Timeout management
- `warn` / `warnings` - Warning system
- `clear` / `purge` - Advanced message deletion
- `role` - Role management for users
- `nickname` - Nickname management
- `slowmode` - Channel slowmode control
- `lockdown` - Channel lockdown functionality

### 🎭 Fun (12 Commands)
Entertainment and utility commands:
- `8ball` - Magic 8-ball predictions
- `coinflip` - Flip a coin with animations
- `joke` / `meme` - Random jokes and memes
- `quote` / `facts` - Inspirational quotes and facts
- `riddle` - Brain teasers and riddles
- `roast` / `compliment` - Light-hearted roasts and compliments
- `roll` - Customizable dice rolling
- `choose` - Decision maker
- `wouldyourather` - Interactive would you rather questions

### 📊 General (11 Commands)
Information and utility commands:
- `help` - Advanced interactive help system
- `ping` - Latency and API response time
- `serverinfo` - Detailed server information
- `userinfo` - User profile information
- `avatar` - High-quality avatar display
- `botinfo` - Bot statistics and information
- `stats` - Detailed bot and server statistics
- `uptime` - Bot uptime tracking
- `roles` - Server role information
- `emojis` - Custom emoji display
- `invite` - Bot invite link with permissions

## 🏗️ Architecture

AstraCord features a professional modular architecture:

```
astracord/
├── commands/           # Command modules organized by category
│   ├── fun/           # Entertainment commands
│   ├── games/         # Interactive game commands
│   ├── general/       # Information and utility commands
│   └── moderation/    # Server moderation tools
├── events/            # Discord.js event handlers
├── handlers/          # Command and event loading systems
├── utils/             # Utility classes and helpers
├── data/              # JSON data storage (emojis, etc.)
└── logs/              # Application logs
```

### Key Features:
- **Modular Command System** - Easy to extend and maintain
- **Advanced Error Handling** - Comprehensive error catching and logging
- **Custom Embed Builder** - Consistent styling across all commands
- **Pagination System** - Interactive navigation for large datasets
- **Permission Management** - Proper permission checking for all commands
- **Cooldown System** - Rate limiting to prevent spam
- **Professional Logging** - File-based logging with rotation

## 🔧 Configuration

### Environment Variables
```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_application_client_id_here
```

### Custom Emoji Configuration
Edit `data/emojis.json` to customize emojis used throughout the bot:
```json
{
  "success": "✅",
  "error": "❌",
  "info": "ℹ️",
  "warning": "⚠️",
  "loading": "⏳"
}
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Support Server**: [Join our Discord](https://dsc.gg/aifordiscord)
- **Bot Invite**: [Add AstraCord to your server](https://dsc.gg/astracord)
- **Issues**: [Report bugs on GitHub](https://github.com/aifordiscord/astracord/issues)

## 🤖 Development Credits

AstraCord was developed using advanced AI assistance including:
- **ChatGPT-4o** - Core architecture and command development
- **DeepSeek** - Advanced algorithm implementation
- **Claude** - Code optimization and documentation
- **Replit Agent** - Error resolution and debugging

*This collaborative approach between human creativity and AI assistance resulted in a robust, feature-rich Discord bot.*

## 📊 Statistics

- **Total Commands**: 47
- **Categories**: 4
- **Interactive Games**: 11
- **Moderation Tools**: 13
- **Lines of Code**: 4000+

---

<div align="center">
  <p>Made with ❤️ by the AiForDiscord team</p>
  <p>
    <a href="https://dsc.gg/astracord">Invite Bot</a> •
    <a href="https://dsc.gg/aifordiscord">Support Server</a> •
    <a href="https://github.com/aifordiscord/astracord">GitHub</a>
  </p>
</div>
