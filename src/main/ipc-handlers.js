const { ipcMain } = require('electron');
const gameManager = require('../services/game-manager');
const modManager = require('../services/mod-manager');
const updateChecker = require('../services/update-checker');
const { ErrorHandler } = require('../utils/error-handler');
const authService = require('../services/auth-service');
const settingsManager = require('../services/settings-manager');
const statsService = require('../services/stats-service');
const parentalControl = require('../services/parental-control');
const gameScanner = require('../services/game-scanner');

function setupIpcHandlers() {
    // Game Management
    ipcMain.handle('load-games', ErrorHandler.wrapAsync(async () => {
        return gameManager.getAllGames();
    }));

    ipcMain.handle('launch-game', ErrorHandler.wrapAsync(async (event, gameId) => {
        return gameManager.launchGame(gameId);
    }));

    // Mod Management
    ipcMain.handle('get-moddable-games', ErrorHandler.wrapAsync(async () => {
        return gameManager.getModdableGames();
    }));

    ipcMain.handle('download-mod', ErrorHandler.wrapAsync(async (event, gameId, modUrl, modName) => {
        const game = gameManager.getGameInfo(gameId);
        const modManagerInstance = new modManager(game);
        return modManagerInstance.downloadMod(modUrl, modName);
    }));

    // Update Management
    ipcMain.handle('check-updates', ErrorHandler.wrapAsync(async () => {
        const games = gameManager.getAllGames();
        const updatePromises = games.map(game => {
            const checker = new updateChecker(game);
            return checker.checkForUpdate();
        });
        return Promise.all(updatePromises);
    }));

    // Auth handlers
    ipcMain.handle('register-user', ErrorHandler.wrapAsync(async (event, userData) => {
        return authService.registerUser(userData.username, userData.password, userData.email);
    }));

    ipcMain.handle('login-user', ErrorHandler.wrapAsync(async (event, credentials) => {
        return authService.login(credentials.username, credentials.password);
    }));

    // Settings handlers
    ipcMain.handle('get-settings', ErrorHandler.wrapAsync(async (event, userId) => {
        return settingsManager.getUserSettings(userId);
    }));

    ipcMain.handle('update-settings', ErrorHandler.wrapAsync(async (event, userId, settings) => {
        return settingsManager.updateSettings(userId, settings);
    }));

    // Stats handlers
    ipcMain.handle('get-game-stats', ErrorHandler.wrapAsync(async (event, userId, gameId) => {
        return statsService.getGameStats(userId, gameId);
    }));

    // Parental control handlers
    ipcMain.handle('check-game-access', ErrorHandler.wrapAsync(async (event, userId, gameId) => {
        return parentalControl.canAccessGame(userId, gameId);
    }));

    // Game scanning handlers
    ipcMain.handle('scan-games', ErrorHandler.wrapAsync(async () => {
        const foundGames = await gameScanner.scanSystem();
        return foundGames;
    }));

    ipcMain.handle('import-scanned-game', ErrorHandler.wrapAsync(async (event, gameInfo) => {
        return gameManager.importGame(gameInfo);
    }));
}

module.exports = {
    setupIpcHandlers
}; 