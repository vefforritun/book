module.exports = class Reporter {
  constructor({
    silent = false,
    verbose = false,
    datetime = false,
    elapsed = true,
  } = {}) {
    this.silent = silent;
    this.isVerbose = verbose;
    this.elapsed = elapsed;
    this.datetime = datetime;
    this.start = this.timerStart();
  }

  timerStart() {
    return process.hrtime();
  }

  timerEnd(since) {
    const diff = process.hrtime(since);
    const elapsed = diff[0] * 1e9 + diff[1];
    const elapsedAsSeconds = elapsed / 1e9;
    const fixed = elapsedAsSeconds.toFixed(2);

    return `${fixed}${fixed.length < 4 ? " ".repeat(4 - fixed.length) : ""}`;
  }

  timing() {
    return [
      this.datetime ? new Date().toUTCString() : null,
      this.elapsed ? this.timerEnd(this.start).toString() : null,
      this.datetime || this.elapsed ? "—" : null,
    ].filter(Boolean);
  }

  group(...m) {
    if (!this.silent) {
      console.info(...this.timing(), ...m);
    }
    console.group();
  }

  groupEnd(...m) {
    console.groupEnd();
    if (!this.silent) {
      console.info(...this.timing(), ...m);
    }
  }

  error(...m) {
    if (!this.silent) {
      console.error(...this.timing(), ...m);
    }
  }

  warn(...m) {
    if (!this.silent) {
      console.warn(...this.timing(), ...m);
    }
  }

  info(...m) {
    if (!this.silent) {
      console.info(...this.timing(), ...m);
    }
  }

  verbose(...m) {
    if (this.isVerbose) {
      console.info(...this.timing(), ...m);
    }
  }
};
