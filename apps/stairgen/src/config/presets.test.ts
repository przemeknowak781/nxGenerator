import { describe, it, expect } from 'vitest';
import { PRESETS, applyPreset, PRESET_LIST } from './presets';
import { DEFAULT_CONFIG } from './defaults';

describe('presets', () => {
  it('has 5 presets', () => {
    expect(PRESET_LIST.length).toBe(5);
    expect(Object.keys(PRESETS).length).toBe(5);
  });

  it('applyPreset for mieszkanie_beton_140 yields concrete soffit', () => {
    const c = applyPreset(DEFAULT_CONFIG, 'mieszkanie_beton_140');
    expect(c.materials.soffit.preset).toMatch(/concrete/);
  });

  it('unknown preset returns base', () => {
    const c = applyPreset(DEFAULT_CONFIG, 'nonexistent');
    expect(c).toEqual(DEFAULT_CONFIG);
  });

  it('publiczny preset sets buildingType to public', () => {
    const c = applyPreset(DEFAULT_CONFIG, 'publiczny_beton_180');
    expect(c.buildingType).toBe('public');
  });
});
