import { describe, it, expect } from 'vitest';
import { buildStepGeometry } from './stepGeometry';
import { DEFAULT_CONFIG } from '../config/defaults';

describe('buildStepGeometry', () => {
  it('produces non-empty BufferGeometry', () => {
    const g = buildStepGeometry(DEFAULT_CONFIG, 0);
    expect(g.getAttribute('position').count).toBeGreaterThan(20);
  });

  it('bounding box respects outerRadius + nosingOvershoot', () => {
    const g = buildStepGeometry(DEFAULT_CONFIG, 0);
    g.computeBoundingBox();
    const bb = g.boundingBox!;
    const maxR = Math.max(
      Math.abs(bb.max.x), Math.abs(bb.min.x),
      Math.abs(bb.max.z), Math.abs(bb.min.z),
    );
    expect(maxR).toBeLessThanOrEqual(DEFAULT_CONFIG.outerRadius + DEFAULT_CONFIG.nosingOvershoot + 1);
  });

  it('step k sits at height k*rise to (k+1)*rise', () => {
    const cfg = { ...DEFAULT_CONFIG };
    const g = buildStepGeometry(cfg, 2);
    g.computeBoundingBox();
    const rise = cfg.totalHeight / cfg.stepCount;
    expect(g.boundingBox!.max.y).toBeCloseTo(3 * rise, 1);
    expect(g.boundingBox!.min.y).toBeCloseTo(3 * rise - cfg.stepThickness, 1);
  });

  it('has an index buffer', () => {
    const g = buildStepGeometry(DEFAULT_CONFIG, 0);
    expect(g.getIndex()).not.toBeNull();
  });
});

describe('nosing variants', () => {
  it('rounded produces more vertices than square', () => {
    const sq = buildStepGeometry({ ...DEFAULT_CONFIG, nosingType: 'square', nosingOvershoot: 0 }, 0);
    const rn = buildStepGeometry({ ...DEFAULT_CONFIG, nosingType: 'rounded', nosingRadius: 10, nosingOvershoot: 0 }, 0);
    expect(rn.getAttribute('position').count).toBeGreaterThan(sq.getAttribute('position').count);
  });

  it('chamfer produces more vertices than square', () => {
    const sq = buildStepGeometry({ ...DEFAULT_CONFIG, nosingType: 'square', nosingOvershoot: 0 }, 0);
    const ch = buildStepGeometry({ ...DEFAULT_CONFIG, nosingType: 'chamfer', chamferSize: 6, nosingOvershoot: 0 }, 0);
    expect(ch.getAttribute('position').count).toBeGreaterThan(sq.getAttribute('position').count);
  });

  it('rounded bounding box stays within outerRadius', () => {
    const cfg = { ...DEFAULT_CONFIG, nosingType: 'rounded' as const, nosingRadius: 10, nosingOvershoot: 0 };
    const g = buildStepGeometry(cfg, 0);
    g.computeBoundingBox();
    const bb = g.boundingBox!;
    const maxR = Math.max(Math.abs(bb.max.x), Math.abs(bb.min.x), Math.abs(bb.max.z), Math.abs(bb.min.z));
    expect(maxR).toBeLessThanOrEqual(cfg.outerRadius + 1);
  });
});
