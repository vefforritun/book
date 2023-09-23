/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */

// refactor this whole file, a lot is copied from marked source and not
// everything is needed

function autolink(s) {
  const pattern =
    /(^|[\s\n]|<[A-Za-z]*\/?>)((?:https?|ftp):\/\/[-A-Z0-9+\u0026\u2019@#/%?=()~_|!:,.;]*[-A-Z0-9+\u0026@#/%=~()_|])/gi;

  return (s || '').replace(pattern, "$1<a href='$2'>$2</a>");
}

/**
 * Remove trailing 'c's. Equivalent to str.replace(/c*$/, '').
 * /c*$/ is vulnerable to REDOS.
 *
 * @param {string} str
 * @param {string} c
 * @param {boolean} invert Remove suffix of non-c chars instead. Default falsey.
 */
function rtrim(str, c, invert) {
  const l = str.length;
  if (l === 0) {
    return '';
  }

  // Length of suffix matching the invert condition.
  let suffLen = 0;

  // Step left until we fail to match the invert condition.
  while (suffLen < l) {
    const currChar = str.charAt(l - suffLen - 1);
    if (currChar === c && !invert) {
      suffLen++;
    } else if (currChar !== c && invert) {
      suffLen++;
    } else {
      break;
    }
  }

  return str.slice(0, l - suffLen);
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

const baseUrls = {};
const justDomain = /^[^:]+:\/*[^/]*$/;
const protocol = /^([^:]+:)[\s\S]*$/;
const domain = /^([^:]+:\/*[^/]*)[\s\S]*$/;

/**
 * @param {string} base
 * @param {string} href
 */
function resolveUrl(base, href) {
  if (!baseUrls[` ${base}`]) {
    // we can ignore everything in base after the last slash of its path component,
    // but we might need to add _that_
    // https://tools.ietf.org/html/rfc3986#section-3
    if (justDomain.test(base)) {
      baseUrls[` ${base}`] = `${base}/`;
    } else {
      baseUrls[` ${base}`] = rtrim(base, '/', true);
    }
  }
  base = baseUrls[` ${base}`];
  const relativeBase = base.indexOf(':') === -1;

  if (href.substring(0, 2) === '//') {
    if (relativeBase) {
      return href;
    }
    return base.replace(protocol, '$1') + href;
  }
  if (href.charAt(0) === '/') {
    if (relativeBase) {
      return href;
    }
    return base.replace(domain, '$1') + href;
  }
  return base + href;
}

const nonWordAndColonTest = /[^\w:]/g;
const originIndependentUrl = /^$|^[a-z][a-z0-9+.-]*:|^[?#]/i;

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
      // eslint-disable-next-line no-script-url
      prot.indexOf('javascript:') === 0 ||
      prot.indexOf('vbscript:') === 0 ||
      prot.indexOf('data:') === 0
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
  const CUSTOM_ID_REGEX = /(&nbsp;)?\{#(.*)\}$/;
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
  escape,
  parseCustomIdText,
  cleanUrl,
  isBlockToken,
};
