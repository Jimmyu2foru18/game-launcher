const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const ModManager = require('./modManager');
const UpdateChecker = require('./updateChecker');

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  win.loadFile('index.html');
}

ipcMain.handle('load-games', async () => {
  const gamesPath = path.join(__dirname, 'games.json');
  const data = await fs.promises.readFile(gamesPath, 'utf8');
  return JSON.parse(data);
});

ipcMain.on('launch-game', (event, gamePath) => {
  try {
    const gameProcess = spawn(gamePath, [], { detached: true, stdio: 'ignore' });
    gameProcess.unref();
  } catch (error) {
    console.error('Error launching game:', error);
  }
});

ipcMain.handle('get-moddable-games', async () => {
  const gamesPath = path.join(__dirname, 'games.json');
  const data = await fs.promises.readFile(gamesPath, 'utf8');
  const games = JSON.parse(data);
  return games.filter(game => game.modSupport);
});

ipcMain.handle('download-mod', async (event, gameId, modUrl, modName) => {
  try {
    const gamesPath = path.join(__dirname, 'games.json');
    const data = await fs.promises.readFile(gamesPath, 'utf8');
    const games = JSON.parse(data);
    const game = games.find(g => g.id === gameId);
    if (!game || !game.modSupport) {
      throw new Error('Game does not support mods.');
    }
    const modManager = new ModManager(game);
    await modManager.downloadMod(modUrl, modName);
    return { success: true };
  } catch (error) {
    console.error('Error downloading mod:', error);
    return { success: false, message: error.message };
  }
});

ipcMain.handle('list-mods', async (event, gameId) => {
  try {
    const gamesPath = path.join(__dirname, 'games.json');
    const data = await fs.promises.readFile(gamesPath, 'utf8');
    const games = JSON.parse(data);
    const game = games.find(g => g.id === gameId);
    if (!game || !game.modSupport) {
      throw new Error('Game does not support mods.');
    }
    const modManager = new ModManager(game);
    const mods = modManager.listMods();
    return { success: true, mods };
  } catch (error) {
    console.error('Error listing mods:', error);
    return { success: false, message: error.message };
  }
});

ipcMain.handle('remove-mod', async (event, gameId, modName) => {
  try {
    const gamesPath = path.join(__dirname, 'games.json');
    const data = await fs.promises.readFile(gamesPath, 'utf8');
    const games = JSON.parse(data);
    const game = games.find(g => g.id === gameId);
    if (!game || !game.modSupport) {
      throw new Error('Game does not support mods.');
    }
    const modManager = new ModManager(game);
    modManager.removeMod(modName);
    return { success: true };
  } catch (error) {
    console.error('Error removing mod:', error);
    return { success: false, message: error.message };
  }
});

// IPC Handler for Checking Updates
ipcMain.handle('check-updates', async () => {
  try {
    const gamesPath = path.join(__dirname, 'games.json');
    const data = await fs.promises.readFile(gamesPath, 'utf8');
    const games = JSON.parse(data);
    const updatePromises = games.map(async (game) => {
      const updateChecker = new UpdateChecker(game);
      const updateStatus = await updateChecker.checkForUpdate();
      return {
        gameId: game.id,
        gameName: game.name,
        updateAvailable: updateStatus.updateAvailable,
        latestVersion: updateStatus.updateInfo ? updateStatus.updateInfo.latestVersion : null,
        downloadURL: updateStatus.updateInfo ? updateStatus.updateInfo.downloadURL : null
      };
    });

    const updateResults = await Promise.all(updatePromises);
    return { success: true, updates: updateResults };
  } catch (error) {
    console.error('Error checking updates:', error);
    return { success: false, message: error.message };
  }
});

// IPC Handler for Downloading Updates
ipcMain.handle('download-update', async (event, gameId) => {
  try {
    const gamesPath = path.join(__dirname, 'games.json');
    const data = await fs.promises.readFile(gamesPath, 'utf8');
    const games = JSON.parse(data);
    const game = games.find(g => g.id === gameId);
    if (!game || !game.updateURL) {
      throw new Error('Game does not have an update URL.');
    }

    const updateChecker = new UpdateChecker(game);
    const updateStatus = await updateChecker.checkForUpdate();

    if (!updateStatus.updateAvailable) {
      throw new Error('No updates available.');
    }

    const savePath = path.join(__dirname, 'updates', `${game.name}-update.zip`);
    await updateChecker.downloadUpdate(updateStatus.updateInfo.downloadURL, savePath);

    // Implement update installation logic here
    // For example, unzip the update and replace game files

    return { success: true, message: 'Update downloaded successfully.' };
  } catch (error) {
    console.error('Error downloading update:', error);
    return { success: false, message: error.message };
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
}); 