import { describe, it, expect } from 'vitest';
import type { BufferGeometry } from 'three';
import { DEFAULT_CONFIG, PRESET_LIST, applyPreset, type StairConfig } from '@nxgen/stair-domain';
import { buildStepGeometry } from './stepGeometry';
import { buildSoffitGeometry } from './soffitGeometry';
import { buildColumnGeometry } from './columnGeometry';
import { buildBalustradeGeometry } from './balustradeGeometry';
import { buildRailGeometry } from './railGeometry';
import { buildLandingGeometry } from './landingGeometry';

/**
 * Property-style validity checks across the whole shipped config space:
 * every preset, both helix directions, every builder. A geometry is "valid"
 * when all vertex positions are finite and every index points at an existing
 * vertex — the two failure modes that silently corrupt rendering and GLB
 * export (NaN bounding spheres, out-of-range draws).
 */

const CONFIGS: Array<[string, StairConfig]> = PRESET_LIST.flatMap((p) =>
  (['CW', 'CCW'] as const).map((direction): [string, StairConfig] => [
    `${p.id} ${direction}`,
    { ...applyPreset(DEFAULT_CONFIG, p.id), direction },
  ]),
);

function expectValid(g: BufferGeometry, allowEmpty = false) {
  const pos = g.getAttribute('position');
  if (allowEmpty && (!pos || pos.count === 0)) return;
  expect(pos).toBeDefined();
  expect(pos.count).toBeGreaterThan(0);
  const arr = pos.array as ArrayLike<number>;
  let finite = true;
  for (let i = 0; i < arr.length; i++) {
    if (!Number.isFinite(arr[i])) { finite = false; break; }
  }
  expect(finite, 'all positions finite').toBe(true);
  const idx = g.getIndex();
  if (idx) {
    const ia = idx.array as ArrayLike<number>;
    let inRange = true;
    for (let i = 0; i < ia.length; i++) {
      if ((ia[i] as number) >= pos.count) { inRange = false; break; }
    }
    expect(inRange, 'all indices within vertex count').toBe(true);
  }
}

describe.each(CONFIGS)('geometry validity — %s', (_label, cfg) => {
  it('steps: every step valid, full run tops out at totalHeight', () => {
    for (let k = 0; k < cfg.stepCount; k++) expectValid(buildStepGeometry(cfg, k));
    const last = buildStepGeometry(cfg, cfg.stepCount - 1);
    last.computeBoundingBox();
    expect(last.boundingBox!.max.y).toBeCloseTo(cfg.totalHeight, 0);
  });

  it('soffit valid', () => expectValid(buildSoffitGeometry(cfg), true));
  it('column valid', () => expectValid(buildColumnGeometry(cfg), true));
  it('balustrade valid', () => expectValid(buildBalustradeGeometry(cfg), true));
  it('rail valid', () => expectValid(buildRailGeometry(cfg), true));
  it('landing valid', () => expectValid(buildLandingGeometry(cfg), true));
});

describe('smooth-helix soffit winding (normals face outward)', () => {
  // Ring layout in buildSmoothHelix: 8 vertices per ring — [iT_s, oT_s, iB_s,
  // oB_s, iT_w, oT_w, iB_w, oB_w]. Shell vertices (first four) belong only to
  // the top/bottom shell triangles, so after computeVertexNormals their
  // normals are pure surface normals. The surface is a climbing helical
  // ribbon, so the invariant is the SIGN (top up, bottom down), not
  // verticality: the ribbon climbs ~81° near the column vs ~30° at the outer
  // edge (H=2900 over one turn), so normals legitimately tilt with pitch and
  // are more vertical at the outer edge. This pins the CW/CCW inversion logic.
  it.each(['CW', 'CCW'] as const)('%s: top shell +Y, bottom shell -Y, outer more vertical', (direction) => {
    const g = buildSoffitGeometry({ ...DEFAULT_CONFIG, soffitMode: 'smooth_helix', direction });
    const pos = g.getAttribute('position');
    const normal = g.getAttribute('normal');
    expect(normal).toBeDefined();
    const rings = pos.count / 8;
    expect(Number.isInteger(rings)).toBe(true);
    const mid = Math.floor(rings / 2) * 8;
    const topInner = normal.getY(mid);
    const topOuter = normal.getY(mid + 1);
    const botInner = normal.getY(mid + 2);
    const botOuter = normal.getY(mid + 3);
    // Orientation: top faces up, bottom faces down — for BOTH directions.
    expect(topInner, `${direction} top-inner`).toBeGreaterThan(0.1);
    expect(topOuter, `${direction} top-outer`).toBeGreaterThan(0.5);
    expect(botInner, `${direction} bottom-inner`).toBeLessThan(-0.1);
    expect(botOuter, `${direction} bottom-outer`).toBeLessThan(-0.5);
    // Pitch physics: the outer edge climbs more gently → more vertical normal.
    expect(topOuter, `${direction} outer more vertical than inner`).toBeGreaterThan(topInner);
    // Symmetry: bottom mirrors top.
    expect(botOuter).toBeCloseTo(-topOuter, 1);
  });
});

describe('degenerate-input hardening', () => {
  it('rounded nosing with radius exceeding thickness stays finite', () => {
    const cfg = { ...DEFAULT_CONFIG, nosingType: 'rounded' as const, nosingRadius: 500, stepThickness: 20 };
    expectValid(buildStepGeometry(cfg, 0));
  });

  it('chamfer larger than thickness stays finite', () => {
    const cfg = { ...DEFAULT_CONFIG, nosingType: 'chamfer' as const, chamferSize: 500, stepThickness: 20 };
    expectValid(buildStepGeometry(cfg, 0));
  });

  it('tube column with wall thicker than radius stays finite', () => {
    const cfg = { ...DEFAULT_CONFIG, columnType: 'tube' as const, columnDiameter: 60, columnWallThickness: 200 };
    expectValid(buildColumnGeometry(cfg));
  });

  it('minimum step count still produces a complete run', () => {
    const cfg = { ...DEFAULT_CONFIG, stepCount: 6 };
    for (let k = 0; k < 6; k++) expectValid(buildStepGeometry(cfg, k));
    expectValid(buildSoffitGeometry(cfg));
  });
});
