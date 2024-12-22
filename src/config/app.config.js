const path = require('path');

module.exports = {
    APP: {
        NAME: 'Game Launcher',
        VERSION: '1.0.0',
        ENV: process.env.NODE_ENV || 'development'
    },
    PATHS: {
        ROOT: path.resolve(__dirname, '..'),
        DATA: path.resolve(__dirname, '../../data'),
        LOGS: path.resolve(__dirname, '../../logs'),
        GAMES: path.resolve(__dirname, '../../games'),
        MODS: path.resolve(__dirname, '../../mods'),
        TEMP: path.resolve(__dirname, '../../temp')
    },
    SECURITY: {
        JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
        TOKEN_EXPIRY: '24h',
        SALT_ROUNDS: 10
    },
    DATABASE: {
        PATH: path.resolve(__dirname, '../../data/launcher.db'),
        BACKUP_PATH: path.resolve(__dirname, '../../data/backups')
    },
    SCANNING: {
        MAX_DEPTH: 3,
        BATCH_SIZE: 100,
        TIMEOUT: 30000
    }
}; 