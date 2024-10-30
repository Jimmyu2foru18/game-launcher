const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const logger = require('../utils/logger');
const { AppError, FileSystemError } = require('../utils/error-handler');

class GameScanner {
    constructor() {
        this.commonGamePaths = [
            'C:\\Program Files (x86)\\Steam\\steamapps\\common',
            'C:\\Program Files\\Steam\\steamapps\\common',
            'C:\\Program Files (x86)\\Epic Games',
            'C:\\Program Files\\Epic Games',
            'C:\\Games',
            process.env.LOCALAPPDATA + '\\Programs'
        ];

        this.gamePublishers = [
            'Steam', 'Epic Games', 'Ubisoft', 'Electronic Arts',
            'Bethesda', 'Rockstar Games', 'Blizzard'
        ];

        this.scanningStats = {
            directoriesScanned: 0,
            filesAnalyzed: 0,
            gamesFound: 0,
            startTime: null,
            endTime: null
        };
    }

    async scanSystem() {
        try {
            this.resetStats();
            this.scanningStats.startTime = Date.now();
            logger.info('Starting system scan for games');
            
            const games = new Set();
            const scanPromises = [];

            // Scan common game directories in parallel
            for (const dir of this.commonGamePaths) {
                if (await this.directoryExists(dir)) {
                    scanPromises.push(this.scanDirectory(dir, 0, games));
                }
            }

            // Scan drives
            const drives = await this.getSystemDrives();
            for (const drive of drives) {
                scanPromises.push(this.scanDrive(drive, games));
            }

            await Promise.all(scanPromises);

            this.scanningStats.endTime = Date.now();
            this.scanningStats.gamesFound = games.size;

            logger.info('Scan completed', { stats: this.scanningStats });
            return Array.from(games);
        } catch (error) {
            logger.error('Game scanning failed', { error });
            throw new FileSystemError('Failed to scan for games', { 
                error: error.message,
                stats: this.scanningStats 
            });
        }
    }

    async getSystemDrives() {
        try {
            if (process.platform === 'win32') {
                const { stdout } = await execAsync('wmic logicaldisk get name');
                return stdout
                    .split('\n')
                    .filter(line => /^[A-Z]:/.test(line.trim()))
                    .map(drive => drive.trim());
            }
            return ['C:']; // Default to C: if drive detection fails
        } catch (error) {
            logger.error('Failed to get system drives', { error });
            return ['C:']; // Fallback to C: drive
        }
    }

    async directoryExists(dir) {
        try {
            await fs.access(dir);
            return true;
        } catch {
            return false;
        }
    }

    async scanDirectory(dir, depth = 0, games) {
        if (depth > this.maxDepth) return;

        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            this.scanningStats.directoriesScanned++;

            const promises = entries.map(async entry => {
                const fullPath = path.join(dir, entry.name);

                if (entry.isDirectory()) {
                    if (this.shouldSkipDirectory(entry.name)) return;
                    await this.scanDirectory(fullPath, depth + 1, games);
                } else if (this.isGameExecutable(entry.name)) {
                    this.scanningStats.filesAnalyzed++;
                    const gameInfo = await this.analyzeGameExecutable(fullPath);
                    if (gameInfo) {
                        games.add(gameInfo);
                    }
                }
            });

            await Promise.all(promises);
        } catch (error) {
            logger.error('Error scanning directory', { dir, error });
        }
    }

    async scanDrive(drive, games) {
        const commonGameDirs = [
            'Games',
            'Program Files',
            'Program Files (x86)'
        ];

        for (const dir of commonGameDirs) {
            const fullPath = path.join(drive, dir);
            if (await this.directoryExists(fullPath)) {
                await this.scanDirectory(fullPath, 0, games);
            }
        }
    }

    shouldSkipDirectory(dirName) {
        const skipDirs = [
            'Windows', 'System32', 'Program Files', 'ProgramData',
            'Recovery', '$Recycle.Bin', 'Config.Msi', 'Documents and Settings'
        ];
        return skipDirs.includes(dirName) || dirName.startsWith('.');
    }

    isGameExecutable(fileName) {
        // Check if file is an executable and might be a game
        if (!fileName.endsWith('.exe')) return false;

        const gameKeywords = [
            'game', 'launcher', 'start', 'play', 'run',
            ...this.gamePublishers.map(pub => pub.toLowerCase())
        ];

        const name = fileName.toLowerCase();
        return gameKeywords.some(keyword => name.includes(keyword)) ||
               !['unins', 'setup', 'install', 'update'].some(keyword => name.includes(keyword));
    }

    async analyzeGameExecutable(filePath) {
        try {
            const stats = await fs.stat(filePath);
            const fileName = path.basename(filePath);
            const dirName = path.basename(path.dirname(filePath));

            // Basic heuristic to determine if it's likely a game
            const fileSize = stats.size / (1024 * 1024); // Size in MB
            if (fileSize < 1) return null; // Skip very small executables

            return {
                name: this.formatGameName(dirName, fileName),
                path: filePath,
                size: fileSize,
                lastModified: stats.mtime,
                modSupport: this.detectModSupport(filePath)
            };
        } catch (error) {
            logger.error('Error analyzing executable', { filePath, error });
            return null;
        }
    }

    formatGameName(dirName, fileName) {
        // Remove common suffixes and extensions
        let name = fileName.replace('.exe', '');
        name = name.replace(/(launcher|start|run)/i, '');
        
        // Use directory name if it looks better
        if (dirName.length > name.length && !dirName.toLowerCase().includes('bin')) {
            name = dirName;
        }

        // Format the name
        return name
            .split(/[_\-.]/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
            .trim();
    }

    detectModSupport(filePath) {
        // Check for common mod-supporting game engines and directories
        const modDirs = ['mods', 'workshop', 'addons'];
        const gameDir = path.dirname(filePath);
        
        return modDirs.some(dir => 
            fs.existsSync(path.join(gameDir, dir)) ||
            fs.existsSync(path.join(gameDir, '..', dir))
        );
    }

    resetStats() {
        this.scanningStats = {
            directoriesScanned: 0,
            filesAnalyzed: 0,
            gamesFound: 0,
            startTime: null,
            endTime: null
        };
    }
}

module.exports = new GameScanner(); 