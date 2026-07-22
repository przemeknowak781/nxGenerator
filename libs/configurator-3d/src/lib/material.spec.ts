import { describe, it, expect } from 'vitest';
import { buildStandardMaterial } from './material';

describe('buildStandardMaterial', () => {
  it('maps roughness + metalness', () => {
    const m = buildStandardMaterial({ preset: 'oak_natural', baseColor: '#b68654', roughness: 0.55, metallic: 0 });
    expect(m.roughness).toBeCloseTo(0.55);
    expect(m.metalness).toBe(0);
  });

  it('steel-like config is metallic', () => {
    const m = buildStandardMaterial({ preset: 'steel_inox', baseColor: '#c8c8c8', roughness: 0.3, metallic: 1 });
    expect(m.metalness).toBe(1);
  });

  it('glassy custom preset becomes transparent', () => {
    const m = buildStandardMaterial({ preset: 'custom', baseColor: '#e8f0f5', roughness: 0.05, metallic: 0 });
    expect(m.transparent).toBe(true);
    expect(m.opacity).toBeLessThan(1);
  });
});
