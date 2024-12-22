// Currently empty, but can be used to preload scripts or expose APIs 
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  loadGames: () => ipcRenderer.invoke('load-games'),
  launchGame: (gamePath) => {
    if (typeof gamePath === 'string' && gamePath.trim() !== '') {
      ipcRenderer.send('launch-game', gamePath);
    } else {
      console.error('Invalid game path provided.');
    }
  },
  getModdableGames: () => ipcRenderer.invoke('get-moddable-games'),
  downloadMod: (gameId, modUrl, modName) => ipcRenderer.invoke('download-mod', gameId, modUrl, modName),
  listMods: (gameId) => ipcRenderer.invoke('list-mods', gameId),
  removeMod: (gameId, modName) => ipcRenderer.invoke('remove-mod', gameId, modName),
  checkUpdates: () => ipcRenderer.invoke('check-updates'),
  downloadUpdate: (gameId) => ipcRenderer.invoke('download-update', gameId)
}); 