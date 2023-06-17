const Renderer = require('../lib/Renderer');

describe('markdown', () => {
  it('should render marked', () => {
    const renderer = new Renderer();
    expect(renderer.marked('foo&bar')).toMatch('foo&bar');
  });
});
