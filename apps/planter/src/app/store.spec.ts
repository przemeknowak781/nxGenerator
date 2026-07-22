import { describe, it, expect, beforeEach } from 'vitest';
import { usePlanterStore, applyPlanterPreset } from './store';
import { DEFAULT_CONFIG } from '@nxgen/planter-domain';

describe('Planter store', () => {
  beforeEach(() => usePlanterStore.getState().reset());

  it('boots on the default config', () => {
    expect(usePlanterStore.getState().config).toEqual(DEFAULT_CONFIG);
  });

  it('update() patches a field', () => {
    usePlanterStore.getState().update({ height: 1234 });
    expect(usePlanterStore.getState().config.height).toBe(1234);
  });

  it('applyPreset merges a preset', () => {
    applyPlanterPreset('wysoka_modrzew');
    expect(usePlanterStore.getState().config.height).toBeGreaterThan(DEFAULT_CONFIG.height);
  });
});
