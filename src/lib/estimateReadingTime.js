const DEFAULT_WORDS_PER_MINUTE = 200;

/**
 * Estimate the reading time of a given text.
 * Naïve implementation.
 */
module.exports = class EstimateReadingTime {
  constructor({ words_per_minute = DEFAULT_WORDS_PER_MINUTE } = {}) {
    if (typeof words_per_minute !== 'number') {
      throw new Error('WPM must be a number');
    }
    this.WPM = words_per_minute;
  }

  estimate(content) {
    if (typeof content !== 'string') {
      return -1;
    }

    if (content.length === 0) {
      return 0;
    }

    const words = content.split(' ').length;

    return Math.ceil(words / this.WPM);
  }
};
