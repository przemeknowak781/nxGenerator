import { runRules, type Rule, type Issue, type PresetRef } from '@nxgen/configurator-core';

/** Parametric configuration for the wooden-planter (donica) configurator. All mm. */
export interface PlanterConfig {
  width: number; // outer footprint X
  depth: number; // outer footprint Z
  height: number; // height of the slatted body
  legHeight: number; // feet under the body

  boardWidth: number; // visible height of one horizontal slat
  boardThickness: number; // wall thickness of a slat
  boardGap: number; // gap between slat courses

  color: string;
  roughness: number;
  metallic: number;
}

export const DEFAULT_CONFIG: PlanterConfig = {
  width: 600,
  depth: 400,
  height: 500,
  legHeight: 120,
  boardWidth: 90,
  boardThickness: 20,
  boardGap: 6,
  color: '#8a5a34',
  roughness: 0.7,
  metallic: 0,
};

interface PlanterPreset extends PresetRef {
  patch: Partial<PlanterConfig>;
}

const PRESETS: PlanterPreset[] = [
  {
    id: 'klasyczna_sosna',
    label: 'Klasyczna · sosna',
    patch: { width: 600, depth: 400, height: 450, legHeight: 100, boardWidth: 90, color: '#c8a06a' },
  },
  {
    id: 'wysoka_modrzew',
    label: 'Wysoka · modrzew',
    // Tall but with a base wide enough to stay clear of the tip-over rule.
    patch: { width: 450, depth: 450, height: 780, legHeight: 120, boardWidth: 100, color: '#8a5a34' },
  },
  {
    id: 'skrzynia_dab',
    label: 'Skrzynia · dąb',
    patch: { width: 1100, depth: 350, height: 350, legHeight: 90, boardWidth: 120, boardThickness: 24, color: '#6b4a2f' },
  },
];

export const PRESET_REFS: PresetRef[] = PRESETS.map(({ id, label }) => ({ id, label }));

export function applyPreset(base: PlanterConfig, id: string): PlanterConfig {
  const preset = PRESETS.find((p) => p.id === id);
  return preset ? { ...base, ...preset.patch } : { ...DEFAULT_CONFIG };
}

export interface PlanterSummary {
  courses: number; // slat courses per face
  boards: number; // total slats across the four faces
  volumeL: number; // usable soil volume, litres
}

/** Derived quantities used by the geometry, the status bar and the validator. */
export function computeSummary(c: PlanterConfig): PlanterSummary {
  const pitch = c.boardWidth + c.boardGap;
  const courses = Math.max(1, Math.floor((c.height + c.boardGap) / pitch));
  const interiorW = Math.max(0, c.width - 2 * c.boardThickness);
  const interiorD = Math.max(0, c.depth - 2 * c.boardThickness);
  const volumeL = (interiorW * interiorD * (c.height * 0.9)) / 1_000_000; // mm³ → L
  return { courses, boards: courses * 4, volumeL };
}

const rules: Rule<PlanterConfig>[] = [
  // Stability: a tall, narrow planter tips over — especially raised on legs.
  (c) => {
    const base = Math.min(c.width, c.depth);
    const top = c.height + c.legHeight;
    return top > base * 2.2
      ? {
          id: 'stability',
          rule: 'tip_over',
          severity: 'warn',
          field: 'height',
          message: `Smukła donica (${top} mm nad podstawą ${base} mm) — ryzyko przewrócenia.`,
        }
      : null;
  },
  // Board gap: drainage / wood movement, but not so wide that soil spills.
  (c) =>
    c.boardGap < 3 || c.boardGap > 10
      ? {
          id: 'board_gap',
          rule: 'board_gap_range',
          severity: 'warn',
          field: 'boardGap',
          message: `Szczelina ${c.boardGap} mm poza zakresem 3–10 mm (odwodnienie / wysypywanie ziemi).`,
        }
      : null,
  // Horticulture: a shallow body limits what can be planted.
  (c) =>
    c.height < 200
      ? {
          id: 'shallow',
          rule: 'min_soil_depth',
          severity: 'info',
          field: 'height',
          message: `Płytka donica (${c.height} mm) — ograniczony dobór roślin (tylko płytko korzeniące).`,
        }
      : null,
];

export function validate(c: PlanterConfig): Issue[] {
  return runRules(c, rules);
}
