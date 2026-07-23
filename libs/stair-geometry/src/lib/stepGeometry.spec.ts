import { describe, it, expect } from 'vitest';
import { buildStepGeometry } from './stepGeometry';
import { DEFAULT_CONFIG } from '@nxgen/stair-domain';

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

  it('tread top/bottom carry flat, un-bled normals', () => {
    // A solid tread has a flat top (+Y) and flat bottom (-Y). If the mesh shared
    // vertices between those faces and the vertical walls, computeVertexNormals
    // would average them and NO vertex would read a pure ±Y — the bug that bled
    // a false gradient across the step. De-indexed, the flat faces are crisp.
    const g = buildStepGeometry(DEFAULT_CONFIG, 0);
    const nrm = g.getAttribute('normal');
    let up = 0;
    let down = 0;
    for (let i = 0; i < nrm.count; i++) {
      const ny = nrm.getY(i);
      if (ny > 0.999) up++;
      else if (ny < -0.999) down++;
    }
    expect(up, 'flat top vertices (+Y)').toBeGreaterThan(20);
    expect(down, 'flat bottom vertices (-Y)').toBeGreaterThan(20);
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
