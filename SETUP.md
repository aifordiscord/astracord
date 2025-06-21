# AstraCord Setup Guide

This guide will help you set up AstraCord on your server or development environment.

## Prerequisites

- Node.js 18 or higher
- Discord Developer Account
- Basic knowledge of Discord bots

## Discord Bot Setup

### 1. Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Name your application "AstraCord" (or your preferred name)
4. Go to the "Bot" section
5. Click "Add Bot"
6. Save your bot token (keep this secret!)

### 2. Get Client ID

1. In the "General Information" section
2. Copy your "Application ID" (this is your Client ID)

### 3. Bot Permissions

AstraCord requires the following permissions:
- Send Messages
- Use Slash Commands
- Embed Links
- Attach Files
- Read Message History
- Add Reactions
- Connect (for voice commands)
- Speak (for voice commands)
- Manage Messages (for moderation)
- Kick Members (for moderation)
- Ban Members (for moderation)
- Manage Roles (for moderation)
- Manage Channels (for moderation)

## Installation

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/aifordiscord/astracord.git
   cd astracord
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   # Create .env file
   DISCORD_TOKEN=your_bot_token_here
   CLIENT_ID=your_client_id_here
   ```

4. **Deploy commands**
   ```bash
   node deploy-commands.js
   ```

5. **Start the bot**
   ```bash
   npm start
   ```

### Replit Deployment

1. **Import to Replit**
   - Go to [Replit](https://replit.com)
   - Create new Repl from GitHub
   - Enter: `https://github.com/aifordiscord/astracord`

2. **Set Environment Variables**
   - Go to Secrets tab in Replit
   - Add `DISCORD_TOKEN` with your bot token
   - Add `CLIENT_ID` with your application ID

3. **Deploy Commands**
   ```bash
   node deploy-commands.js
   ```

4. **Run the Bot**
   ```bash
   npm start
   ```

### Docker Deployment

1. **Create Dockerfile** (if not exists)
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   CMD ["npm", "start"]
   ```

2. **Build and Run**
   ```bash
   docker build -t astracord .
   docker run -e DISCORD_TOKEN=your_token -e CLIENT_ID=your_id astracord
   ```

## Configuration

### Custom Emojis

Edit `data/emojis.json` to customize emojis:
```json
{
  "success": "✅",
  "error": "❌",
  "info": "ℹ️",
  "warning": "⚠️",
  "loading": "⏳",
  "fun": "🎭",
  "games": "🎮",
  "moderation": "🛡️",
  "voice": "🎵"
}
```

### Bot Settings

Modify `config.js` for customization:
- Change bot colors
- Update activity messages
- Adjust cooldowns
- Add owner IDs

## Inviting the Bot

Generate an invite link:
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands
```

Replace `YOUR_CLIENT_ID` with your actual client ID.

## Troubleshooting

### Common Issues

**Bot doesn't respond to commands:**
- Ensure bot has proper permissions
- Check if commands are deployed globally
- Verify bot token is correct

**Permission errors:**
- Make sure bot role is above roles it needs to manage
- Check individual channel permissions
- Ensure bot has Administrator permission or specific permissions

**Commands not appearing:**
- Run `node deploy-commands.js` again
- Wait up to 1 hour for global commands to update
- Try adding to a test server first

### Getting Help

- Join our support server: https://dsc.gg/aifordiscord
- Check GitHub issues: https://github.com/aifordiscord/astracord/issues
- Read Discord.js documentation: https://discord.js.org

## Production Deployment

### Process Managers

**PM2 (Recommended):**
```bash
npm install -g pm2
pm2 start index.js --name astracord
pm2 startup
pm2 save
```

**Forever:**
```bash
npm install -g forever
forever start index.js
```

### Monitoring

Monitor your bot with:
- PM2 monitoring: `pm2 monit`
- Log files: Check `logs/` directory
- Discord API status: https://discordstatus.com

### Updates

To update AstraCord:
```bash
git pull origin main
npm install
node deploy-commands.js
pm2 restart astracord
```

## Security

- Never share your bot token
- Use environment variables for secrets
- Regularly update dependencies
- Monitor logs for suspicious activity
- Limit bot permissions to what's needed

## Support

Need help? We're here for you:
- Discord Support: https://dsc.gg/aifordiscord
- GitHub Issues: https://github.com/aifordiscord/astracord/issues
- Documentation: Check README.md