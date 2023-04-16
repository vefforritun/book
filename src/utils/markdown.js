const { marked } = require("marked");

function markedSingleLine(content) {
  if (!content) {
    return "";
  }

  const replaced = content.replace(/\\\[/g, "[");

  const output = marked(replaced).replace('<div class="paragraphs">', "");

  return output;
}

function autolink(s) {
  const pattern =
    /(^|[\s\n]|<[A-Za-z]*\/?>)((?:https?|ftp):\/\/[\-A-Z0-9+\u0026\u2019@#\/%?=()~_|!:,.;]*[\-A-Z0-9+\u0026@#\/%=~()_|])/gi;

  return (s || "").replace(pattern, "$1<a href='$2'>$2</a>");
}

function singleLineMarkdown(str, { skipPs = false } = {}) {
  marked.use({
    renderer: {
      paragraph(text) {
        return text;
      },
    },
  });
  return marked(str).replace('<div class="paragraphs">', "");
}

module.exports = {
  autolink,
  markedSingleLine,
  singleLineMarkdown,
};
