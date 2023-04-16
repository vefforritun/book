const EstimateReadingTime = require("../lib/estimateReadingTime");

describe("estimateReadingTime", () => {
  test("should return -1 if content is not a string", () => {
    const ert = new EstimateReadingTime();
    expect(ert.estimate(123)).toBe(-1);
    expect(ert.estimate(null)).toBe(-1);
    expect(ert.estimate(true)).toBe(-1);
  });

  test("should return 0 if content is empty", () => {
    const ert = new EstimateReadingTime();
    expect(ert.estimate("")).toBe(0);
  });

  test("should return 1 if content is 10 words and WPM is 10", () => {
    const ert = new EstimateReadingTime({ words_per_minute: 10 });
    expect(
      ert.estimate("one two three four five six seven eight nine ten")
    ).toBe(1);
  });

  test("should throw if WPM is not a number", () => {
    expect(() => new EstimateReadingTime({ words_per_minute: "foo" })).toThrow(
      "WPM must be a number"
    );
  });
});
