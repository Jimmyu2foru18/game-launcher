const axios = require('axios');
const logger = require('../utils/logger');
const { AppError } = require('../utils/error-types');

class UpdateChecker {
    constructor(game) {
        this.game = game;
        this.currentVersion = game.version || '1.0.0';
    }

    async checkForUpdate() {
        try {
            if (!this.game.updateURL) {
                logger.warn('No update URL provided for game', {
                    game: this.game.name
                });
                return { updateAvailable: false };
            }

            const response = await axios.get(this.game.updateURL, {
                timeout: 5000
            });

            const updateInfo = response.data;
            const updateAvailable = this.isNewerVersion(updateInfo.latestVersion);

            return { updateAvailable, updateInfo };
        } catch (error) {
            logger.error('Failed to check for updates', {
                error: error.message,
                game: this.game.name
            });
            return { updateAvailable: false, error: error.message };
        }
    }

    isNewerVersion(latestVersion) {
        const current = this.parseVersion(this.currentVersion);
        const latest = this.parseVersion(latestVersion);

        for (let i = 0; i < Math.max(current.length, latest.length); i++) {
            const currentNum = current[i] || 0;
            const latestNum = latest[i] || 0;

            if (latestNum > currentNum) return true;
            if (latestNum < currentNum) return false;
        }
        return false;
    }

    parseVersion(version) {
        return version.split('.').map(num => {
            const parsed = parseInt(num, 10);
            return isNaN(parsed) ? 0 : parsed;
        });
    }
}

module.exports = UpdateChecker; 