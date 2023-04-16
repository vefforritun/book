const estimateReadingTime = require("../lib/estimateReadingTime");

describe("estimateReadingTime", () => {
  test("should return -1 if content is not a string", () => {
    expect(estimateReadingTime(123)).toBe(-1);
  });
});
