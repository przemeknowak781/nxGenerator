import { describe, it, expect } from 'vitest';
import { DEFAULT_CONFIG, applyPreset, validate } from './index';

describe('Planter domain', () => {
  it('default config is valid', () => {
    expect(validate(DEFAULT_CONFIG)).toHaveLength(0);
  });

  it('tall preset raises height', () => {
    expect(applyPreset(DEFAULT_CONFIG, 'tall').height).toBeGreaterThan(
      DEFAULT_CONFIG.height,
    );
  });

  it('narrow footprint fails validation', () => {
    expect(
      validate({ ...DEFAULT_CONFIG, width: 50 }).some(
        (i) => i.severity === 'error',
      ),
    ).toBe(true);
  });
});
