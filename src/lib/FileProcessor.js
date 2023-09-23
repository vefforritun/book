const { marked } = require('marked');
const graymatter = require('gray-matter');

const EstimateReadingTime = require('./estimateReadingTime');
const { markedSingleLine, renderMarkdown } = require('./markdown');

const WORDS_PER_MINUTE = 200;

const readingTimeEstimator = new EstimateReadingTime({
  words_per_minute: WORDS_PER_MINUTE,
});

module.exports = class FileProcessor {
  constructor({ reporter, fileReader, outputDir, encoding } = {}) {
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
      in_review = false,
      version = '',
      history = [],
      next = '',
      previous = '',
    } = data;

    const chapter = Number.isNaN(parseInt(metaChapter, 10))
      ? 1
      : parseInt(metaChapter, 10);

    const html = renderMarkdown(content, {
      chapter,
      basedir,
      reporter: this.reporter,
    });

    const previousContent = this.makeNextPrevContent(previous);
    const nextContent = this.makeNextPrevContent(next);
    const estimatedReadingTime = readingTimeEstimator.estimate(
      content.toString(this.encoding)
    );
    const historyLinked = history.map((i) => markedSingleLine(i));

    return {
      file,
      title,
      in_review,
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
