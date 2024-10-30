const fs = require('fs').promises;
const path = require('path');
const logger = require('./logger');

class ConfigManager {
    static instance = null;
    
    constructor() {
        if (ConfigManager.instance) {
            return ConfigManager.instance;
        }
        this.configs = new Map();
        ConfigManager.instance = this;
    }

    async loadConfig(configName) {
        try {
            const configPath = path.join(__dirname, '../../config', `${configName}.json`);
            const data = await fs.readFile(configPath, 'utf8');
            this.configs.set(configName, JSON.parse(data));
            return this.configs.get(configName);
        } catch (error) {
            logger.error(`Failed to load config: ${configName}`, { error });
            throw new Error(`Configuration load failed: ${configName}`);
        }
    }

    async saveConfig(configName, data) {
        try {
            const configPath = path.join(__dirname, '../../config', `${configName}.json`);
            await fs.writeFile(configPath, JSON.stringify(data, null, 2));
            this.configs.set(configName, data);
        } catch (error) {
            logger.error(`Failed to save config: ${configName}`, { error });
            throw new Error(`Configuration save failed: ${configName}`);
        }
    }

    getConfig(configName) {
        return this.configs.get(configName);
    }
}

module.exports = new ConfigManager(); 