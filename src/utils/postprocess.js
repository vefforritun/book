const jsdom = require('jsdom');

const abbreviations = {
  TCP: 'Transmission Control Protocol',
  SMTP: 'Simple Mail Transfer Protocol',
  FTP: 'File Transfer Protocol',
  URL: 'Uniform Resource Locator',
  HTTP: 'HyperText Transfer Protocol',
  IPv6: 'Internet Protocol, version 6',
  IPv4: 'Internet Protocol, version 4',
  IP: 'Internet Protocol',
  DNS: 'Domain Name System',
  HTML: 'HyperText Markup Language',
  CSS: 'Cascading Style Sheets',
  WYSIWYG: 'What You See Is What You Get',
  CLI: 'Command Line Interface',
  DOM: 'Document Object Model',
  GUI: 'Graphical User Interface',
};

module.exports = function postprocess(html) {
  const dom = new jsdom.JSDOM(html);

  // inline footnotes
  dom.window.document.querySelectorAll('sup.footnote-mark').forEach((i) => {
    const { number } = i.dataset;
    const textElement = dom.window.document.querySelector(
      `sup.footnote-text[data-number="${number}"]`
    );

    if (textElement) {
      const footnote = textElement.parentNode;
      i.insertAdjacentElement('afterend', footnote);
    } else {
      console.warn('unable to find footnote text');
    }
  });

  // mark abbrs
  const seen = [];
  const skippedNodes = ['h1', 'h2', 'h3'];
  const walk = (node) => {
    const { childNodes, nodeType, nodeName, textContent: text } = node;
    if (
      nodeType === node.ELEMENT_NODE &&
      skippedNodes.indexOf(nodeName.toLowerCase()) < 0
    ) {
      for (const child of Array.from(childNodes)) {
        walk(child);
      }
    } else if (nodeType === node.TEXT_NODE) {
      // might have more than one abbr we need to replace in current text node
      const toReplaceForCurrentNode = [];

      // eslint-disable-next-line guard-for-in
      for (const abbr in abbreviations) {
        const regexp = new RegExp(`${abbr}`, 'g');
        if (text.match(regexp) && seen.indexOf(abbr) < 0) {
          toReplaceForCurrentNode.push(abbr);
          seen.push(abbr);
        }
      }

      // replace all
      if (toReplaceForCurrentNode.length > 0) {
        let replaced = text;

        toReplaceForCurrentNode.forEach((i) => {
          const replacement = `<abbr title="${abbreviations[i]}">${i}</abbr>`;
          const regexp = new RegExp(`${i}`, 'g');
          replaced = replaced.replace(regexp, replacement);
        });

        // create a new jsdom document that creates a "graft" for us to replace the text with—with actual HTML
        // because node.innerHTML doesn't work..?
        const graft = new jsdom.JSDOM(`<span>${replaced}</span>`).window
          .document.body.firstChild;

        const parent = node.parentNode;

        if (parent) {
          // replace so we don't mess up the order of siblings
          parent.replaceChild(graft, node);
        }
      }
    }
  };

  walk(dom.window.document.body);

  return dom.window.document.body.innerHTML;
};
