const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');
const path = require('path');
const { DATABASE } = require('../config/app.config');
const logger = require('../utils/logger');
const { DatabaseError } = require('../utils/error-types');

class DatabaseManager {
    constructor() {
        this.db = null;
        this.isInitialized = false;
    }

    async initialize() {
        try {
            this.db = new sqlite3.Database(DATABASE.PATH);
            
            // Promisify database methods
            this.db.runAsync = promisify(this.db.run).bind(this.db);
            this.db.allAsync = promisify(this.db.all).bind(this.db);
            this.db.getAsync = promisify(this.db.get).bind(this.db);
            
            await this.createTables();
            this.isInitialized = true;
            
            logger.info('Database initialized successfully');
        } catch (error) {
            logger.error('Database initialization failed', { error });
            throw new DatabaseError('Failed to initialize database', { 
                originalError: error.message 
            });
        }
    }

    async createTables() {
        const queries = [
            `CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                settings TEXT,
                last_login DATETIME
            )`,
            `CREATE TABLE IF NOT EXISTS games (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                path TEXT UNIQUE NOT NULL,
                version TEXT,
                mod_support BOOLEAN DEFAULT 0,
                last_updated DATETIME,
                metadata TEXT
            )`,
            `CREATE TABLE IF NOT EXISTS game_stats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                game_id INTEGER,
                playtime INTEGER DEFAULT 0,
                last_played DATETIME,
                achievements TEXT,
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (game_id) REFERENCES games (id)
            )`,
            `CREATE TABLE IF NOT EXISTS mods (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                game_id INTEGER,
                name TEXT NOT NULL,
                version TEXT,
                installed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                enabled BOOLEAN DEFAULT 1,
                FOREIGN KEY (game_id) REFERENCES games (id)
            )`
        ];

        for (const query of queries) {
            this.db.runAsync(query);
        }
    }

    query(sql, params = []) {
        if (!this.isInitialized) {
            throw new DatabaseError('Database not initialized');
        }

        try {
            const stmt = this.db.prepare(sql);
            const result = stmt.allAsync(params);
            return result;
        } catch (error) {
            logger.error('Database query failed', { sql, params, error });
            throw new DatabaseError('Query failed', { 
                sql,
                params,
                error: error.message 
            });
        }
    }

    async backup() {
        const backupPath = `${DATABASE.BACKUP_PATH}/backup-${Date.now()}.db`;
        try {
            this.db.backup(backupPath);
            logger.info('Database backup created successfully', { backupPath });
        } catch (error) {
            logger.error('Database backup failed', { error });
            throw new DatabaseError('Backup failed', { error: error.message });
        }
    }

    close() {
        if (this.db) {
            this.db.close();
            this.isInitialized = false;
        }
    }
}

module.exports = new DatabaseManager(); 