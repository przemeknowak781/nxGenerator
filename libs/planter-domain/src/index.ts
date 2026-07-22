import {
  runRules,
  type Rule,
  type Issue,
  type PresetRef,
} from '@nxgen/configurator-core';

/** Parametric configuration for the Planter configurator. */
export interface PlanterConfig {
  width: number;
  depth: number;
  height: number;
  color: string;
  roughness: number;
  metallic: number;
}

export const DEFAULT_CONFIG: PlanterConfig = {
  width: 600,
  depth: 600,
  height: 900,
  color: '#b2542b',
  roughness: 0.5,
  metallic: 0,
};

export const PRESET_REFS: PresetRef[] = [
  { id: 'default', label: 'Domyślny' },
  { id: 'tall', label: 'Wysoki' },
];

/** Apply a preset by id. Extend this as the product grows. */
export function applyPreset(base: PlanterConfig, id: string): PlanterConfig {
  if (id === 'tall') return { ...base, height: 1600, width: 400, depth: 400 };
  return { ...DEFAULT_CONFIG };
}

const rules: Rule<PlanterConfig>[] = [
  (c) =>
    c.height > 2400
      ? {
          id: 'too-tall',
          rule: 'max-height',
          severity: 'warn',
          field: 'height',
          message: `Wysokość ${c.height} mm > 2400 mm.`,
        }
      : null,
  (c) =>
    Math.min(c.width, c.depth) < 100
      ? {
          id: 'too-narrow',
          rule: 'min-footprint',
          severity: 'error',
          field: 'width',
          message: 'Podstawa < 100 mm.',
        }
      : null,
];

/** Validate the configuration against the product rules. */
export function validate(c: PlanterConfig): Issue[] {
  return runRules(c, rules);
}
