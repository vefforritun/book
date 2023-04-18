const Reporter = require('../lib/Reporter');

describe('Reporter', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  test('should report a logged message', () => {
    const reporter = new Reporter();
    const spy = jest.spyOn(console, 'info').mockImplementation(() => {});
    reporter.info('foo');

    expect(spy.mock.calls).toHaveLength(1);
    expect(spy.mock.calls[0]).toEqual(['0.00', '—', 'foo']);
  });

  test('should report a group', () => {
    const reporter = new Reporter();
    const groupSpy = jest.spyOn(console, 'group').mockImplementation(() => {});
    // silent console
    jest.spyOn(console, 'info').mockImplementation(() => {});

    const groupEndSpy = jest
      .spyOn(console, 'groupEnd')
      .mockImplementation(() => {});
    reporter.group('foo');
    reporter.groupEnd('bar');

    expect(groupSpy.mock.calls).toHaveLength(1);
    expect(groupEndSpy.mock.calls).toHaveLength(1);
  });

  test('should report an error', () => {
    const reporter = new Reporter();
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    reporter.error('foo');

    expect(spy.mock.calls).toHaveLength(1);
    expect(spy.mock.calls[0]).toEqual(['0.00', '—', 'foo']);
  });

  test('should report a warning', () => {
    const reporter = new Reporter();
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    reporter.warn('foo');

    expect(spy.mock.calls).toHaveLength(1);
    expect(spy.mock.calls[0]).toEqual(['0.00', '—', 'foo']);
  });

  test('should report a verbose message', () => {
    const reporter = new Reporter({ verbose: true });
    const spy = jest.spyOn(console, 'info').mockImplementation(() => {});
    reporter.verbose('foo');

    expect(spy.mock.calls).toHaveLength(1);
    expect(spy.mock.calls[0]).toEqual(['0.00', '—', 'foo']);
  });

  test('should not report anything if silent', () => {
    const reporter = new Reporter({ silent: true });
    const spy = jest.spyOn(console, 'info').mockImplementation(() => {});
    reporter.info('foo');
    reporter.verbose('foo');
    reporter.warn('foo');
    reporter.error('foo');
    reporter.group('foo');
    reporter.groupEnd('foo');

    expect(spy.mock.calls).toHaveLength(0);
  });

  test('should report elapsed time', () => {
    jest.useFakeTimers();
    const reporter = new Reporter({ elapsed: true });
    const spy = jest.spyOn(console, 'info').mockImplementation(() => {});

    reporter.info('foo');
    jest.advanceTimersByTime(1000);
    reporter.info('bar');

    expect(spy.mock.calls).toHaveLength(2);
    expect(spy.mock.calls[0]).toEqual(['0.00', '—', 'foo']);
    expect(spy.mock.calls[1]).toEqual(['1.00', '—', 'bar']);
  });

  test('should report elapsed time and datetime', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-01-01'));
    const reporter = new Reporter({ elapsed: true, datetime: true });
    const spy = jest.spyOn(console, 'info').mockImplementation(() => {});

    reporter.info('foo');
    jest.advanceTimersByTime(1000);
    reporter.info('bar');

    expect(spy.mock.calls).toHaveLength(2);
    expect(spy.mock.calls[0]).toEqual([
      'Sun, 01 Jan 2023 00:00:00 GMT',
      '0.00',
      '—',
      'foo',
    ]);
    expect(spy.mock.calls[1]).toEqual([
      'Sun, 01 Jan 2023 00:00:01 GMT',
      '1.00',
      '—',
      'bar',
    ]);
  });
});
