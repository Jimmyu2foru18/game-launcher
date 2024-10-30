const db = require('../database/db-manager');
const logger = require('../utils/logger');
const { AppError } = require('../utils/error-handler');

class ParentalControl {
    constructor() {
        this.ratings = {
            EVERYONE: 0,
            EVERYONE_10: 10,
            TEEN: 13,
            MATURE: 17,
            ADULTS_ONLY: 18
        };
    }

    async setRestrictions(userId, settings) {
        try {
            await db.query(`
                UPDATE users
                SET settings = json_set(settings, '$.parentalControls', ?)
                WHERE id = ?
            `, [JSON.stringify(settings), userId]);

            logger.info('Parental controls updated', { userId, settings });
        } catch (error) {
            logger.error('Failed to update parental controls', { error });
            throw new AppError('Failed to update restrictions', 'PARENTAL_CONTROL_ERROR');
        }
    }

    async canAccessGame(userId, gameId) {
        try {
            const [user, game] = await Promise.all([
                db.query('SELECT settings FROM users WHERE id = ?', [userId]),
                db.query('SELECT rating FROM games WHERE id = ?', [gameId])
            ]);

            const parentalControls = JSON.parse(user[0].settings).parentalControls;
            if (!parentalControls.enabled) return true;

            const maxAllowedRating = this.ratings[parentalControls.maxGameRating];
            const gameRating = this.ratings[game[0].rating];

            return gameRating <= maxAllowedRating;
        } catch (error) {
            logger.error('Failed to check game access', { error });
            throw new AppError('Failed to check access', 'ACCESS_CHECK_ERROR');
        }
    }
}

module.exports = new ParentalControl(); 