const util = require('util');
const fs = require('fs');
const path = require('path');

const accessAsync = util.promisify(fs.access);
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);
const mkdirAsync = util.promisify(fs.mkdir);
const lstatAsync = util.promisify(fs.lstat);
const copyFileAsync = util.promisify(fs.copyFile);
const readdirAsync = util.promisify(fs.readdir);

async function exists(file) {
  let ok = true;
  try {
    await accessAsync(file, fs.constants.F_OK);
  } catch (e) {
    ok = false;
  }
  return ok;
}

async function readFile(file, { encoding = 'utf8' } = {}) {
  if (!await isReadable(file)) {
    return null;
  }

  const content = await readFileAsync(file);

  return content.toString(encoding);
}

async function createDir(dir) {
  try {
    await mkdirAsync(dir, { recursive: true });
  } catch (e) {
    return false;
  }

  return true;
}

async function writeFile(file, data, { encoding = 'utf8' } = {}) {
  return writeFileAsync(file, data, { encoding });
}

async function isWriteable(dir) {
  let writeable = true;
  try {
    await accessAsync(dir, fs.constants.W_OK);
  } catch (e) {
    writeable = false;
  }

  return writeable;
}

async function isReadable(dir) {
  let readable = true;
  try {
    await accessAsync(dir, fs.constants.R_OK);
  } catch (e) {
    readable = false;
  }

  return readable;
}

async function copyDirectory({ from, to, reporter } = {}) {
  if (!await isReadable(from)) {
    reporter.warn(`"${from}" is not readable`);
    return false;
  }

  if (await exists(to)) {
    const toStats = await lstatAsync(to);

    if (!toStats.isDirectory()) {
      reporter.warn(`"${to}" exists and is not a directory`);
      return false;
    };
  } else {
    if (!await createDir(to)) {
      reporter.warn(`Unable to create directory "${to}"`);
      return false;
    }
  }

  const fromStats = await lstatAsync(from);

  if (!fromStats.isDirectory()) {
    reporter.warn(`"${from}" is not a directory`);
    return false;
  };

  const dirContents = await readdirAsync(from);

  for (const item of dirContents) {
    const source = path.join(from, item);
    const target = path.join(to, path.basename(item));

    const stats = await lstatAsync(source);

    if (stats.isDirectory()) {
      if (!await exists(target)) {
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

function autolink(s) {
  const pattern = /(^|[\s\n]|<[A-Za-z]*\/?>)((?:https?|ftp):\/\/[\-A-Z0-9+\u0026\u2019@#\/%?=()~_|!:,.;]*[\-A-Z0-9+\u0026@#\/%=~()_|])/gi;

  return (s || '').replace(pattern, "$1<a href='$2'>$2</a>");
}

module.exports = {
  exists,
  isReadable,
  isWriteable,
  readFile,
  writeFile,
  createDir,
  copyDirectory,
  autolink,
};
