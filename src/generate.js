const util = require('util');
const fs = require('fs');
const path = require('path');

const marked = require('marked');
const graymatter = require('gray-matter');
const prettier = require("prettier");

const Renderer = require('./Renderer');

const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);
const accessAsync = util.promisify(fs.access);

/*** Config ***/

const silent = false;
const verbose = true;
const tocFile = '../toc.json';
const outputDir = './build';
const encoding = 'utf8';

/*** /Config ***/

const toc = require(tocFile);

class Reporter {
  constructor({ silent = false, verbose = false } = {}) {
    this.silent = silent;
    this.isVerbose = verbose;
  }

  error(...m) {
    if (!this.silent) {
      console.error(...m);
    }
  }

  warn(...m) {
    if (!this.silent) {
      console.warn(...m);
    }
  }

  info(...m) {
    if (!this.silent) {
      console.info(...m);
    }
  }

  verbose(...m) {
    if (this.isVerbose) {
      console.info(...m);
    }
  }
}

const reporter = new Reporter({silent, verbose});

function makeNextPrevContent(content) {
  if (!content) {
    return '';
  }

  const replaced = content.replace(/\\\[/g, '[');

  const output = marked(replaced).replace('<div class="paragraphs">', '');

  return output;
}

async function processFile(file) {
  const extension = path.extname(file);
  const basename = path.basename(file, extension);
  const basedir = path.dirname(file);

  reporter.verbose(`Processing "${file}"`);

  const outputPath = path.join(outputDir, `${basename}.html`);

  const fileContent = await readFileAsync(file);

  const {
    content,
    data: {
      title = '',
      chapter: metaChapter = 0,
      version = '',
      next = '',
      previous = '',
    } = {},
  } = graymatter(fileContent);

  const chapter = isNaN(parseInt(metaChapter, 10)) ? 1 : parseInt(metaChapter, 10);
  const renderer = new Renderer({ chapter, basedir, reporter });

  marked.setOptions({
    renderer,
  });

  const html = renderer.postRender(marked(content.toString(encoding)));
  const prevContent = makeNextPrevContent(previous);
  const nextContent = makeNextPrevContent(next);

  const nav = prevContent || nextContent ?
    `<nav>
      <ul>
        <li class="prev">${prevContent}</li>
        <li class="index"><a href="/">Efnisyfirlit</a></li>
        <li class="next">${nextContent}</li>
      </ul>
    </nav>` : '';

  const outputContent = `<!doctype html>
<!--
Velkominn ferðalangur, bakvið tjöldin, í uppsprettuna.
Þetta HTML er sjálfkrafa útbúið út frá Markdown skjölum.
Sjá nánar:
https://github.com/vefforritun/book
-->
<html lang="is">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Vefforitun—${title}</title>
    <link href="https://fonts.googleapis.com/css2?family=Fira+Mono:wght@400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="reset.css"/>
    <link rel="stylesheet" href="styles.css"/>
  </head>
  <body>
    <main>
      <header>
        <h1>${title}</h1>
      </header>

      <article>
        ${html}
      </article>

      <footer>
        ${nav}
        <hr>
        ${version ? `<div class="version">${version}</div>` : ''}
      </footer>
    </main>
  </body>
</html>`;

  let prettyContent = outputContent;

  const prettierOptions = {
    'parser': 'html',
    'htmlWhitespaceSensitivity': 'css',
    'printWidth': 80,
    'quoteProps': 'as-needed',
    'singleQuote': false,
    'useTabs': false,
  };

  try {
    prettyContent = prettier.format(prettyContent, prettierOptions);
    reporter.info(`Ran prettier for "${file}"`);
  } catch (e) {
    reporter.error(`Unable to run prettier for "${file}"`, e.message);
  }

  return writeFileAsync(outputPath, prettyContent, { encoding });
}

async function main() {
  if (!('chapters' in toc)) {
    reporter.error('Cannot find chapters in "toc.json"');
    process.exit(1);
  }

  const chapters = toc.chapters;

  let allReadable = true;
  await Promise.all(chapters.map(async (chapter) => {
    let readable = true;
    try {
      await accessAsync(chapter, fs.constants.R_OK);
    } catch (e) {
      readable = false;
    }

    if (!readable) {
      reporter.error(`File "${chapter}" is not readable`);
      allReadable = false;
    }
  }));

  if (!allReadable) {
    reporter.error('Not all files are readable, exiting');
    process.exit(1);
  }

  let writeable = true;
  try {
    await accessAsync(outputDir, fs.constants.W_OK);
  } catch (e) {
    writeable = false;
  }

  if (!writeable) {
    reporter.error(`Output directory "${outputDir}" is not writeable`);
    process.exit(1);
  }

  try {
    await Promise.all(chapters.map(processFile));
  } catch (e) {
    reporter.error('Error processing files', e);
    process.exit(1);
  }

  console.log('All done!');
}

main().catch((e) => {
  reporter.error('Error running book generation', e);
  process.exit(1);
});
