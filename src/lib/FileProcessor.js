const path = require('path');

const { marked } = require('marked');
const graymatter = require('gray-matter');

const Renderer = require('./Renderer');
const EstimateReadingTime = require('./estimateReadingTime');
const postprocess = require('../utils/postprocess');
const { markedSingleLine } = require('../utils/markdown');
const { readFile } = require('../utils/fileHelpers');

const WORDS_PER_MINUTE = 200;

const readingTimeEstimator = new EstimateReadingTime({
  words_per_minute: WORDS_PER_MINUTE,
});

module.exports = class FileProcessor {
  constructor({
    reporter, fileReader, outputDir, encoding,
  } = {}) {
    this.reporter = reporter;
    this.fileReader = fileReader;
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
    this.reporter.verbose(`Processing "${file}"`);

    const basedir = this.fileReader.getBaseDir(file);
    const fileContent = await this.fileReader.readFile(file);

    const { data, content } = graymatter(fileContent);

    const {
      title = '',
      chapter: metaChapter = 0,
      version = '',
      history = [],
      next = '',
      previous = '',
    } = data;

    const chapter = isNaN(parseInt(metaChapter, 10))
      ? 1
      : parseInt(metaChapter, 10);
    const renderer = new Renderer({
      chapter,
      basedir,
      reporter: this.reporter,
    });

    marked.setOptions({
      renderer,
    });

    const renderedHtml = renderer.postRender(
      marked(content.toString(this.encoding)),
    );

    const html = postprocess(renderedHtml);

    const previousContent = this.makeNextPrevContent(previous);
    const nextContent = this.makeNextPrevContent(next);
    const estimatedReadingTime = readingTimeEstimator.estimate(
      content.toString(this.encoding),
    );
    const historyLinked = history.map((i) => markedSingleLine(i));

    return {
      file,
      title,
      chapter,
      version,
      history: historyLinked,
      next,
      previous,
      nextContent,
      previousContent,
      estimatedReadingTime,
      content: html,
    };
  }
};
