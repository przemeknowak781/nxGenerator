import { describe, it, expect } from 'vitest';
import { buildBalustradeGeometry } from './balustradeGeometry';
import { DEFAULT_CONFIG } from '../config/defaults';

describe('buildBalustradeGeometry', () => {
  it('empty when railingEnabled=false', () => {
    const g = buildBalustradeGeometry({ ...DEFAULT_CONFIG, railingEnabled: false });
    expect(g.getAttribute('position')?.count ?? 0).toBe(0);
  });

  it('vertical_bars: produces ~2 bars per step', () => {
    const cfg = { ...DEFAULT_CONFIG, railingEnabled: true, fillType: 'vertical_bars' as const };
    const g = buildBalustradeGeometry(cfg);
    expect(g.getAttribute('position').count).toBeGreaterThan(cfg.stepCount * 20);
  });

  it('glass: produces flat panels per sector', () => {
    const g = buildBalustradeGeometry({ ...DEFAULT_CONFIG, railingEnabled: true, fillType: 'glass' });
    expect(g.getAttribute('position').count).toBeGreaterThan(0);
  });

  it('cable: produces segmented helical tubes', () => {
    const g = buildBalustradeGeometry({ ...DEFAULT_CONFIG, railingEnabled: true, fillType: 'cable', cableCount: 5 });
    expect(g.getAttribute('position').count).toBeGreaterThan(100);
  });

  it('horizontal_bars: non-empty', () => {
    const g = buildBalustradeGeometry({ ...DEFAULT_CONFIG, railingEnabled: true, fillType: 'horizontal_bars' });
    expect(g.getAttribute('position').count).toBeGreaterThan(0);
  });

  it('both sides: ~2x vertex count vs outer only', () => {
    const outer = buildBalustradeGeometry({ ...DEFAULT_CONFIG, railingEnabled: true, fillType: 'vertical_bars', railingSide: 'outer' });
    const both  = buildBalustradeGeometry({ ...DEFAULT_CONFIG, railingEnabled: true, fillType: 'vertical_bars', railingSide: 'both'  });
    expect(both.getAttribute('position').count).toBeGreaterThan(outer.getAttribute('position').count * 1.8);
  });
});
