const Cacher = require("../lib/Cacher");
const fs = require("fs");
const fsPromises = require("fs/promises");

jest.mock("fs");
jest.mock("fs/promises");

describe("Cacher", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe("cacheKey", () => {
    it("should return empty if empty", () => {
      const cacher = new Cacher();
      expect(cacher.cacheKey()).toBe("");
    });

    it("should return cachekey for string", () => {
      const cacher = new Cacher();
      expect(cacher.cacheKey("foo\\bar")).toBe("foo-bar");
    });
  });

  describe("getDataHash", () => {
    it("should return known hash for known string", () => {
      const cacher = new Cacher();
      expect(cacher.getDataHash("foo")).toBe(
        "d465e627f9946f2fa0d2dc0fc04e5385bc6cd46d"
      );
    });
  });

  describe("getFileHash", () => {
    // TODO this is iffy
    it("should return empty if empty", async () => {
      const mReadStream = {
        read: jest.fn().mockReturnValueOnce(null),
        on: jest.fn().mockImplementation(function (event, handler) {
          handler();
          return this;
        }),
      };
      fs.createReadStream.mockReturnValueOnce(mReadStream);

      const cacher = new Cacher();
      expect(cacher.getFileHash("")).resolves.toBe(
        "da39a3ee5e6b4b0d3255bfef95601890afd80709"
      );
    });
  });

  describe("cacheFile", () => {
    it('should return "index.json" if no cacheDir', () => {
      const cacher = new Cacher();
      expect(cacher.cacheFile()).toBe("index.json");
    });

    it("should return cache file locaation", () => {
      const cacher = new Cacher({ cacheDir: "foo" });
      expect(cacher.cacheFile()).toBe("foo/index.json");
    });
  });

  describe("primeCache", () => {
    it("should throw if cache file is not writeable", async () => {
      const cacher = new Cacher();
      fsPromises.access
        .mockReturnValueOnce(Promise.resolve())
        .mockReturnValueOnce(Promise.reject());

      await expect(cacher.primeCache()).rejects.toThrow(
        "expected cache file to be writeable"
      );
    });

    it("should use cache file if valid json", async () => {
      const mockReporter = {
        error: jest.fn(),
        verbose: jest.fn(),
      };
      fsPromises.access.mockReturnValueOnce(Promise.resolve());
      fsPromises.readFile.mockReturnValueOnce(
        Promise.resolve('{"cache": true}')
      );

      const cacher = new Cacher({ reporter: mockReporter });

      expect(await cacher.primeCache()).toEqual({ cache: true });
      expect(mockReporter.error).toHaveBeenCalledTimes(0);
      expect(mockReporter.verbose).toHaveBeenCalledTimes(1);
    });

    it("should recreate cache file if invalid json", async () => {
      const mockReporter = {
        error: jest.fn(),
        verbose: jest.fn(),
      };
      fsPromises.access.mockReturnValueOnce(Promise.resolve());
      fsPromises.readFile.mockReturnValueOnce(Promise.resolve("invalid json"));

      const cacher = new Cacher({ reporter: mockReporter });

      expect(await cacher.primeCache()).toEqual({});
      expect(mockReporter.error).toHaveBeenCalledTimes(1);
      expect(mockReporter.verbose).toHaveBeenCalledTimes(1);
    });
  });
  describe("writeToFile", () => {
    it("should write cache to file", async () => {
      const cacher = new Cacher();
      fsPromises.access.mockReturnValueOnce(Promise.resolve());
      fsPromises.writeFile.mockReturnValueOnce(Promise.resolve());

      expect(cacher.writeToFile()).resolves.toBe(true);
    });

    it("should write cache to file and create cache dir", async () => {
      const mockReporter = {
        error: jest.fn(),
        verbose: jest.fn(),
      };
      const cacher = new Cacher({ reporter: mockReporter });
      fsPromises.access.mockReturnValueOnce(Promise.reject());
      fsPromises.writeFile.mockReturnValueOnce(Promise.resolve());

      expect(cacher.writeToFile()).resolves.toBe(true);
    });

    it("should return if write cache to file fails", async () => {
      const mockReporter = {
        error: jest.fn(),
        verbose: jest.fn(),
      };
      const cacher = new Cacher({ reporter: mockReporter });
      fsPromises.access.mockReturnValueOnce(Promise.resolve());
      fsPromises.writeFile.mockReturnValueOnce(Promise.reject());

      expect(cacher.writeToFile()).resolves.toBe(false);
    });
  });

  describe("compress and uncompress", () => {
    it("should compress and uncompress", async () => {
      const cacher = new Cacher();
      const data = { foo: "bar" };
      const compressed = await cacher.compress(data);
      expect(cacher.uncompress(compressed)).resolves.toEqual(data);
    });
  });

  describe("get", () => {
    it("should return cached data", async () => {
      const mReadStream = {
        read: jest.fn().mockReturnValueOnce(null),
        on: jest.fn().mockImplementation(function (event, handler) {
          handler();
          return this;
        }),
      };
      fs.createReadStream.mockReturnValueOnce(mReadStream);

      const cacher = new Cacher({
        cacheIndex: {
          data: {
            foo: {
              hash: "da39a3ee5e6b4b0d3255bfef95601890afd80709",
              data: "eJxTSkosUgIABGABeg==",
            },
          },
        },
      });

      expect(await cacher.getCachedData("foo")).toBe("bar");
    });

    it("should return undefined if not in cache", async () => {
      const cacher = new Cacher();

      expect(await cacher.getCachedData("baz")).toBe(null);
    });
  });
  describe("set", () => {
    it("should set data in cache", async () => {
      const mReadStream = {
        read: jest.fn().mockReturnValueOnce(null),
        on: jest.fn().mockImplementation(function (event, handler) {
          handler();
          return this;
        }),
      };
      fs.createReadStream.mockReturnValueOnce(mReadStream);

      const cacher = new Cacher();

      expect(await cacher.cacheData("foo", "bar")).toBe(undefined);
    });

    it("should return if is not cached file", async () => {
      const mockReporter = {
        error: jest.fn(),
        verbose: jest.fn(),
      };

      const cacher = new Cacher({ reporter: mockReporter });

      expect(await cacher.isCachedFile("foo", "bar")).toBe(false);
    });

    it("should return if is cached file", async () => {
      const mReadStream = {
        read: jest.fn().mockReturnValueOnce(null),
        on: jest.fn().mockImplementation(function (event, handler) {
          handler();
          return this;
        }),
      };
      fs.createReadStream.mockReturnValueOnce(mReadStream);
      const cacher = new Cacher({
        cacheIndex: {
          foo: "da39a3ee5e6b4b0d3255bfef95601890afd80709",
        },
      });

      expect(await cacher.isCachedFile("foo")).toBe(true);
    });

    it("should mark a cached file", () => {
      const mReadStream = {
        read: jest.fn().mockReturnValueOnce(null),
        on: jest.fn().mockImplementation(function (event, handler) {
          handler();
          return this;
        }),
      };
      fs.createReadStream.mockReturnValueOnce(mReadStream);

      const cacher = new Cacher();
      cacher.markCached("foo");
      expect(cacher.cacheIndex.foo).toBeUndefined();
    });
  });
});
