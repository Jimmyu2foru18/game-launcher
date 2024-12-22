const db = require('../database/db-manager');
const logger = require('../utils/logger');
const { AppError } = require('../utils/error-handler');

class StatsService {
    async updatePlaytime(userId, gameId, duration) {
        try {
            await db.query(`
                INSERT INTO game_stats (user_id, game_id, playtime, last_played)
                VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                ON CONFLICT(user_id, game_id) DO UPDATE SET
                playtime = playtime + ?,
                last_played = CURRENT_TIMESTAMP
            `, [userId, gameId, duration, duration]);

            logger.info('Playtime updated', { userId, gameId, duration });
        } catch (error) {
            logger.error('Failed to update playtime', { error });
            throw new AppError('Failed to update stats', 'STATS_UPDATE_ERROR');
        }
    }

    async getGameStats(userId, gameId) {
        try {
            const stats = await db.query(`
                SELECT * FROM game_stats
                WHERE user_id = ? AND game_id = ?
            `, [userId, gameId]);

            return stats[0] || null;
        } catch (error) {
            logger.error('Failed to get game stats', { error });
            throw new AppError('Failed to get stats', 'STATS_FETCH_ERROR');
        }
    }

    async getUserStats(userId) {
        try {
            return await db.query(`
                SELECT 
                    g.name,
                    gs.playtime,
                    gs.last_played,
                    gs.achievements
                FROM game_stats gs
                JOIN games g ON g.id = gs.game_id
                WHERE gs.user_id = ?
                ORDER BY gs.last_played DESC
            `, [userId]);
        } catch (error) {
            logger.error('Failed to get user stats', { error });
            throw new AppError('Failed to get user stats', 'USER_STATS_ERROR');
        }
    }
}

module.exports = new StatsService(); 