import { describe, it, expect } from 'vitest';
import configuratorGenerator, { configuratorGenerator as named } from './configurator';

describe('configurator generator', () => {
  it('exports a generator function', () => {
    expect(typeof configuratorGenerator).toBe('function');
    expect(named).toBe(configuratorGenerator);
  });
});
