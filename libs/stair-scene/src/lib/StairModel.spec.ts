import { describe, it, expect } from 'vitest';
import { StairModel } from './StairModel';
import { Step } from './Step';

describe('stair-scene exports', () => {
  it('exposes model + part components', () => {
    expect(typeof StairModel).toBe('function');
    expect(typeof Step).toBe('function');
  });
});
