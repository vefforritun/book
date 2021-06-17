const WPM = 200;

module.exports = function estimateReadingTime(content) {
  try {
    const words = content.split(' ').length;

    return Math.ceil(words / WPM);
  } catch (e) {
    return -1;
  }
}
