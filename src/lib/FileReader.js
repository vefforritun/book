const path = require('path');
const { readFile } = require('../utils/fileHelpers');

// Merge this with or replace with fileHelpers.js
module.exports = class FileReader {
  getBaseDir(file) {
    return path.dirname(file);
  }

  async readFile(file) {
    return readFile(file);
  }
};
