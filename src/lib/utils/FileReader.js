const path = require("path");
const { readFile } = require("../utils");

module.exports = class FileReader {
  getBaseDir(file) {
    return path.dirname(file);
  }

  async readFile(file) {
    return readFile(file);
  }
};
