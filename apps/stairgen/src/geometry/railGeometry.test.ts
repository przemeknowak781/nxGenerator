import { describe, it, expect } from 'vitest';
import { buildRailGeometry } from './railGeometry';
import { DEFAULT_CONFIG } from '../config/defaults';

describe('buildRailGeometry', () => {
  it('produces a helical tube when railing enabled', () => {
    const g = buildRailGeometry(DEFAULT_CONFIG);
    expect(g.getAttribute('position').count).toBeGreaterThan(200);
  });

  it('empty when railingEnabled=false', () => {
    const g = buildRailGeometry({ ...DEFAULT_CONFIG, railingEnabled: false });
    expect(g.getAttribute('position')?.count ?? 0).toBe(0);
  });

  it('top of tube reaches roughly totalHeight + railingHeight', () => {
    const cfg = DEFAULT_CONFIG;
    const g = buildRailGeometry(cfg);
    g.computeBoundingBox();
    const rise = cfg.totalHeight / cfg.stepCount;
    const expectedTop = cfg.totalHeight + cfg.railingHeight + rise;
    expect(g.boundingBox!.max.y).toBeGreaterThan(expectedTop - 50);
  });
});
