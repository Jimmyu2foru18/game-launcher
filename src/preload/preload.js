const { contextBridge, ipcRenderer } = require('electron');

const API = {
    games: {
        load: () => ipcRenderer.invoke('load-games'),
        launch: (gameId) => ipcRenderer.invoke('launch-game', gameId),
        getModdable: () => ipcRenderer.invoke('get-moddable-games')
    },
    mods: {
        download: (gameId, modUrl, modName) => 
            ipcRenderer.invoke('download-mod', gameId, modUrl, modName),
        list: (gameId) => ipcRenderer.invoke('list-mods', gameId),
        remove: (gameId, modName) => ipcRenderer.invoke('remove-mod', gameId, modName)
    },
    updates: {
        check: () => ipcRenderer.invoke('check-updates'),
        download: (gameId) => ipcRenderer.invoke('download-update', gameId)
    },
    auth: {
        register: (userData) => ipcRenderer.invoke('register-user', userData),
        login: (credentials) => ipcRenderer.invoke('login-user', credentials),
        logout: () => ipcRenderer.invoke('logout-user')
    },
    settings: {
        get: (userId) => ipcRenderer.invoke('get-settings', userId),
        update: (userId, settings) => ipcRenderer.invoke('update-settings', userId, settings)
    },
    stats: {
        getGameStats: (userId, gameId) => ipcRenderer.invoke('get-game-stats', userId, gameId),
        getUserStats: (userId) => ipcRenderer.invoke('get-user-stats', userId)
    },
    parentalControl: {
        checkAccess: (userId, gameId) => ipcRenderer.invoke('check-game-access', userId, gameId),
        setRestrictions: (userId, settings) => ipcRenderer.invoke('set-parental-controls', userId, settings)
    },
    scanner: {
        scanGames: () => ipcRenderer.invoke('scan-games'),
        importGame: (gameInfo) => ipcRenderer.invoke('import-scanned-game', gameInfo)
    }
};

contextBridge.exposeInMainWorld('electronAPI', API); 