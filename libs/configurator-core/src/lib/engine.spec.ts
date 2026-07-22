import { describe, it, expect } from 'vitest';
import { runRules, countBySeverity, type Rule } from './validation';
import { applyPreset, indexPresets, type Preset } from './preset';
import { createConfiguratorStore } from './store';

interface Demo {
  size: number;
  label: string;
}

describe('validation engine', () => {
  const rules: Rule<Demo>[] = [
    (c) =>
      c.size > 100
        ? { id: 'too-big', rule: 'max-size', severity: 'error', field: 'size', message: 'too big' }
        : null,
    (c) =>
      c.size < 10
        ? { id: 'small', rule: 'min-size', severity: 'warn', field: 'size', message: 'small' }
        : null,
  ];

  it('collects only firing rules', () => {
    expect(runRules({ size: 50, label: 'ok' }, rules)).toHaveLength(0);
    expect(runRules({ size: 200, label: 'x' }, rules).map((i) => i.rule)).toEqual(['max-size']);
  });

  it('countBySeverity tallies issues', () => {
    const issues = runRules({ size: 5, label: 'x' }, rules);
    expect(countBySeverity(issues)).toEqual({ error: 0, warn: 1, info: 0 });
  });
});

describe('presets', () => {
  const presets: Preset<Demo>[] = [
    { id: 'big', label: 'Big', patch: { size: 999 } },
  ];

  it('applyPreset shallow-merges the patch', () => {
    expect(applyPreset({ size: 1, label: 'a' }, presets[0]!)).toEqual({ size: 999, label: 'a' });
  });

  it('indexPresets keys by id', () => {
    expect(indexPresets(presets)['big']?.label).toBe('Big');
  });
});

describe('configurator store', () => {
  it('update patches, setConfig replaces, reset restores', () => {
    const store = createConfiguratorStore<Demo>({ size: 10, label: 'init' });
    store.getState().update({ size: 20 });
    expect(store.getState().config).toEqual({ size: 20, label: 'init' });
    store.getState().setConfig({ size: 30, label: 'new' });
    expect(store.getState().config).toEqual({ size: 30, label: 'new' });
    store.getState().reset();
    expect(store.getState().config).toEqual({ size: 10, label: 'init' });
  });
});
