const { marked } = require('marked');
const postprocess = require('../utils/postprocess');
const Renderer = require('./Renderer');

function renderMarkdown(content, options = {}) {
  const renderer = new Renderer(options);

  marked.setOptions({
    renderer,
  });

  const contentToRender = content
    .toString(options.encoding)
    // Add spaces around em dashes and italics so "Hi—_foo_—there" is italicized
    .replace(/–_/g, '– _')
    .replace(/_—/g, '_ —');

  const renderedHtml = renderer.postRender(marked(contentToRender));

  const post = postprocess(renderedHtml);

  const fixedRendered = post
    .replace(/— <em>/g, '—<em>')
    .replace(/<\/em> —/g, '</em>—');

  return fixedRendered;
}

function markedSingleLine(content) {
  if (!content) {
    return '';
  }

  const replaced = content.replace(/\\\[/g, '[');

  const output = marked(replaced).replace('<div class="paragraphs">', '');

  return output;
}

function singleLineMarkdown(str) {
  marked.use({
    renderer: {
      paragraph(text) {
        return text;
      },
    },
  });
  return marked(str).replace('<div class="paragraphs">', '');
}

module.exports = { renderMarkdown, markedSingleLine, singleLineMarkdown };
