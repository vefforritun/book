const util = require('util');
const fs = require('fs');
const path = require('path');

const marked = require('marked');
const graymatter = require('gray-matter');

const Renderer = require('./Renderer');
const estimateReadingTime = require('./estimateReadingTime');

const readFileAsync = util.promisify(fs.readFile);

module.exports = class FileProcessor {
  constructor({ reporter, outputDir, encoding } = {}) {
    this.reporter = reporter;
    this.outputDir = outputDir;
    this.encoding = encoding;
  }

  makeNextPrevContent(content) {
    if (!content) {
      return '';
    }

    const replaced = content.replace(/\\\[/g, '[');

    const output = marked(replaced).replace('<div class="paragraphs">', '');

    return output;
  }

  async process(file) {
    const basedir = path.dirname(file);

    this.reporter.verbose(`Processing "${file}"`);

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
    const renderer = new Renderer({ chapter, basedir, reporter: this.reporter });

    marked.setOptions({
      renderer,
    });

    const html = renderer.postRender(marked(content.toString(this.encoding)));
    const previousContent = this.makeNextPrevContent(previous);
    const nextContent = this.makeNextPrevContent(next);
    const estimatedReadingTime = estimateReadingTime(content.toString(this.encoding));

    return {
      file,
      title,
      chapter,
      version,
      next,
      previous,
      nextContent,
      previousContent,
      estimatedReadingTime,
      content: html,
    };
  }
}
