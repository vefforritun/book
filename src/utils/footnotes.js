/*
Footnotes based on
https://github.com/markedjs/marked/issues/1562#issuecomment-643171344
*/
const footnoteMatch = /^\[\^([^\]]+)\]:([\s\S]*)$/;
const referenceMatch = /\[\^([^\]]+)\](?![\(:])/g;
const referencePrefix = 'footnote-reference';
const footnotePrefix = 'footnote';

const footnoteTemplate = (ref, text) => `<sup class="footnote-text" data-number="${ref}" id="${footnotePrefix}:${ref}"><a href="#${referencePrefix}:${ref}">${ref}</a></sup>${text}`;
const referenceTemplate = (ref) => `<sup class="footnote-mark" data-number="${ref}" id="${referencePrefix}:${ref}"><a href="#${footnotePrefix}:${ref}">${ref}</a></sup>`;

const interpolateReferences = (text) => text.replace(referenceMatch, (_, ref) => referenceTemplate(ref));
const interpolateFootnotes = (text) => text.replace(footnoteMatch, (_, value, text) => footnoteTemplate(value, text));

module.exports = {
  interpolateFootnotes,
  interpolateReferences,
};
