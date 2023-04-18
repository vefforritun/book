const util = require("util");
const fs = require("fs");
const fsPromises = require("fs/promises");
const path = require("path");

const copyFileAsync = util.promisify(fs.copyFile);
const readdirAsync = util.promisify(fs.readdir);

async function exists(file) {
  let ok = true;
  try {
    await fsPromises.access(file, fs.constants.F_OK);
  } catch (e) {
    ok = false;
  }
  return ok;
}

async function readFile(file, { encoding = "utf8" } = {}) {
  if (!(await isReadable(file))) {
    return null;
  }

  const content = await fsPromises.readFile(file);

  return content.toString(encoding);
}

async function createDir(dir) {
  console.log(dir);
  try {
    await fsPromises.mkdir(dir, { recursive: true });
  } catch (e) {
    console.log("ya");
    return false;
  }

  return true;
}

async function writeFile(file, data, { encoding = "utf8" } = {}) {
  return fsPromises.writeFile(file, data, { encoding });
}

async function isWriteable(dir) {
  let writeable = true;
  try {
    await fsPromises.access(dir, fs.constants.W_OK);
  } catch (e) {
    writeable = false;
  }

  return writeable;
}

async function isReadable(dir) {
  let readable = true;
  try {
    await fsPromises.access(dir, fs.constants.R_OK);
  } catch (e) {
    readable = false;
  }

  return readable;
}

async function copyDirectory({ from, to, reporter } = {}) {
  if (!(await isReadable(from))) {
    reporter.warn(`"${from}" is not readable`);
    return false;
  }

  if (await exists(to)) {
    const toStats = await fsPromises.lstat(to);

    if (!toStats.isDirectory()) {
      reporter.warn(`"${to}" exists and is not a directory`);
      return false;
    }
  } else {
    if (!(await createDir(to))) {
      reporter.warn(`Unable to create directory "${to}"`);
      return false;
    }
  }

  const fromStats = await fsPromises.lstat(from);

  if (!fromStats.isDirectory()) {
    reporter.warn(`"${from}" is not a directory`);
    return false;
  }

  const dirContents = await readdirAsync(from);

  for (const item of dirContents) {
    const source = path.join(from, item);
    const target = path.join(to, path.basename(item));

    const stats = await fsPromises.lstat(source);

    if (stats.isDirectory()) {
      if (!(await exists(target))) {
        await createDir(target);
      }
      await copyDirectory({ from: source, to: target, reporter });
    } else if (stats.isFile()) {
      await copyFileAsync(source, target);
    } else {
      // ??
    }
  }

  return true;
}

module.exports = {
  exists,
  isReadable,
  isWriteable,
  readFile,
  writeFile,
  createDir,
  copyDirectory,
};
