import { describe, it, expect, beforeEach } from 'vitest';
import { useStairStore, INITIAL_CONFIG } from './useStairStore';

describe('useStairStore', () => {
  beforeEach(() => useStairStore.getState().reset());

  it('has INITIAL_CONFIG (loft preset) initially', () => {
    expect(useStairStore.getState().config).toEqual(INITIAL_CONFIG);
  });

  it('update() changes a single field', () => {
    useStairStore.getState().update({ totalHeight: 3000 });
    expect(useStairStore.getState().config.totalHeight).toBe(3000);
  });

  it('applyPreset() merges partial into config', () => {
    useStairStore.getState().applyPreset({ stepCount: 20, outerRadius: 900 });
    const c = useStairStore.getState().config;
    expect(c.stepCount).toBe(20);
    expect(c.outerRadius).toBe(900);
    expect(c.totalHeight).toBe(INITIAL_CONFIG.totalHeight);
  });
});
