const { marked } = require("marked");

function markedSingleLine(content) {
  if (!content) {
    return "";
  }

  const replaced = content.replace(/\\\[/g, "[");

  const output = marked(replaced).replace('<div class="paragraphs">', "");

  return output;
}

module.exports = {
  markedSingleLine,
};
