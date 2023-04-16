const util = require("util");
const fs = require("fs");
const path = require("path");

const { marked } = require("marked");
const graymatter = require("gray-matter");

const Renderer = require("./Renderer");
const EstimateReadingTime = require("./estimateReadingTime");
const postprocess = require("./utils/postprocess");
const { markedSingleLine } = require("./utils/markedHelpers");

const readFileAsync = util.promisify(fs.readFile);

const WORDS_PER_MINUTE = 200;

const readingTimeEstimator = new EstimateReadingTime({
  words_per_minute: WORDS_PER_MINUTE,
});

module.exports = class FileProcessor {
  constructor({ reporter, outputDir, encoding } = {}) {
    this.reporter = reporter;
    this.outputDir = outputDir;
    this.encoding = encoding;
  }

  makeNextPrevContent(content) {
    if (!content) {
      return "";
    }

    const replaced = content.replace(/\\\[/g, "[");

    const output = marked(replaced).replace('<div class="paragraphs">', "");

    return output;
  }

  async process(file) {
    const basedir = path.dirname(file);

    this.reporter.verbose(`Processing "${file}"`);

    const fileContent = await readFileAsync(file);

    const {
      content,
      data: {
        title = "",
        chapter: metaChapter = 0,
        version = "",
        history = [],
        next = "",
        previous = "",
      } = {},
    } = graymatter(fileContent);

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
      marked(content.toString(this.encoding))
    );

    const html = postprocess(renderedHtml);

    const previousContent = this.makeNextPrevContent(previous);
    const nextContent = this.makeNextPrevContent(next);
    const estimatedReadingTime = readingTimeEstimator.estimate(
      content.toString(this.encoding)
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
