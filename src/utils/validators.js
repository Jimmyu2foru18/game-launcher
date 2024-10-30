const { REGEX } = require('./constants');

class Validators {
  static isValidModName(name) {
    return typeof name === 'string' && 
           REGEX.MOD_NAME.test(name) && 
           name.trim().length > 0;
  }

  static isValidURL(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  static isValidGameConfig(game) {
    return game && 
           typeof game.id === 'number' && 
           typeof game.name === 'string' && 
           typeof game.path === 'string';
  }
}

module.exports = Validators; 