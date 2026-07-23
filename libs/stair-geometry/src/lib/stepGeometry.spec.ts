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

  // A solid tread's flat top must face UP (+Y) and its flat bottom DOWN (-Y),
  // for BOTH helix directions. Two bugs would break this: shared vertices bleed
  // the flat faces (no pure ±Y at all), and a direction-blind winding leaves the
  // whole tread inside-out for the CW helix (top faced down). This pins both.
  it.each(['CW', 'CCW'] as const)('%s: tread top faces up, bottom faces down', (direction) => {
    const cfg = { ...DEFAULT_CONFIG, direction };
    const g = buildStepGeometry(cfg, 0);
    const pos = g.getAttribute('position');
    const nrm = g.getAttribute('normal');
    const yTop = cfg.totalHeight / cfg.stepCount; // step 0 top
    const yBot = yTop - cfg.stepThickness;
    let topUp = 0;
    let botDown = 0;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const ny = nrm.getY(i);
      if (Math.abs(y - yTop) < 1 && ny > 0.9) topUp++;
      if (Math.abs(y - yBot) < 1 && ny < -0.9) botDown++;
    }
    expect(topUp, `${direction} flat top faces +Y`).toBeGreaterThan(20);
    expect(botDown, `${direction} flat bottom faces -Y`).toBeGreaterThan(20);
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
