const { renderMarkdown } = require('../lib/markdown');

describe('markdown', () => {
  const noopReporter = {
    warn: jest.fn(),
  };
  it('should render italics inside em dashses', () => {
    const renderedHtml = renderMarkdown('Foo—_italic_—bar.');

    expect(renderedHtml).toBe(
      '<div class="paragraphs"><p>Foo—<em>italic</em>—bar.</p>\n</div>'
    );
  });

  it('should render markdown links in image credit', () => {
    const markdown = `![Alt.](img.png "_Title_. Credit: [text](https://example.org)")`;
    const renderedHtml = renderMarkdown(markdown, { reporter: noopReporter });

    expect(renderedHtml).toMatch('<em>Title</em>');
    expect(renderedHtml).toMatch(`<a href="https://example.org">text</a>`);
  });
});
