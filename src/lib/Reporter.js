module.exports = class Reporter {
  constructor({ silent = false, verbose = false } = {}) {
    this.silent = silent;
    this.isVerbose = verbose;
  }

  error(...m) {
    if (!this.silent) {
      console.error(...m);
    }
  }

  warn(...m) {
    if (!this.silent) {
      console.warn(...m);
    }
  }

  info(...m) {
    if (!this.silent) {
      console.info(...m);
    }
  }

  verbose(...m) {
    if (this.isVerbose) {
      console.info(...m);
    }
  }
}
