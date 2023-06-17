const Renderer = require('../lib/Renderer');

describe('Renderer', () => {
  describe('embeds', () => {
    it('should return true if the url is embeddable', () => {
      const renderer = new Renderer();
      const url = 'https://www.youtube.com/watch?v=1';
      expect(renderer.isEmbeddable(url)).toBe(true);
    });

    it('should return false if the url is not embeddable', () => {
      const renderer = new Renderer();
      const url = 'https://www.example.com';
      expect(renderer.isEmbeddable(url)).toBe(false);
    });

    it('should create HTML for embeds', () => {
      const renderer = new Renderer();
      const url = 'https://www.youtube.com/watch?v=1';
      expect(renderer.embeddableContent(url)).toMatch(
        'src="https://www.youtube.com/embed/1"'
      );
    });
  });

  describe('code', () => {
    // TODO more thorough tests
    it('should create HTML for blockquote', () => {
      const renderer = new Renderer();
      const code = `\`\`\`javascript
const foo = 'bar';
\`\`\``;

      const result = renderer.code(code, 'javascript');

      expect(result).toMatch('const foo = &#x27;bar&#x27;;');
    });
  });

  describe('blockquote', () => {
    // TODO more thorough tests
    it('should create HTML for blockquote', () => {
      const renderer = new Renderer();
      const code = 'amazing quote';

      const result = renderer.blockquote(code);

      expect(result).toMatch('<blockquote>');
      expect(result).toMatch('amazing quote');
    });
  });

  describe('list', () => {
    // TODO more thorough tests
    it('should create HTML for list', () => {
      const renderer = new Renderer();

      const result = renderer.list('body');

      expect(result).toMatch('<ul>\nbody</ul>');
    });

    it('should create HTML for listitem', () => {
      const renderer = new Renderer();

      const result = renderer.listitem('item');

      expect(result).toMatch('<li>item</li>\n');
    });
  });

  describe('checkbox', () => {
    // TODO more thorough tests
    it('should create HTML for checkbox', () => {
      const renderer = new Renderer();

      const result = renderer.checkbox(false);

      expect(result).toMatch('<input');
      expect(result).toMatch('type="checkbox"');
    });
  });

  describe('paragraph', () => {
    // TODO more thorough tests
    it('should create HTML for paragraph', () => {
      const renderer = new Renderer();

      const result = renderer.paragraph('foo');

      expect(result).toMatch('<div class="paragraphs">');
      expect(result).toMatch('<p>foo</p>');
    });
  });

  describe('heading', () => {
    // TODO more thorough tests
    it('should create HTML for paragraph', () => {
      const renderer = new Renderer();

      const result = renderer.heading('foo');

      expect(result).toMatch('<h1>');
      expect(result).toMatch('<span id="1">');
      expect(result).toMatch('foo');
    });
  });

  describe('image', () => {
    // TODO more thorough tests
    it('should create HTML for image', () => {
      const mockReporter = {
        warn: jest.fn(),
      };
      const renderer = new Renderer({ reporter: mockReporter });

      const result = renderer.image('image', 'title', 'alt');

      expect(result).toMatch('<figure>');
      expect(result).toMatch('<img alt="alt" src="image">');
      expect(result).toMatch('<figcaption>');
      expect(result).toMatch('<p>title</p>');
    });
  });

  describe('text', () => {
    // TODO more thorough tests
    it('should render strong', () => {
      const renderer = new Renderer();
      expect(renderer.strong('foo')).toMatch('<strong>foo</strong>');
    });

    it('should render em', () => {
      const renderer = new Renderer();
      expect(renderer.em('foo')).toMatch('<em>foo</em>');
    });

    it('should render codespan', () => {
      const renderer = new Renderer();
      expect(renderer.codespan('foo')).toMatch('<code>foo</code>');
    });

    it('should render br', () => {
      const renderer = new Renderer();
      expect(renderer.br('foo')).toMatch('<br>');
    });

    it('should render del', () => {
      const renderer = new Renderer();
      expect(renderer.del('foo')).toMatch('<del>foo</del>');
    });

    it('should render text', () => {
      const renderer = new Renderer();
      expect(renderer.text('foo')).toMatch('foo');
      expect(renderer.text('foo bar')).toMatch('foo&nbsp;bar');
    });

    it('should render link', () => {
      const renderer = new Renderer();
      expect(renderer.link(null, 'title', 'text')).toMatch('text');
      expect(renderer.link('https://example.org', 'title', 'text')).toMatch(
        '<a href="https://example.org" title="title">text</a>'
      );
    });
  });
});
