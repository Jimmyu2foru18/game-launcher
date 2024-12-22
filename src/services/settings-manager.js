const configManager = require('../utils/config-manager');
const { AppError } = require('../utils/error-handler');
const logger = require('../utils/logger');
const db = require('../database/db-manager');

class SettingsManager {
    constructor() {
        this.defaultSettings = {
            theme: 'default',
            autoUpdate: true,
            notifications: true,
            language: 'en',
            saveLocation: 'default',
            parentalControls: {
                enabled: false,
                maxGameRating: 'EVERYONE'
            }
        };
    }

    async getUserSettings(userId) {
        try {
            const settings = await db.users.findOne(
                { _id: userId },
                { settings: 1 }
            );
            return settings || this.defaultSettings;
        } catch (error) {
            logger.error('Failed to get user settings', { userId, error });
            throw new AppError('Failed to get settings', 'SETTINGS_ERROR');
        }
    }

    async updateSettings(userId, newSettings) {
        try {
            const updatedSettings = await db.users.findOneAndUpdate(
                { _id: userId },
                { $set: { settings: newSettings } },
                { new: true }
            );
            logger.info('Settings updated successfully', { userId });
            return updatedSettings.settings;
        } catch (error) {
            logger.error('Failed to update settings', { userId, error });
            throw new AppError('Failed to update settings', 'SETTINGS_UPDATE_ERROR');
        }
    }
}

module.exports = new SettingsManager(); 