const path = require('path');

const Reporter = require('./lib/Reporter');
const { isWriteable, isReadable, writeFile, exists, createDir, copyDirectory } = require('./lib/utils');
const FileProcessor = require('./lib/FileProcessor');
const Cacher = require('./lib/Cacher');
const { chapter, index, allInOne } = require('./assemble');
const FileReader = require('./lib/utils/FileReader');

/*** Config ***/

const silent = false;
const verbose = false;
const bookFile = '../book.json';
const outputDir = './build';
const indexFile = 'index.html';
const allInOneFile = 'all.html';
const cacheDir = './cache';
const encoding = 'utf8';

/*** /Config ***/

const book = require(bookFile);

class NullCacher {
  isCached() { }
  markCached() { }
  getCachedData() { }
  cacheData() { }
  isCachedFile() { }
}

let cacher = new NullCacher();
const reporter = new Reporter({ silent, verbose });
const fileReader = new FileReader();
const processor = new FileProcessor({ outputDir, reporter, encoding, fileReader });

function getOutputFilename(file) {
  console.assert(typeof file === 'string', 'file should be string');
  console.assert(typeof outputDir === 'string', 'outputDir should be string');
  const extension = path.extname(file);
  const basename = path.basename(file, extension);

  return path.join(outputDir, `${basename}.html`);
}

async function main() {
  reporter.info(`Starting generation!`);
  let cacheEnabled = false;

  if (cacheDir) {
    if (!await exists(cacheDir)) {
      try {
        await createDir(cacheDir);
      } catch(e) {
        reporter.error(`Cache directory "${cacheDir}" does not exist and unable to create: ${e}`);
        process.exit(1);
      }
    }

    let cacheIsReadable = await isReadable(cacheDir);
    let cacheIsWritable = await isWriteable(cacheDir);

    if (!cacheIsReadable || !cacheIsWritable) {
      reporter.error(`Cache directory "${cacheDir}" is not readable or writeable`);
      process.exit(1);
    }

    reporter.info('caching enabled');
    cacheEnabled = true;
    cacher = new Cacher({ cacheDir, reporter });
    await cacher.primeCache();
  } else {
    reporter.info('caching NOT enabled');
  }

  if (!('chapters' in book)) {
    reporter.error('Cannot find chapters in "book.json"');
    process.exit(1);
  }

  if (!await exists(outputDir)) {
    try {
      await createDir(outputDir);
    } catch(e) {
      reporter.error(`Output directory "${outputDir}" does not exist and unable to create: ${e}`);
      process.exit(1);
    }
  }

  if (!await isWriteable(outputDir)) {
    reporter.error(`Output directory "${outputDir}" is not writeable`);
    process.exit(1);
  }

  const chapters = book.chapters.files;

  let allReadable = true;
  await Promise.all(chapters.map(async (chapter) => {
    if (!await isReadable(chapter)) {
      reporter.error(`File "${chapter}" is not readable`);
      allReadable = false;
    }
  }));

  if (!allReadable) {
    reporter.error('Not all files are readable, exiting');
    process.exit(1);
  }

  async function processFiles(files) {
    const processed = [];
    console.log(files)
    for (file of files) {
      reporter.group(`Processing "${file}"`);
      const outputFile = getOutputFilename(file);
      const outputFilebasename = path.basename(outputFile);

      let data = await cacher.getCachedData(file);

      if (data) {
        reporter.verbose(`data for "${file}" is cached`);
      } else {
        reporter.info(`data for "${file}" is not cached`);
        data = await processor.process(file);
        data.outputFile = outputFile;
        data.outputFilebasename = outputFilebasename;
        await cacher.cacheData(file, data);
      }

      const isCached = await cacher.isCachedFile(file, outputFile);

      if (isCached) {
        reporter.verbose(`${outputFile} is current`);
      } else {
        reporter.info(`${outputFile} is not current, creating`);
        const assembled = await chapter(data, reporter);
        await writeFile(outputFile, assembled);
        await cacher.markCached(file, outputFile);
      }

      processed.push(data);
      reporter.groupEnd(`Done processing "${file}"`);
    }
    return processed;
  }

  const processed = await processFiles(chapters);

  // TODO we don't track appendixes in ToC.. yet
  await processFiles(book.appendix || []);

  const data = {
    title: book.title,
    subtitle: book.subtitle,
    version: book.version,
    contact: book.contact,
    chapters: book.chapters,
  };

  // TODO cache all-in-one based on *all* chapters
  try {
    reporter.group(`Assembling all-in-one file`);
    const allInOneAssembled = await allInOne(data, processed, reporter);
    const acutalAllInOneFile = path.join(outputDir, allInOneFile);
    await writeFile(acutalAllInOneFile, allInOneAssembled);
    reporter.groupEnd(`Done assembling all-in-one file`);
  } catch (e) {
    reporter.warn(`Unable to create all-in-one file, ${e.message}`);
    // don't exit here, want to save the cache
  }

  // TODO cache index based on *all* chapters
  try {
    reporter.group(`Assembling index`);
    const indexAssembled = await index(data, processed, reporter);
    const actualIndexFile = path.join(outputDir, indexFile);
    await writeFile(actualIndexFile, indexAssembled);
    reporter.groupEnd(`Done assembling index`);
  } catch (e) {
    reporter.warn(`Unable to create index file, ${e.message}`);
    // don't exit here, want to save the cache
  }

  if (cacheEnabled) {
    if (await cacher.writeToFile()) {
      reporter.info('cache written to disk');
    } else {
      reporter.info('cache NOT written to disk');
    }
  }

  reporter.group(`Copying from template dir`);
  await copyDirectory({ from: './template', to: outputDir, reporter });
  reporter.groupEnd(`Done copying from template dir`);

  reporter.group(`Copying from chapter image dir`);
  await copyDirectory({ from: './chapters/img', to: path.join(outputDir, 'img'), reporter });
  reporter.groupEnd(`Done copying from template dir`);

  reporter.info('All done!');
  process.exit(0);
}

main().catch((e) => {
  reporter.error('Error running book generation', e);
  process.exit(1);
});
