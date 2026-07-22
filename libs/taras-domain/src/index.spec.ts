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
});
