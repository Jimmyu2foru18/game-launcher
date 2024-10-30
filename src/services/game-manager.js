const path = require('path');
const { spawn } = require('child_process');
const logger = require('../utils/logger');
const configManager = require('../utils/config-manager');
const { AppError, ErrorHandler } = require('../utils/error-handler');

class GameManager {
    constructor() {
        this.games = new Map();
        this.runningGames = new Map();
    }

    async initialize() {
        try {
            const gamesConfig = await configManager.loadConfig('games');
            gamesConfig.forEach(game => {
                this.games.set(game.id, game);
            });
            logger.info('Game manager initialized successfully');
        } catch (error) {
            throw new AppError('Failed to initialize game manager', 'INIT_ERROR', error);
        }
    }

    async launchGame(gameId) {
        const game = this.games.get(gameId);
        if (!game) {
            throw new AppError('Game not found', 'GAME_NOT_FOUND', { gameId });
        }

        try {
            const gameProcess = spawn(game.path, [], {
                detached: true,
                stdio: 'ignore'
            });

            this.runningGames.set(gameId, gameProcess);

            gameProcess.on('exit', (code) => {
                logger.info(`Game process exited`, { gameId, code });
                this.runningGames.delete(gameId);
            });

            gameProcess.unref();
            logger.info(`Game launched successfully`, { gameId, name: game.name });
            
            return { success: true, gameId };
        } catch (error) {
            throw new AppError('Failed to launch game', 'LAUNCH_ERROR', { gameId, error });
        }
    }

    async terminateGame(gameId) {
        const gameProcess = this.runningGames.get(gameId);
        if (!gameProcess) {
            throw new AppError('Game not running', 'GAME_NOT_RUNNING', { gameId });
        }

        try {
            gameProcess.kill();
            this.runningGames.delete(gameId);
            logger.info(`Game terminated successfully`, { gameId });
            return { success: true };
        } catch (error) {
            throw new AppError('Failed to terminate game', 'TERMINATION_ERROR', { gameId, error });
        }
    }

    getGameInfo(gameId) {
        const game = this.games.get(gameId);
        if (!game) {
            throw new AppError('Game not found', 'GAME_NOT_FOUND', { gameId });
        }
        return game;
    }

    isGameRunning(gameId) {
        return this.runningGames.has(gameId);
    }

    getAllGames() {
        return Array.from(this.games.values());
    }

    getModdableGames() {
        return Array.from(this.games.values()).filter(game => game.modSupport);
    }
}

module.exports = new GameManager(); 