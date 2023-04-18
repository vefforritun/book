const fs = require("fs");
const fsPromises = require("fs/promises");
const { copyDirectory } = require("../../utils/fileHelpers");

jest.mock("fs");
jest.mock("fs/promises");

describe("fileHelpers", () => {
  describe("copyDirectory", () => {
    it("should fail if from is not readable", async () => {
      const mockReporter = {
        warn: jest.fn(),
      };
      fsPromises.access.mockReturnValueOnce(Promise.reject());

      expect(
        await copyDirectory({ from: "from", to: "to", reporter: mockReporter })
      ).toBe(false);
      expect(mockReporter.warn).toHaveBeenCalledTimes(1);
      expect(mockReporter.warn).toHaveBeenCalledWith('"from" is not readable');
    });

    it("should fail if to does not exist and is not created", async () => {
      const mockReporter = {
        warn: jest.fn(),
      };
      fsPromises.access
        .mockReturnValueOnce(Promise.resolve())
        .mockReturnValueOnce(Promise.reject());
      fsPromises.mkdir.mockReturnValueOnce(Promise.reject());

      expect(
        await copyDirectory({ from: "from", to: "to", reporter: mockReporter })
      ).toBe(false);
      expect(mockReporter.warn).toHaveBeenCalledTimes(1);
      expect(mockReporter.warn).toHaveBeenCalledWith(
        'Unable to create directory "to"'
      );
    });

    it("should fail if from is not a directory", async () => {
      const mockReporter = {
        warn: jest.fn(),
      };
      fsPromises.access
        .mockReturnValueOnce(Promise.resolve())
        .mockReturnValueOnce(Promise.resolve());
      fsPromises.lstat
        .mockReturnValueOnce(Promise.resolve({ isDirectory: () => true }))
        .mockReturnValueOnce(Promise.resolve({ isDirectory: () => false }));

      expect(
        await copyDirectory({ from: "from", to: "to", reporter: mockReporter })
      ).toBe(false);
      expect(mockReporter.warn).toHaveBeenCalledTimes(1);
      expect(mockReporter.warn).toHaveBeenCalledWith(
        '"from" is not a directory'
      );
    });
  });
});
