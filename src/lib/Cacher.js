const util = require("util");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const zlib = require("zlib");

const deflateAsync = util.promisify(zlib.deflate);
const inflateAsync = util.promisify(zlib.inflate);

const HASH_ALGORITHM = "sha1";

const {
  exists,
  readFile,
  isWriteable,
  writeFile,
  createDir,
} = require("../utils/fileHelpers");

// This thing is very bugged and needs to be rewritten
module.exports = class Cacher {
  constructor({ cacheDir, reporter, cacheIndex = {} } = {}) {
    this.cacheDir = cacheDir;
    this.reporter = reporter;
    this.cacheIndex = cacheIndex;
  }

  cacheKey(file = "") {
    return file.replace(/\\/g, "-");
  }

  getDataHash(data) {
    const hash = crypto.createHash(HASH_ALGORITHM);
    return hash.update(JSON.stringify(data)).digest("hex");
  }

  async getFileHash(file) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash(HASH_ALGORITHM);
      const readStream = fs.createReadStream(file);

      readStream.on("readable", () => {
        const data = readStream.read();

        if (data) hash.update(data);
        else {
          resolve(hash.digest("hex"));
        }
      });

      readStream.on("error", (e) => {
        reject(e);
      });
    });
  }

  cacheFile() {
    if (!this.cacheDir) return "index.json";

    return path.join(this.cacheDir, "index.json");
  }

  async primeCache() {
    const doesExist = await exists(this.cacheFile());
    const fileIsWriteable = await isWriteable(this.cacheFile());

    if (doesExist && !fileIsWriteable) {
      throw new Error("expected cache file to be writeable");
    }

    const cache = (await readFile(this.cacheFile())) || "{}";

    let index = {};

    try {
      const parsed = JSON.parse(cache);
      index = parsed;
    } catch (e) {
      this.reporter.error("cache index corrupted, recreating", e);
    }

    this.reporter.verbose("cache primed");

    this.cacheIndex = index;
    return index;
  }

  async writeToFile() {
    if (!(await exists(this.cacheDir))) {
      this.reporter.verbose(`Cache dir doesn't exist, creating`);
      await createDir(this.cacheDir);
    }
    const data = JSON.stringify(this.cacheIndex, 2);

    try {
      await writeFile(this.cacheFile(), data);
    } catch (e) {
      this.reporter.error("Error writing cache index", e);
      return false;
    }

    return true;
  }

  getCachedHash(file) {
    if (file in this.cacheIndex) {
      return this.cacheIndex[file];
    }

    return null;
  }

  async compress(data) {
    const asString = JSON.stringify(data);
    const asBuffer = Buffer.from(asString).toString("utf8");
    const asZipped = await deflateAsync(asBuffer);
    const asZippedString = Buffer.from(asZipped).toString("base64");

    return asZippedString;
  }

  async uncompress(data) {
    const asBase64 = Buffer.from(data, "base64");
    const asBuffer = await inflateAsync(asBase64);
    const asString = Buffer.from(asBuffer).toString("utf8");
    const asObj = JSON.parse(asString);

    return asObj;
  }

  async getCachedData(file) {
    if (this.cacheIndex.data && file in this.cacheIndex.data) {
      const hash = await this.getFileHash(file);

      if (hash === this.cacheIndex.data[file].hash) {
        return await this.uncompress(this.cacheIndex.data[file].data);
      }
    }

    return null;
  }

  async cacheData(file, data) {
    if (!this.cacheIndex.data) {
      this.cacheIndex.data = {};
    }
    this.cacheIndex.data[file] = {
      hash: await this.getFileHash(file),
      data: await this.compress(data),
    };
  }

  async isCachedFile(file, outputFile) {
    if (!(await exists(file))) {
      this.reporter.verbose(`"${file}" does not exist`);
      return false;
    }

    if (!(await exists(outputFile))) {
      this.reporter.verbose(`"${outputFile}" does not exist`);
      return false;
    }

    const previousFileHash = this.getCachedHash(file);

    if (!previousFileHash) {
      return false;
    }

    const fileHash = await this.getFileHash(file);

    return previousFileHash === fileHash;
  }

  // TODO this method is sus
  async markCached(file) {
    const outputFileHash = await this.getFileHash(file);

    this.cacheIndex[file] = outputFileHash;
  }
};
