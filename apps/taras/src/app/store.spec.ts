import { describe, it, expect, beforeEach } from 'vitest';
import { useTarasStore, applyTarasPreset } from './store';
import { DEFAULT_CONFIG } from '@nxgen/taras-domain';

describe('Taras store', () => {
  beforeEach(() => useTarasStore.getState().reset());

  it('boots on the default config', () => {
    expect(useTarasStore.getState().config).toEqual(DEFAULT_CONFIG);
  });

  it('update() patches a field', () => {
    useTarasStore.getState().update({ deckHeight: 1234 });
    expect(useTarasStore.getState().config.deckHeight).toBe(1234);
  });

  it('applyPreset merges a preset', () => {
    applyTarasPreset('wyniesiony_modrzew');
    expect(useTarasStore.getState().config.deckHeight).toBeGreaterThan(DEFAULT_CONFIG.deckHeight);
  });
});
