const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logsDir = path.join(__dirname, '../logs');
        
        // Create logs directory if it doesn't exist
        if (!fs.existsSync(this.logsDir)) {
            fs.mkdirSync(this.logsDir, { recursive: true });
        }
    }

    formatTimestamp() {
        const now = new Date();
        return now.toISOString().replace('T', ' ').substr(0, 19);
    }

    formatMessage(level, message, ...args) {
        const timestamp = this.formatTimestamp();
        const formattedArgs = args.length > 0 ? ' ' + args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ') : '';
        
        return `[${timestamp}] [${level.toUpperCase()}] ${message}${formattedArgs}`;
    }

    writeToFile(level, formattedMessage) {
        const today = new Date().toISOString().split('T')[0];
        const logFile = path.join(this.logsDir, `${today}.log`);
        
        try {
            fs.appendFileSync(logFile, formattedMessage + '\n');
        } catch (error) {
            console.error('Failed to write to log file:', error);
        }
    }

    log(level, message, ...args) {
        const formattedMessage = this.formatMessage(level, message, ...args);
        
        // Console output with colors
        const colors = {
            info: '\x1b[36m',    // Cyan
            warning: '\x1b[33m', // Yellow
            error: '\x1b[31m',   // Red
            debug: '\x1b[35m',   // Magenta
            reset: '\x1b[0m'     // Reset
        };

        console.log(`${colors[level] || ''}${formattedMessage}${colors.reset}`);
        
        // Write to file
        this.writeToFile(level, formattedMessage);
    }

    info(message, ...args) {
        this.log('info', message, ...args);
    }

    warning(message, ...args) {
        this.log('warning', message, ...args);
    }

    error(message, ...args) {
        this.log('error', message, ...args);
    }

    debug(message, ...args) {
        this.log('debug', message, ...args);
    }
}

module.exports = new Logger();
