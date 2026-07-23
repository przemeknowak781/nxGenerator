import { describe, it, expect } from 'vitest';
import { DEFAULT_CONFIG, applyPreset, validate, computeSummary } from './index';

describe('Taras domain', () => {
  it('default config is valid', () => {
    expect(validate(DEFAULT_CONFIG)).toHaveLength(0);
  });

  it('raised preset lifts the deck', () => {
    expect(applyPreset(DEFAULT_CONFIG, 'wyniesiony_modrzew').deckHeight).toBeGreaterThan(
      DEFAULT_CONFIG.deckHeight,
    );
  });

  it('exotic preset uses narrower boards → more boards across the same width', () => {
    const exotic = applyPreset(DEFAULT_CONFIG, 'egzotyczny_bangkirai');
    expect(computeSummary(exotic).boards).toBeGreaterThan(computeSummary(DEFAULT_CONFIG).boards);
  });

  it('over-wide joist spacing fails validation (deflection)', () => {
    const issues = validate({ ...DEFAULT_CONFIG, joistSpacing: 900, boardThickness: 25 });
    expect(issues.find((i) => i.rule === 'joist_spacing_max')?.severity).toBe('error');
  });

  it('board gap outside 3–8 mm warns', () => {
    expect(validate({ ...DEFAULT_CONFIG, boardGap: 12 }).some((i) => i.rule === 'board_gap_range')).toBe(true);
  });

  it('computeSummary reports positive area and board count', () => {
    const s = computeSummary(DEFAULT_CONFIG);
    expect(s.boards).toBeGreaterThan(0);
    expect(s.areaM2).toBeCloseTo(12, 0);
  });

  it('structure (board + joist + bearer beam) must fit within deck height', () => {
    const issues = validate({ ...DEFAULT_CONFIG, deckHeight: 100, boardThickness: 28, joistHeight: 140, beamHeight: 120 });
    expect(issues.find((i) => i.rule === 'structure_fits_height')?.severity).toBe('error');
  });

  it('the bearer beam counts toward the build-up', () => {
    // Board 28 + joist 140 = 168 fits in 200, but + beam 120 = 288 does not.
    const base = { ...DEFAULT_CONFIG, deckHeight: 200, boardThickness: 28, joistHeight: 140 };
    expect(validate({ ...base, beamHeight: 20 }).find((i) => i.rule === 'structure_fits_height')).toBeUndefined();
    expect(validate({ ...base, beamHeight: 120 }).find((i) => i.rule === 'structure_fits_height')?.severity).toBe('error');
  });

  it('a low railing warns, and disabling the railing clears it', () => {
    expect(validate({ ...DEFAULT_CONFIG, railingEnabled: true, railingHeight: 800 }).find((i) => i.rule === 'railing_height_min')?.severity).toBe('warn');
    expect(validate({ ...DEFAULT_CONFIG, railingEnabled: false, railingHeight: 800 }).find((i) => i.rule === 'railing_height_min')).toBeUndefined();
  });

  it('a wide baluster gap warns, and disabling the railing clears it', () => {
    expect(validate({ ...DEFAULT_CONFIG, railingEnabled: true, balusterGap: 160 }).find((i) => i.rule === 'baluster_gap_max')?.severity).toBe('warn');
    expect(validate({ ...DEFAULT_CONFIG, railingEnabled: false, balusterGap: 160 }).find((i) => i.rule === 'baluster_gap_max')).toBeUndefined();
  });

  it('every preset produces a valid configuration', () => {
    for (const id of ['naziemny_sosna', 'wyniesiony_modrzew', 'egzotyczny_bangkirai']) {
      expect(validate(applyPreset(DEFAULT_CONFIG, id)), id).toHaveLength(0);
    }
  });

  it('boards never overhang the configured deck width', () => {
    for (const id of ['naziemny_sosna', 'wyniesiony_modrzew', 'egzotyczny_bangkirai']) {
      const c = applyPreset(DEFAULT_CONFIG, id);
      const { boards } = computeSummary(c);
      const spanW = boards * c.boardWidth + (boards - 1) * c.boardGap;
      expect(spanW, id).toBeLessThanOrEqual(c.deckWidth);
    }
  });
});
