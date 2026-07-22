import { describe, it, expect } from 'vitest';
import { buildMaterial } from './materials';

describe('buildMaterial', () => {
  it('returns MeshStandardMaterial with roughness + metalness', () => {
    const m = buildMaterial({ preset: 'oak_natural', baseColor: '#b68654', roughness: 0.55, metallic: 0, textureScale: 1 });
    expect(m.roughness).toBeCloseTo(0.55);
    expect(m.metalness).toBe(0);
  });

  it('steel preset is metallic', () => {
    const m = buildMaterial({ preset: 'steel_inox', baseColor: '#c8c8c8', roughness: 0.3, metallic: 1, textureScale: 1 });
    expect(m.metalness).toBe(1);
  });

  it('glass-ish custom becomes transparent', () => {
    const m = buildMaterial({ preset: 'custom', baseColor: '#e8f0f5', roughness: 0.05, metallic: 0, textureScale: 1 });
    expect(m.transparent).toBe(true);
    expect(m.opacity).toBeLessThan(1);
  });
});
