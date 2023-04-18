const {
  chapter,
  allInOne,
  index,
  generateHistory,
  _prettier,
} = require("../lib/assemble");

describe("assemble", () => {
  describe("chapter", () => {
    it("should return a chapter object", () => {
      const mockReporter = {
        info: jest.fn(),
        group: jest.fn(),
        groupEnd: jest.fn(),
      };
      const data = {
        title: "foo",
        chapter: 1,
      };
      const result = chapter(data, mockReporter);

      expect(result).toMatch("<title>foo—Vefforritun</title>");
    });
  });

  describe("allInOne", () => {
    it("should generate an empty template for no data", () => {
      const mockReporter = {
        info: jest.fn(),
        group: jest.fn(),
        groupEnd: jest.fn(),
      };
      const data = {
        title: "foo",
      };
      const processed = [];

      const result = allInOne(data, processed, mockReporter);

      expect(result).toMatch("<title>foo—Vefforritun</title>");
      expect(result).not.toMatch("undefined");
    });

    it("should generate a filled template for some data", () => {
      const mockReporter = {
        info: jest.fn(),
        group: jest.fn(),
        groupEnd: jest.fn(),
      };
      const data = {
        title: "foo",
      };
      const processed = [
        {
          title: "bar",
          chapter: 1,
          content: "baz",
        },
      ];

      const result = allInOne(data, processed, mockReporter);

      expect(result).toMatch("<title>foo—Vefforritun</title>");
      expect(result).toMatch("<h2>Kafli 1: bar</h2>");
      expect(result).not.toMatch("undefined");
    });
  });

  describe("index", () => {
    it('should generate an empty template for no data"', () => {
      const mockReporter = {
        info: jest.fn(),
        group: jest.fn(),
        groupEnd: jest.fn(),
      };
      const data = {
        title: "foo",
        subtitle: "baz",
        contact: "contact",
        version: "version",
        chapters: {
          title: "bar",
          consolidatedTitle: "foobar",
        },
      };
      const processed = [
        {
          outputFilebasename: "url",
          title: "bar",
          chapter: 1,
          content: "baz",
          estimatedReadingTime: 0,
        },
      ];

      const result = index(data, processed, mockReporter);

      expect(result).toMatch("<title>Vefforritun</title>");
      expect(result).not.toMatch("undefined");
    });

    it('should generate a filled template for some data"', () => {
      const mockReporter = {
        info: jest.fn(),
        group: jest.fn(),
        groupEnd: jest.fn(),
      };
      const data = {
        title: "foo",
        subtitle: "baz",
        contact: "contact",
        version: "version",
        chapters: {
          title: "bar",
          consolidatedTitle: "foobar",
        },
      };
      const processed = [];

      const result = index(data, processed, mockReporter);

      expect(result).toMatch("<title>Vefforritun</title>");
      expect(result).not.toMatch("undefined");
    });
  });

  describe("generateHistory", () => {
    it("should return an empty string if history empty", () => {
      const result = generateHistory([]);

      expect(result).toMatch("");
      expect(result).not.toMatch("undefined");
    });

    it("should return an empty string if history not an array", () => {
      const result = generateHistory(null);

      expect(result).toMatch("");
      expect(result).not.toMatch("undefined");
    });

    it("should return a history string if history has data", () => {
      const result = generateHistory(["foo", "bar"]);

      expect(result).toMatch('<details class="history">');
      expect(result).toMatch("<summary>Fyrri útgáfur</summary>");
      expect(result).not.toMatch("undefined");
    });
  });

  describe("_prettier", () => {
    it("should run prettier", () => {
      const mockReporter = {
        info: jest.fn(),
        error: jest.fn(),
      };
      const result = _prettier(
        `<div>    <strong>hi</strong>
        </div>`,
        mockReporter
      );

      expect(result).toBe("<div><strong>hi</strong></div>\n");
    });

    it("should return original string if prettier fails", () => {
      const mockReporter = {
        info: jest.fn(),
        error: jest.fn(),
      };
      const result = _prettier(`<div>hi</strong>`, mockReporter);

      expect(result).toBe("<div>hi</strong>");
    });
  });
});
