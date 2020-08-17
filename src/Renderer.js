const path = require('path');

const { cleanUrl, escape } = require('marked/src/helpers');
const hljs = require('highlight.js');
const sizeOfImage = require('image-size');

hljs.configure({
  tabReplace: '\t',

})

function autolink(s) {
  const pattern = /(^|[\s\n]|<[A-Za-z]*\/?>)((?:https?|ftp):\/\/[\-A-Z0-9+\u0026\u2019@#\/%?=()~_|!:,.;]*[\-A-Z0-9+\u0026@#\/%=~()_|])/gi;

  return (s || '').replace(pattern, "$1<a href='$2'>$2</a>");
}

const blockLevelTokens = ['heading', 'html', 'table', 'code', 'hr', 'list', 'blockquote', 'paragraph', 'table', 'tablerow', 'tablecell'];

const abbreviations = {
  'TCP': 'Transmission Control Protocol',
  'SMTP': '',
  'FTP': '',
  'URL': 'Uniform Resource Locator',
  'HTTP': 'HyperText Transfer Protocol',
  'IP': 'Internet Protocol',
  'DNS': 'Domain Name System',
  'HTML': 'HyperText Markup Language',
  'CSS': 'Cascading Style Sheets',
  'WYSIWYG': 'What You See Is What You Get',
};

function isBlockToken(token) {
  return blockLevelTokens.indexOf(token) >= 0;
}

module.exports = class Renderer {
  constructor({ options, chapter = 1, basedir = '', reporter = {} } = {}) {
    this.options = options || {};
    this.h1 = chapter;
    this.basedir = basedir;
    this.reporter = reporter;
  }

  h2 = 0;
  h3 = 0;

  lastToken = '';
  lastBlockToken = '';
  openParagraphsDiv = false;

  beforeRender(token, level = undefined) {
    if (token === 'heading') {
      if (level === 2 && this.h2 === 0) {
        this.h2 = 1;
        this.h3 = 0;
      } else if (level === 2 && this.h2 > 0) {
        this.h2 = this.h2 + 1;
        this.h3 = 0;
      }

      if (level === 3 && this.h3 === 0) {
        this.h3 = 1;
      } else if (level === 3 && this.h3 > 0) {
        this.h3 = this.h3 + 1;
      }
    }

    const lastBlockToken = this.lastBlockToken;
    this.lastToken = token;

    if (isBlockToken(token)) {
      this.lastBlockToken = token;
    }

    if (token === 'paragraph' && lastBlockToken !== 'paragraph') {
      this.openParagraphsDiv = true;

      return '<div class="paragraphs">';
    }

    if (lastBlockToken === 'paragraph' && token !== 'paragraph' && isBlockToken(token) && this.openParagraphsDiv) {
      this.openParagraphsDiv = false;

      return '</div>';
    }

    return '';
  }

  postRender(content) {
    if (this.lastBlockToken === 'paragraph') {
      return `${content}</div>`;
    }
    return content;
  }

  code(code, infostring, escaped) {
    const prefix = this.beforeRender('code');
    const lang = (infostring || '').match(/\S*/)[0];

    if (!lang) return `${prefix}code`;

    let lineNumber = 0
    const highlightedContent = hljs.highlightAuto(code, [lang]).value

    const commentPattern = /<span class="hljs-comment">(.|\n)*?<\/span>/g;
    const cssPattern = /<span class="css">(.|\n)*?<\/span>/g;

    const adaptedHighlightedContent = highlightedContent
      .replace(commentPattern, (data) => {
        return data.replace(/\r?\n/g, () => {
          return '</span>\n<span class="hljs-comment">'
        })
      })
      // TODO fix for multi-line embedded CSS (and other stuff...)
      // needs to parse the tree correctly, can't do this with regex
      .replace(cssPattern, (data, i) => {

        return data.replace(/\r?\n/g, () => {
          return '</span>\n<span class="css">';
        }) + '</span>';
      });

    const contentTable = adaptedHighlightedContent.split(/\r?\n/).map((lineContent) => {
      if (lineContent.trim().startsWith('</span>')) {
        // TODO fix for above as well, get all stray </span>s
        lineContent = lineContent.replace('</span>', '');
      }

      // <pre> on line to make sure prettier preserves whitespace
      return `
      <tr>
        <td class="line-number" data-pseudo-content="${++lineNumber}"></td>
        <td><pre>${lineContent}</pre></td>
      </tr>`
    }).join('')

    const table = `
    <table class="code-table">
      ${contentTable}
    </table>`;

    return prefix + `
  <div class="code code-${lang}">
    ${table}
  </div>`;
  }

  blockquote(quote) {
    if (quote.startsWith('<div class="paragraphs">')) {

      this.openParagraphsDiv = false
      quote = quote.substring('<div class="paragraphs">'.length);
    }

    const prefix = this.beforeRender('blockquote');

    let indexOfCitation = quote.lastIndexOf('\n—');

    let cite = '';

    if (indexOfCitation > 0) {
      let citeText = quote.substring(indexOfCitation, quote.length);

      if (citeText.indexOf('</p>') > 0) {
        citeText = citeText.substring(0, citeText.indexOf('</p>'));
      }

      cite = `<footer>${citeText}</footer>`;
      quote = quote.substring(0, indexOfCitation).trim();
    }

    // remove quotemarks
    // TODO brittle, assumes <p> at start/end
    if (quote.startsWith('<p>') || quote.startsWith('<p>')) {
      quote = quote.substring(3).trim();
    }

    if (quote.startsWith('"') || quote.startsWith('“') || quote.startsWith('„')) {
      quote = quote.substring(1).trim();
    }

    if (quote.endsWith('<p>') || quote.endsWith('</p>')) {
      quote = quote.substring(0, quote.length - 4).trim();
    }

    if (quote.endsWith('"') || quote.endsWith('”') || quote.endsWith('“')) {
      quote = quote.substring(0, quote.length - 1).trim();
    }

    return `
      ${prefix}<blockquote>\n<p>${quote}</p>${autolink(cite)}</blockquote>\n`;
  }

  html(html) {
    const prefix = this.beforeRender('html');
    return `${prefix}${html}`;
  }

  hr() {
    const prefix = this.beforeRender('hr');
    return `${prefix}<hr>`;
  }

  list(body, ordered, start) {
    const prefix = this.beforeRender('list');

    const type = ordered ? 'ol' : 'ul',
      startatt = (ordered && start !== 1) ? (' start="' + start + '"') : '';
    return prefix + '<' + type + startatt + '>\n' + body + '</' + type + '>\n';
  }

  listitem(text) {
    const prefix = this.beforeRender('listitem');
    return prefix + '<li>' + text + '</li>\n';
  }

  checkbox(checked) {
    const prefix = this.beforeRender('checkbox');
    return prefix + '<input '
      + (checked ? 'checked="" ' : '')
      + 'disabled="" type="checkbox"'
      + (this.options.xhtml ? ' /' : '')
      + '> ';
  }

  paragraph(text) {
    const prefix = this.beforeRender('paragraph');

    if (text.trim().startsWith('<') &&
      !text.trim().startsWith('<em') &&
      !text.trim().startsWith('<del') &&
      !text.trim().startsWith('<a ') &&
      !text.trim().startsWith('<strong')
    ) {
      return prefix + text;
    }

    return prefix + '<p>' + text + '</p>\n';
  }

  heading(text, level) {
    const prefix = this.beforeRender('heading', level);

    const currentLevel =
      level === 1 ? this.h1.toString() :
        level === 2 ? `${this.h1}.${this.h2}` :
          `${this.h1}.${this.h2}.${this.h3}`;

    return `
      ${prefix}
      <h${level} id="${currentLevel}" >
        <span>
          <a href="#${currentLevel}">
            ${currentLevel}
          </a>
        </span>
        ${text}
      </h${level}>`;
  }

  image(href, title = '', text) {
    const prefix = this.beforeRender('image');
    const imagedir = path.join(this.basedir, href);

    let size = null;
    let imgSize = '';
    let imgRatio = '';

    try {
      size = sizeOfImage(imagedir);
    } catch (e) {
      this.reporter.warn(`Unable to read size of "${href}"`)
    }

    if (size && size.height && size.width) {
      imgSize = ` width="${size.width}" height="${size.height}" loading="lazy"`;
      const ratio = (size.height / size.width * 100).toFixed(6);
      imgRatio = `<div class="ratio" style="padding-top: ${ratio}%;"></div>`
    }

    let credit = '';

    const creditIndex = (title || '').toLowerCase().indexOf('credit:');
    if (creditIndex > 0) {
      credit = '<footer>' +
        autolink(title.substring(creditIndex + 'credit:'.length, title.length).trim()) +
        '</footer>';
      title = title.substring(0, creditIndex).trim();
    }

    let caption = '';
    if (title) {
      caption = `
      <figcaption>
        <p>${autolink(title)}</p>${credit}
      </figcaption>`;
    }

    const imageExtraClass = [
      !title ? ' no-caption' : null,
      size && size.width <= 400 ? ' small' : null,
    ].filter(Boolean);

    return `
      ${prefix}
      <figure>
        <div class="image${imageExtraClass.join()}">
          <div class="img"><img alt="${text || ''}" src="${href}"${imgSize}></div>
          ${imgRatio}
        </div>
        ${caption}
      </figure>
    `;
  }

  strong(text) {
    const prefix = this.beforeRender('strong');
    return prefix + '<strong>' + text + '</strong>';
  }

  em(text) {
    const prefix = this.beforeRender('em');
    return prefix +  '<em>' + text + '</em>';
  }

  codespan(text) {
    const prefix = this.beforeRender('codespan');
    return prefix + '<code>' + text + '</code>';
  }

  br() {
    const prefix = this.beforeRender('br');
    return `${prefix} <br>`;
  }

  del(text) {
    const prefix = this.beforeRender('del');
    return prefix + '<del>' + text + '</del>';
  }

  text(text) {
    const prefix = this.beforeRender('text');

    // no typographic orphans
    const lastSpace = text.lastIndexOf(' ');

    if (lastSpace > 0) {
      text = `${text.substring(0, lastSpace)}&nbsp;${text.substring(lastSpace + 1, text.length)}`;
    }
/*
    for (const abbr in abbreviations) {
      const replacement = `<abbr title="${abbreviations[abbr]}">${abbr}</abbr>`;
      text = text.replace(new RegExp(`${abbr}`, 'g'), replacement);
    }*/

    return prefix + text;
  }

  link(href, title, text) {
    const prefix = this.beforeRender('link');
    href = cleanUrl(this.options.sanitize, this.options.baseUrl, href);
    if (href === null) {
      return prefix + text;
    }
    let out = '<a href="' + escape(href) + '"';
    if (title) {
      out += ' title="' + title + '"';
    }
    out += '>' + text + '</a>';
    return prefix + out;
  }

};
