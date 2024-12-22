const axios = require('axios');
const fs = require('fs');
const path = require('path');

class UpdateChecker {
  constructor(game) {
    this.game = game;
    this.currentVersion = game.version || '1.0.0'; // Assume current version
  }

  async checkForUpdate() {
    try {
      const response = await axios.get(this.game.updateURL);
      const updateInfo = response.data;

      if (this.isNewerVersion(updateInfo.latestVersion)) {
        return { updateAvailable: true, updateInfo };
      } else {
        return { updateAvailable: false };
      }
    } catch (error) {
      console.error(`Error checking updates for ${this.game.name}:`, error);
      return { updateAvailable: false, error: error.message };
    }
  }

  isNewerVersion(latestVersion) {
    const current = this.currentVersion.split('.').map(num => parseInt(num));
    const latest = latestVersion.split('.').map(num => parseInt(num));

    for (let i = 0; i < latest.length; i++) {
      if (latest[i] > (current[i] || 0)) {
        return true;
      } else if (latest[i] < (current[i] || 0)) {
        return false;
      }
    }
    return false;
  }

  async downloadUpdate(downloadURL, savePath) {
    const writer = fs.createWriteStream(savePath);

    try {
      const response = await axios({
        method: 'get',
        url: downloadURL,
        responseType: 'stream'
      });

      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
    } catch (error) {
      console.error(`Error downloading update for ${this.game.name}:`, error);
      throw new Error('Failed to download the update.');
    }
  }
}

module.exports = UpdateChecker; 