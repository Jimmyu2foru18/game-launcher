const { BrowserWindow } = require('electron');
const path = require('path');
const logger = require('../utils/logger');

class WindowManager {
    constructor() {
        this.windows = new Map();
    }

    createMainWindow() {
        const window = new BrowserWindow({
            width: 1200,
            height: 800,
            webPreferences: {
                preload: path.join(__dirname, '../preload/preload.js'),
                nodeIntegration: false,
                contextIsolation: true,
                sandbox: true
            }
        });

        window.loadFile(path.join(__dirname, '../../index.html'));
        this.windows.set('main', window);

        window.on('closed', () => {
            this.windows.delete('main');
        });

        logger.info('Main window created');
        return window;
    }

    getWindow(name) {
        return this.windows.get(name);
    }

    closeAll() {
        this.windows.forEach(window => window.close());
        this.windows.clear();
    }
}

module.exports = new WindowManager(); 