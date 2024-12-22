const fs = require('fs').promises;
const path = require('path');
const { PATHS } = require('../config/app.config');
const logger = require('../utils/logger');

async function checkApplicationRequirements() {
    try {
        // Ensure required directories exist
        const requiredDirs = [
            PATHS.DATA,
            PATHS.LOGS,
            PATHS.GAMES,
            PATHS.MODS,
            PATHS.TEMP,
            path.dirname(PATHS.DATABASE)
        ];

        for (const dir of requiredDirs) {
            await fs.mkdir(dir, { recursive: true });
        }

        // Check write permissions
        for (const dir of requiredDirs) {
            try {
                const testFile = path.join(dir, '.test');
                await fs.writeFile(testFile, '');
                await fs.unlink(testFile);
            } catch (error) {
                throw new Error(`No write permission in ${dir}`);
            }
        }

        return true;
    } catch (error) {
        logger.error('Application requirements check failed', { error });
        return false;
    }
}

module.exports = { checkApplicationRequirements }; 