const prettier = require("prettier");

function readingTimeReadable(time) {
  return `um ${time} mín lestími`;
}

function chapter(data, reporter) {
  const {
    title,
    chapter,
    version,
    next,
    previous,
    nextContent,
    previousContent,
    estimatedReadingTime,
    content,
  } = data;

  const readingTime = estimatedReadingTime > 0 ?
      `<p class="reading-time">${readingTimeReadable(estimatedReadingTime)}</p>` : '';

    const nav = previousContent || nextContent ?
      `<nav>
        <ul>
          <li class="prev">${previousContent}</li>
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
          <h1>Kafli ${chapter}: ${title}</h1>
          ${readingTime}
        </header>

        <article>
          ${content}
        </article>

        <footer>
          ${nav}
          <hr>
          ${version ? `<p class="version">${version}</p>` : ''}
        </footer>
      </main>
    </body>
  </html>`;

  return _prettier(outputContent, reporter);
}

function _prettier(content, reporter) {
  let prettyContent = content;

  const prettierOptions = {
    'parser': 'html',
    'htmlWhitespaceSensitivity': 'css',
    'printWidth': 80,
    'quoteProps': 'as-needed',
    'singleQuote': false,
    'useTabs': false,
  };

  try {
    reporter.info(`Prettifing content`);
    prettyContent = prettier.format(prettyContent, prettierOptions);
    reporter.info(`Done prettifing content`);
  } catch (e) {
    reporter.error(`Unable to run prettier`, e.message);
  }

  return prettyContent;
}

function allInOne({ title, subtitle, version, contact, chapters }, processed, reporter) {

  const procssedContent = [];

  const totalEstimatedReadingTime = processed.reduce((total, item) => item.estimatedReadingTime + total, 0);

  processed.forEach((item) => {
    const {
      title,
      chapter,
      version,
      next,
      previous,
      nextContent,
      previousContent,
      estimatedReadingTime,
      content,
    } = item;

    const contentWithFixedHeadings = content.replace(/<h2/g, '<h3').replace(/<\/h2>/g, '</h3>');
    const readingTime = estimatedReadingTime > 0 ?
      `<p class="reading-time">${readingTimeReadable(estimatedReadingTime)}</p>` : '';

    procssedContent.push(`
      <article>
        <h2>Kafli ${chapter}: ${title}</h2>
        ${readingTime}

        <div class="content">${contentWithFixedHeadings}</div>
      </article>
    `);
  });

  const totalReadingTime = totalEstimatedReadingTime > 0 ?
      `<p class="reading-time">${readingTimeReadable(totalEstimatedReadingTime)}</p>` : '';

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
          ${totalReadingTime}
        </header>

        ${procssedContent.join('')}

        <footer>
          <hr>
          ${version}
        </footer>
      </main>
    </body>
  </html>`;

  return _prettier(outputContent, reporter);
}

function index({ title, subtitle, version, contact, chapters, consolidatedTitle }, processed, reporter) {
  const chaptersContent = processed.map((item) => {
    const url = item.outputFilebasename;
    const title = item.title;
    const readingTime = readingTimeReadable(item.estimatedReadingTime);

    return `<li><a href="${url}">${title}</a>, <span class="reading-time">${readingTime}</span></li>`;
  }).join('');

  const totalEstimatedReadingTime = processed.reduce((total, item) => item.estimatedReadingTime + total, 0);
  const totalReadingTime = totalEstimatedReadingTime > 0 ? readingTimeReadable(totalEstimatedReadingTime) : '';

  const outputContent = `
  <!DOCTYPE html>
  <html lang="is">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Vefforitun</title>
      <link href="https://fonts.googleapis.com/css2?family=Fira+Mono:wght@400;500&display=swap" rel="stylesheet">
      <link rel="stylesheet" href="reset.css"/>
      <link rel="stylesheet" href="styles.css"/>
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

          <p><a href="all.html">${chapters.consolidatedTitle}</a>, <span class="reading-time">${totalReadingTime}</span></p>

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

  return _prettier(outputContent, reporter);
}

module.exports = {
  chapter,
  allInOne,
  index,
};
