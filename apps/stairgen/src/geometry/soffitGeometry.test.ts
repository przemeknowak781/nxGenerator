import { describe, it, expect } from 'vitest';
import { buildSoffitGeometry } from './soffitGeometry';
import { DEFAULT_CONFIG } from '../config/defaults';

describe('buildSoffitGeometry — stepped', () => {
  it('returns empty when risersEnabled=false', () => {
    const g = buildSoffitGeometry({ ...DEFAULT_CONFIG, soffitMode: 'stepped', risersEnabled: false });
    expect(g.getAttribute('position')?.count ?? 0).toBe(0);
  });

  it('returns riser quads when risersEnabled=true', () => {
    const g = buildSoffitGeometry({ ...DEFAULT_CONFIG, soffitMode: 'stepped', risersEnabled: true });
    expect(g.getAttribute('position').count).toBeGreaterThan(0);
  });
});

describe('buildSoffitGeometry — smooth_helix', () => {
  it('produces a continuous helical slab', () => {
    const g = buildSoffitGeometry({ ...DEFAULT_CONFIG, soffitMode: 'smooth_helix' });
    expect(g.getAttribute('position').count).toBeGreaterThan(400);
  });

  it('bounding box top reaches totalHeight', () => {
    const cfg = { ...DEFAULT_CONFIG, soffitMode: 'smooth_helix' as const };
    const g = buildSoffitGeometry(cfg);
    g.computeBoundingBox();
    expect(g.boundingBox!.max.y).toBeCloseTo(cfg.totalHeight, 0);
    expect(g.boundingBox!.min.y).toBeLessThan(0);
  });
});

describe('buildSoffitGeometry — offset_slab', () => {
  it('bottom is lower than smooth_helix bottom', () => {
    const base = { ...DEFAULT_CONFIG };
    const a = buildSoffitGeometry({ ...base, soffitMode: 'smooth_helix' });
    const b = buildSoffitGeometry({ ...base, soffitMode: 'offset_slab' });
    a.computeBoundingBox();
    b.computeBoundingBox();
    expect(b.boundingBox!.min.y).toBeLessThanOrEqual(a.boundingBox!.min.y);
  });
});
