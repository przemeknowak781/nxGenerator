import { describe, it, expect, beforeEach } from 'vitest';
import { useStairStore, INITIAL_CONFIG, applyStairPreset } from './store';

describe('stair app store', () => {
  beforeEach(() => useStairStore.getState().reset());

  it('boots on the loft preset', () => {
    expect(useStairStore.getState().config).toEqual(INITIAL_CONFIG);
  });

  it('update() patches a single field', () => {
    useStairStore.getState().update({ totalHeight: 3100 });
    expect(useStairStore.getState().config.totalHeight).toBe(3100);
  });

  it('applyStairPreset() merges a preset by id', () => {
    applyStairPreset('publiczny_beton_180');
    expect(useStairStore.getState().config.buildingType).toBe('public');
  });
});
