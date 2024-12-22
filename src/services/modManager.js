const fs = require('fs');
const path = require('path');
const axios = require('axios');

class ModManager {
  constructor(game) {
    this.game = game;
    this.modsDir = path.join(game.path, 'mods');
    this.ensureModsDirectory();
  }

  ensureModsDirectory() {
    if (!fs.existsSync(this.modsDir)) {
      fs.mkdirSync(this.modsDir);
    }
  }

  async downloadMod(modUrl, modName) {
    const modPath = path.join(this.modsDir, modName);
    const writer = fs.createWriteStream(modPath);

    try {
      const response = await axios({
        method: 'get',
        url: modUrl,
        responseType: 'stream'
      });

      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
    } catch (error) {
      // Remove partially downloaded file if exists
      if (fs.existsSync(modPath)) {
        fs.unlinkSync(modPath);
      }
      throw new Error('Failed to download the mod. Please check the URL and try again.');
    }
  }

  listMods() {
    try {
      return fs.readdirSync(this.modsDir);
    } catch (error) {
      console.error('Error listing mods:', error);
      return [];
    }
  }

  removeMod(modName) {
    const modPath = path.join(this.modsDir, modName);
    try {
      if (fs.existsSync(modPath)) {
        fs.unlinkSync(modPath);
      } else {
        throw new Error('Mod does not exist.');
      }
    } catch (error) {
      throw new Error(`Failed to remove mod "${modName}": ${error.message}`);
    }
  }
}

module.exports = ModManager; 