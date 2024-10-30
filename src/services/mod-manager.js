const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const logger = require('../utils/logger');
const { PATHS } = require('../utils/constants');
const Validators = require('../utils/validators');

class ModManager {
  constructor(game) {
    if (!Validators.isValidGameConfig(game)) {
      throw new Error('Invalid game configuration provided');
    }

    this.game = game;
    this.modsDir = path.join(game.path, PATHS.MODS_DIR);
  }

  async initialize() {
    try {
      await this.ensureModsDirectory();
    } catch (error) {
      logger.error('Failed to initialize ModManager', { 
        error: error.message,
        game: this.game.name 
      });
      throw new Error('Failed to initialize mod manager');
    }
  }

  async ensureModsDirectory() {
    try {
      await fs.access(this.modsDir);
    } catch {
      await fs.mkdir(this.modsDir, { recursive: true });
    }
  }

  async downloadMod(modUrl, modName) {
    if (!Validators.isValidURL(modUrl) || !Validators.isValidModName(modName)) {
      throw new Error('Invalid mod URL or name');
    }

    const modPath = path.join(this.modsDir, modName);
    const tempPath = `${modPath}.temp`;

    try {
      const response = await axios({
        method: 'get',
        url: modUrl,
        responseType: 'stream',
        timeout: 30000 // 30 seconds timeout
      });

      const writer = fs.createWriteStream(tempPath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      await fs.rename(tempPath, modPath);
      
      logger.info(`Successfully downloaded mod: ${modName}`, {
        game: this.game.name,
        modName
      });
    } catch (error) {
      await this.cleanupFailedDownload(tempPath);
      logger.error('Failed to download mod', {
        error: error.message,
        game: this.game.name,
        modName
      });
      throw new Error(`Failed to download mod: ${error.message}`);
    }
  }

  async cleanupFailedDownload(tempPath) {
    try {
      await fs.unlink(tempPath);
    } catch (error) {
      logger.error('Failed to cleanup temporary file', {
        error: error.message,
        path: tempPath
      });
    }
  }

  async listMods() {
    try {
      const files = await fs.readdir(this.modsDir);
      return files.filter(file => !file.endsWith('.temp'));
    } catch (error) {
      logger.error('Failed to list mods', {
        error: error.message,
        game: this.game.name
      });
      return [];
    }
  }

  async removeMod(modName) {
    if (!Validators.isValidModName(modName)) {
      throw new Error('Invalid mod name');
    }

    const modPath = path.join(this.modsDir, modName);
    
    try {
      await fs.access(modPath);
      await fs.unlink(modPath);
      
      logger.info(`Successfully removed mod: ${modName}`, {
        game: this.game.name,
        modName
      });
    } catch (error) {
      logger.error('Failed to remove mod', {
        error: error.message,
        game: this.game.name,
        modName
      });
      throw new Error(`Failed to remove mod: ${error.message}`);
    }
  }
}

module.exports = ModManager; 