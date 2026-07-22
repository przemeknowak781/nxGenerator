import { describe, it, expect } from 'vitest';
import { buildLandingGeometry } from './landingGeometry';
import { DEFAULT_CONFIG } from '../config/defaults';

describe('buildLandingGeometry', () => {
  it('quarter landing produces extruded pie-slice', () => {
    const g = buildLandingGeometry(DEFAULT_CONFIG);
    expect(g.getAttribute('position').count).toBeGreaterThan(20);
  });

  it('none returns empty', () => {
    const g = buildLandingGeometry({ ...DEFAULT_CONFIG, landingShape: 'none' });
    expect(g.getAttribute('position')?.count ?? 0).toBe(0);
  });

  it('square landing respects width/depth', () => {
    const g = buildLandingGeometry({ ...DEFAULT_CONFIG, landingShape: 'square', landingWidth: 1000, landingDepth: 1000 });
    g.computeBoundingBox();
    const bb = g.boundingBox!;
    expect(bb.max.x - bb.min.x).toBeCloseTo(1000, 0);
  });

  it('landing top is at totalHeight (flush with last step top)', () => {
    const g = buildLandingGeometry(DEFAULT_CONFIG);
    g.computeBoundingBox();
    expect(g.boundingBox!.max.y).toBeCloseTo(DEFAULT_CONFIG.totalHeight, 0);
    expect(g.boundingBox!.min.y).toBeCloseTo(DEFAULT_CONFIG.totalHeight - DEFAULT_CONFIG.landingThickness, 0);
  });
});
