const { marked } = require('marked');

function markedSingleLine(content) {
  if (!content) {
    return '';
  }

  const replaced = content.replace(/\\\[/g, '[');

  const output = marked(replaced).replace('<div class="paragraphs">', '');

  return output;
}

function autolink(s) {
  const pattern = /(^|[\s\n]|<[A-Za-z]*\/?>)((?:https?|ftp):\/\/[\-A-Z0-9+\u0026\u2019@#\/%?=()~_|!:,.;]*[\-A-Z0-9+\u0026@#\/%=~()_|])/gi;

  return (s || '').replace(pattern, "$1<a href='$2'>$2</a>");
}

function singleLineMarkdown(str, { skipPs = false } = {}) {
  marked.use({
    renderer: {
      paragraph(text) {
        return text;
      },
    },
  });
  return marked(str).replace('<div class="paragraphs">', '');
}

/**
 * `escape` and `cleanUrls` are copied from marked source since importing broke updating from v2 to v4
 * Per this comment
 * https://github.com/markedjs/marked/issues/2468#issuecomment-1122458308
 */

// copied from marked: https://github.com/markedjs/marked/blob/master/src/helpers.js
const escapeTest = /[&<>"']/;
const escapeReplace = /[&<>"']/g;
const escapeTestNoEncode = /[<>"']|&(?!#?\w+;)/;
const escapeReplaceNoEncode = /[<>"']|&(?!#?\w+;)/g;
const escapeReplacements = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};
const getEscapeReplacement = (ch) => escapeReplacements[ch];

function escape(html, encode) {
  if (encode) {
    if (escapeTest.test(html)) {
      return html.replace(escapeReplace, getEscapeReplacement);
    }
  } else if (escapeTestNoEncode.test(html)) {
    return html.replace(escapeReplaceNoEncode, getEscapeReplacement);
  }

  return html;
}

/**
 * Copied from marked: https://github.com/markedjs/marked/blob/master/src/helpers.js
 * @param {boolean} sanitize
 * @param {string} base
 * @param {string | null} href
 */
function cleanUrl(sanitize, base, href) {
  if (href == null) return null;
  if (sanitize) {
    let prot;
    try {
      prot = decodeURIComponent(unescape(href))
        .replace(nonWordAndColonTest, '')
        .toLowerCase();
    } catch (e) {
      return null;
    }
    if (
      prot.indexOf('javascript:') === 0
      || prot.indexOf('vbscript:') === 0
      || prot.indexOf('data:') === 0
    ) {
      return null;
    }
  }
  if (base && !originIndependentUrl.test(href)) {
    href = resolveUrl(base, href);
  }
  try {
    href = encodeURI(href).replace(/%25/g, '%');
  } catch (e) {
    return null;
  }
  return href;
}

function parseCustomIdText(text) {
  // TODO nbsp from other custom handling
  const CUSTOM_ID_REGEX = /(\&nbsp\;)?\{\#(.*)\}$/;
  const match = (text || '').match(CUSTOM_ID_REGEX);

  if (match && match.length === 2) {
    return match[1];
  }

  if (match && match.length === 3) {
    return match[2];
  }

  return undefined;
}

const blockLevelTokens = [
  'heading',
  'html',
  'table',
  'code',
  'hr',
  'list',
  'blockquote',
  'paragraph',
  'table',
  'tablerow',
  'tablecell',
];

function isBlockToken(token) {
  return blockLevelTokens.indexOf(token) >= 0;
}

module.exports = {
  autolink,
  markedSingleLine,
  singleLineMarkdown,
  escape,
  parseCustomIdText,
  cleanUrl,
  isBlockToken,
};
