const { renderMarkdown } = require('../lib/markdown');

describe('markdown', () => {
  it('should render italics inside em dashses', () => {
    const renderedHtml = renderMarkdown('Foo—_italic_—bar.');

    expect(renderedHtml).toMatch(
      '<div class="paragraphs"><p>Foo—<em>italic</em>—bar.</p>\n</div>'
    );
  });
});
