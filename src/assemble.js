const prettier = require("prettier");

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
      `<div class="reading-time">Um ${estimatedReadingTime} mín lestur</div>` : '';

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
          <h1>${title}</h1>
          ${readingTime}
        </header>

        <article>
          ${content}
        </article>

        <footer>
          ${nav}
          <hr>
          ${version ? `<div class="version">${version}</div>` : ''}
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
    prettyContent = prettier.format(prettyContent, prettierOptions);
    reporter.verbose(`Ran prettier`);
  } catch (e) {
    reporter.error(`Unable to run prettier`, e.message);
  }

  return prettyContent;
}

function allInOne({ title, subtitle, version, contact, chapters }, processed, reporter) {

  const procssedContent = [];

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

    procssedContent.push(`
      <article>
        <h2>${title}</h2>
        <div class="content">${content}</div>
      </article>
    `);
  });

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

function index({ title, subtitle, version, contact, chapters }, processed, reporter) {
  const chaptersContent = `<li><a href="00.inngangur.html">Inngangur</a></li>`;

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

          <p>${contact}</p>

        </article>

        <footer>
          <hr>
          <div class="version">${version}</div>
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
