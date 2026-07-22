import { describe, it, expect } from 'vitest';
import { DEFAULT_CONFIG, applyPreset, validate, computeSummary } from './index';

describe('Planter domain', () => {
  it('default config is valid', () => {
    expect(validate(DEFAULT_CONFIG)).toHaveLength(0);
  });

  it('every preset produces a valid configuration', () => {
    for (const id of ['klasyczna_sosna', 'wysoka_modrzew', 'skrzynia_dab']) {
      expect(validate(applyPreset(DEFAULT_CONFIG, id)), id).toHaveLength(0);
    }
  });

  it('tall narrow planter warns about tipping over', () => {
    const issues = validate({ ...DEFAULT_CONFIG, width: 250, depth: 250, height: 900 });
    expect(issues.find((i) => i.rule === 'tip_over')?.severity).toBe('warn');
  });

  it('shallow body is flagged as info', () => {
    const issues = validate({ ...DEFAULT_CONFIG, height: 150 });
    expect(issues.find((i) => i.rule === 'min_soil_depth')?.severity).toBe('info');
  });

  it('board gap outside 3–10 mm warns', () => {
    expect(validate({ ...DEFAULT_CONFIG, boardGap: 14 }).some((i) => i.rule === 'board_gap_range')).toBe(true);
  });

  it('computeSummary: four faces of courses, positive soil volume', () => {
    const s = computeSummary(DEFAULT_CONFIG);
    expect(s.courses).toBeGreaterThan(0);
    expect(s.boards).toBe(s.courses * 4);
    expect(s.volumeL).toBeGreaterThan(0);
  });

  it('taller body yields more courses', () => {
    const tall = applyPreset(DEFAULT_CONFIG, 'wysoka_modrzew');
    expect(computeSummary(tall).courses).toBeGreaterThan(
      computeSummary({ ...DEFAULT_CONFIG, height: 350 }).courses,
    );
  });
});
