import { describe, it, expect } from 'vitest';
import { validate } from './validators';
import { DEFAULT_CONFIG } from './defaults';
import type { StairConfig } from './types';

const wide: Partial<StairConfig> = { outerRadius: 1400, columnDiameter: 140 };

describe('rule: riseHeight max', () => {
  it('residential: rise > 190 → error', () => {
    const issues = validate({ ...DEFAULT_CONFIG, totalHeight: 3500, stepCount: 16, buildingType: 'residential' });
    expect(issues.find((i) => i.rule === 'rise_max')?.severity).toBe('error');
  });
  it('residential: rise = 180 → no rise_max issue', () => {
    const issues = validate({ ...DEFAULT_CONFIG, totalHeight: 2880, stepCount: 16, buildingType: 'residential' });
    expect(issues.find((i) => i.rule === 'rise_max')).toBeUndefined();
  });
  it('public: threshold is tighter (175)', () => {
    const issues = validate({ ...DEFAULT_CONFIG, totalHeight: 2880, stepCount: 16, buildingType: 'public' });
    expect(issues.find((i) => i.rule === 'rise_max')?.severity).toBe('error');
  });
});

describe('rule: walkline depth min', () => {
  it('residential: depth < 250 → error', () => {
    const issues = validate({ ...DEFAULT_CONFIG, outerRadius: 800, stepCount: 16, sweepAngle: 360 });
    expect(issues.find((i) => i.rule === 'walk_min')?.severity).toBe('error');
  });
  it('residential: wide stair → no issue', () => {
    const issues = validate({ ...DEFAULT_CONFIG, ...wide, stepCount: 16, sweepAngle: 360 });
    expect(issues.find((i) => i.rule === 'walk_min')).toBeUndefined();
  });
  it('public threshold tighter (300)', () => {
    const issues = validate({ ...DEFAULT_CONFIG, ...wide, buildingType: 'public' });
    expect(issues.find((i) => i.rule === 'walk_min')?.severity).toBe('error');
  });
});

describe('rule: effective width min', () => {
  it('residential: width < 800 → error', () => {
    const issues = validate({ ...DEFAULT_CONFIG, outerRadius: 500, columnDiameter: 140 });
    expect(issues.find((i) => i.rule === 'width_min')?.severity).toBe('error');
  });
  it('residential: width >= 800 → no issue', () => {
    const issues = validate({ ...DEFAULT_CONFIG, outerRadius: 900, columnDiameter: 140 });
    expect(issues.find((i) => i.rule === 'width_min')).toBeUndefined();
  });
  it('public needs 1200', () => {
    const issues = validate({ ...DEFAULT_CONFIG, outerRadius: 900, columnDiameter: 140, buildingType: 'public' });
    expect(issues.find((i) => i.rule === 'width_min')?.severity).toBe('error');
  });
});

describe('rule: rail height min', () => {
  it('residential: railingHeight < 900 → error', () => {
    const issues = validate({ ...DEFAULT_CONFIG, railingEnabled: true, railingHeight: 850 });
    expect(issues.find((i) => i.rule === 'rail_h_min')?.severity).toBe('error');
  });
  it('residential: railingHeight = 1000 → no issue', () => {
    const issues = validate({ ...DEFAULT_CONFIG, railingEnabled: true, railingHeight: 1000 });
    expect(issues.find((i) => i.rule === 'rail_h_min')).toBeUndefined();
  });
  it('public needs 1100', () => {
    const issues = validate({ ...DEFAULT_CONFIG, railingEnabled: true, railingHeight: 1000, buildingType: 'public' });
    expect(issues.find((i) => i.rule === 'rail_h_min')?.severity).toBe('error');
  });
  it('railing disabled → no rule fires', () => {
    const issues = validate({ ...DEFAULT_CONFIG, railingEnabled: false, railingHeight: 500 });
    expect(issues.find((i) => i.rule === 'rail_h_min')).toBeUndefined();
  });
});

describe('rule: bar spacing max', () => {
  it('residential: bars with spacing > 120 → error', () => {
    const issues = validate({ ...DEFAULT_CONFIG, fillType: 'vertical_bars', barSpacing: 150 });
    expect(issues.find((i) => i.rule === 'bar_spc_max')?.severity).toBe('error');
  });
  it('residential: spacing = 110 → no issue', () => {
    const issues = validate({ ...DEFAULT_CONFIG, fillType: 'vertical_bars', barSpacing: 110 });
    expect(issues.find((i) => i.rule === 'bar_spc_max')).toBeUndefined();
  });
  it('glass fill: rule does not fire', () => {
    const issues = validate({ ...DEFAULT_CONFIG, fillType: 'glass', barSpacing: 999 });
    expect(issues.find((i) => i.rule === 'bar_spc_max')).toBeUndefined();
  });
});

describe('rule: blondel range', () => {
  it('blondel outside 600–650 → warn', () => {
    const issues = validate({ ...DEFAULT_CONFIG, outerRadius: 800, stepCount: 16, sweepAngle: 360 });
    expect(issues.find((i) => i.rule === 'blondel')?.severity).toBe('warn');
  });
  it('blondel in range → no issue', () => {
    // Find a config with 2h+s ≈ 625. rise=181.25, need walklineDepth ≈ 262.5 → outerRadius ~1300
    const issues = validate({ ...DEFAULT_CONFIG, outerRadius: 1300, columnDiameter: 140, sweepAngle: 360, stepCount: 16 });
    expect(issues.find((i) => i.rule === 'blondel')).toBeUndefined();
  });
});

describe('rule: step angle max', () => {
  it('residential: angle > 30 → warn', () => {
    const issues = validate({ ...DEFAULT_CONFIG, sweepAngle: 540, stepCount: 12 });
    expect(issues.find((i) => i.rule === 'step_angle')?.severity).toBe('warn');
  });
  it('residential: angle <= 30 → no issue', () => {
    const issues = validate({ ...DEFAULT_CONFIG, sweepAngle: 360, stepCount: 16 });
    expect(issues.find((i) => i.rule === 'step_angle')).toBeUndefined();
  });
  it('auxiliary threshold is 45', () => {
    const issues = validate({ ...DEFAULT_CONFIG, sweepAngle: 540, stepCount: 12, buildingType: 'auxiliary' });
    expect(issues.find((i) => i.rule === 'step_angle')).toBeUndefined();
  });
});
