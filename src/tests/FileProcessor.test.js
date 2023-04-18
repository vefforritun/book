const FileProcessor = require('../lib/FileProcessor');

describe('FileProcessor', () => {
  describe('makeNextPrevContent', () => {
    test('makeNextPrevContent', () => {
      const fp = new FileProcessor();
      expect(fp.makeNextPrevContent('')).toBe('');
    });

    test('makeNextPrevContent', () => {
      const fp = new FileProcessor();

      const nextPrevContent = '[text](./link.html)';
      const result = fp.makeNextPrevContent(nextPrevContent);

      expect(result).toBe('<p><a href="./link.html">text</a></p>\n');
    });
  });

  describe('process', () => {
    const mockReporter = {
      verbose: jest.fn(),
    };
    const mockFileReader = {
      getBaseDir: jest.fn(),
      readFile: jest.fn(),
    };
    let fp;

    beforeAll(() => {
      mockReporter.verbose.mockClear();
      mockFileReader.getBaseDir.mockClear();
      mockFileReader.readFile.mockClear();

      fp = new FileProcessor({
        reporter: mockReporter,
        fileReader: mockFileReader,
      });
    });

    test('process empty input', async () => {
      mockFileReader.getBaseDir.mockReturnValueOnce('');
      mockFileReader.readFile.mockReturnValueOnce('');

      const result = await fp.process('');

      expect(mockReporter.verbose).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        chapter: 0,
        content: '',
        estimatedReadingTime: 0,
        file: '',
        history: [],
        next: '',
        nextContent: '',
        previous: '',
        previousContent: '',
        title: '',
        version: '',
      });
    });

    test('process input with frontmatter', async () => {
      mockFileReader.getBaseDir.mockReturnValueOnce('');
      mockFileReader.readFile.mockReturnValueOnce(`---
title: title
chapter: 1
version: version
history:
  - h1
  - h2
next: next
previous: previous
---

content
`);

      const result = await fp.process('file.md');

      expect(result).toEqual({
        chapter: 1,
        content: '<div class="paragraphs"><p>content</p>\n</div>',
        estimatedReadingTime: 1,
        file: 'file.md',
        history: ['<p>h1</p>\n', '<p>h2</p>\n'],
        next: 'next',
        nextContent: '<p>next</p>\n',
        previous: 'previous',
        previousContent: '<p>previous</p>\n',
        title: 'title',
        version: 'version',
      });
    });

    test('process input with frontmatter and non-number chapter', async () => {
      mockFileReader.getBaseDir.mockReturnValueOnce('');
      mockFileReader.readFile.mockReturnValueOnce(`---
title: title
chapter: asdf
version: version
history:
  - h1
  - h2
next: next
previous: previous
---

content
`);

      const result = await fp.process('file.md');

      expect(result).toEqual({
        chapter: 1,
        content: '<div class="paragraphs"><p>content</p>\n</div>',
        estimatedReadingTime: 1,
        file: 'file.md',
        history: ['<p>h1</p>\n', '<p>h2</p>\n'],
        next: 'next',
        nextContent: '<p>next</p>\n',
        previous: 'previous',
        previousContent: '<p>previous</p>\n',
        title: 'title',
        version: 'version',
      });
    });
  });
});
