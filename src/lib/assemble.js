const prettier = require('prettier');
const { singleLineMarkdown } = require('../utils/markdown');

function readingTimeReadable(time) {
  return `um ${time} mínútna lestími.`;
}

function generateHistory(history) {
  if (!Array.isArray(history) || history.length === 0) {
    return '';
  }

  return `
    <details class="history">
      <summary>Fyrri útgáfur</summary>
      <ul>
      ${history.map((item) => `<li>${item}</li>`).join('')}
      </ul>
    </details>
  `;
}

function localPrettier(content, reporter) {
  let prettyContent = content;

  const prettierOptions = {
    parser: 'html',
    htmlWhitespaceSensitivity: 'css',
    printWidth: 80,
    quoteProps: 'as-needed',
    singleQuote: false,
    useTabs: false,
  };

  try {
    reporter.info('Prettifying content');
    prettyContent = prettier.format(prettyContent, prettierOptions);
    reporter.info('Done prettifying content');
  } catch (e) {
    reporter.error('Unable to run prettier', e.message);
  }

  return prettyContent;
}

function chapter(data, reporter) {
  const {
    title,
    chapter: dataChapter,
    version,
    history,
    nextContent,
    previousContent,
    estimatedReadingTime,
    content,
  } = data;

  const readingTime = estimatedReadingTime > 0 ? '' : '';
  // `<p class="reading-time">${readingTimeReadable(estimatedReadingTime)}</p>` : '';

  const nav =
    previousContent || nextContent
      ? `<nav>
        <ul>
          <li class="prev">${previousContent}</li>
          <li class="index"><a href="/">Efnisyfirlit</a></li>
          <li class="next">${nextContent}</li>
        </ul>
      </nav>`
      : '';

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
      <title>${title}—Vefforritun</title>
      <link href="https://fonts.googleapis.com/css2?family=Fira+Mono:wght@400;500&display=swap" rel="stylesheet">
      <link rel="stylesheet" href="reset.css"/>
      <link rel="stylesheet" href="styles.css"/>
      <script defer data-domain="bok.vefforritun.is" src="https://plausible.io/js/plausible.js"></script>
    </head>
    <body>
      <main>
        <header>
          <h1>Kafli ${dataChapter}: ${title}</h1>
          ${readingTime}
        </header>

        <article>
          ${content}
        </article>

        <footer>
          ${nav}
          <hr>
          ${
            version
              ? `<p class="version">${singleLineMarkdown(version)}</p>`
              : ''
          }
          ${generateHistory(history)}
        </footer>
      </main>
    </body>
  </html>`;

  return localPrettier(outputContent, reporter);
}

function allInOne({ title, version }, processed, reporter) {
  const procssedContent = [];

  const totalEstimatedReadingTime = processed.reduce(
    (total, item) => item.estimatedReadingTime + total,
    0
  );

  processed.forEach((item) => {
    const {
      title: dataTitle,
      chapter: dataChapter,

      estimatedReadingTime,
      content,
    } = item;

    const contentWithFixedHeadings = content
      .replace(/<h2/g, '<h3')
      .replace(/<\/h2>/g, '</h3>');
    const readingTime =
      estimatedReadingTime > 0
        ? `<p class="reading-time">${readingTimeReadable(
            estimatedReadingTime
          )}</p>`
        : '';

    procssedContent.push(`
      <article>
        <h2>Kafli ${dataChapter}: ${dataTitle}</h2>
        ${readingTime}

        <div class="content">${contentWithFixedHeadings}</div>
      </article>
    `);
  });

  const totalReadingTime =
    totalEstimatedReadingTime > 0
      ? `<p class="reading-time">${readingTimeReadable(
          totalEstimatedReadingTime
        )}</p>`
      : '';

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
      <title>${title}—Vefforritun</title>
      <link href="https://fonts.googleapis.com/css2?family=Fira+Mono:wght@400;500&display=swap" rel="stylesheet">
      <link rel="stylesheet" href="reset.css"/>
      <link rel="stylesheet" href="styles.css"/>
      <script defer data-domain="bok.vefforritun.is" src="https://plausible.io/js/plausible.js"></script>
    </head>
    <body>
      <main>
        <header>
          <h1>${title}</h1>
          ${totalReadingTime}
        </header>

        ${procssedContent.join('')}

        <footer>
          <hr>
          ${version ?? ''}
        </footer>
      </main>
    </body>
  </html>`;

  return localPrettier(outputContent, reporter);
}

function index(
  { title, subtitle, version, contact, chapters },
  processed,
  reporter
) {
  const chaptersContent = processed
    .map((item) => {
      const url = item.outputFilebasename;
      const { title: itemTitle } = item;
      const readingTime = readingTimeReadable(item.estimatedReadingTime);

      return `<li><a href="${url}">${itemTitle}</a>, <span class="reading-time">${readingTime}</span></li>`;
    })
    .join('');

  const totalEstimatedReadingTime = processed.reduce(
    (total, item) => item.estimatedReadingTime + total,
    0
  );

  // eslint-disable-next-line no-unused-vars
  const totalReadingTime =
    totalEstimatedReadingTime > 0
      ? readingTimeReadable(totalEstimatedReadingTime)
      : '';

  const outputContent = `
  <!DOCTYPE html>
  <html lang="is">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Vefforritun</title>
      <link href="https://fonts.googleapis.com/css2?family=Fira+Mono:wght@400;500&display=swap" rel="stylesheet">
      <link rel="stylesheet" href="reset.css"/>
      <link rel="stylesheet" href="xgrid.css"/>
      <link rel="stylesheet" href="styles.css"/>
      <script defer data-domain="bok.vefforritun.is" src="https://plausible.io/js/plausible.js"></script>
    </head>
    <body>
      <main>
        <header>
          <h1>${title}</h1>
          <h2>${subtitle}</h2>
        </header>
        <article>

          <h3>${chapters.title}</h3>
          <ol start="0">
            ${chaptersContent}
          </ol>

          <p><a href="all.html">${chapters.consolidatedTitle}</a></p>

          <hr>

          <p>${contact}</p>

        </article>

        <footer>
          <p class="version">${version}</p>
        </footer>

      </main>
    </body>
  </html>
  `;

  return localPrettier(outputContent, reporter);
}

module.exports = {
  generateHistory,
  _prettier: localPrettier,
  chapter,
  allInOne,
  index,
};
