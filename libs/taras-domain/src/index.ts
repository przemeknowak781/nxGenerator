import { runRules, type Rule, type Issue, type PresetRef } from '@nxgen/configurator-core';

/** Parametric configuration for the wooden-deck (taras) configurator. All mm. */
export interface TarasConfig {
  deckWidth: number; // across the boards (X)
  deckLength: number; // along the boards (Z)
  /** Elevation of the walking surface (top of boards) above ground. */
  deckHeight: number;

  boardWidth: number;
  boardThickness: number;
  boardGap: number; // gap between boards

  joistSpacing: number; // centre-to-centre spacing of joists
  joistHeight: number;
  beamHeight: number; // bearer beams (podwaliny) that carry the joists onto the posts

  railingEnabled: boolean;
  railingHeight: number;

  color: string;
  roughness: number;
  metallic: number;
}

export const DEFAULT_CONFIG: TarasConfig = {
  deckWidth: 4000,
  deckLength: 3000,
  deckHeight: 450,
  boardWidth: 120,
  boardThickness: 28,
  boardGap: 5,
  joistSpacing: 500,
  joistHeight: 140,
  beamHeight: 120,
  railingEnabled: true,
  railingHeight: 1000,
  color: '#a9784b',
  roughness: 0.72,
  metallic: 0,
};

interface TarasPreset extends PresetRef {
  patch: Partial<TarasConfig>;
}

const PRESETS: TarasPreset[] = [
  {
    id: 'naziemny_sosna',
    label: 'Naziemny · sosna',
    // Lowest build: shallow joists and bearers so the whole structure fits.
    patch: { deckHeight: 300, boardWidth: 120, boardThickness: 25, joistSpacing: 450, joistHeight: 90, beamHeight: 90, railingEnabled: false, color: '#c8a06a' },
  },
  {
    id: 'wyniesiony_modrzew',
    label: 'Wyniesiony · modrzew',
    patch: { deckHeight: 900, boardWidth: 140, boardThickness: 32, joistSpacing: 500, joistHeight: 180, beamHeight: 160, railingEnabled: true, railingHeight: 1100, color: '#8a5a34' },
  },
  {
    id: 'egzotyczny_bangkirai',
    label: 'Egzotyczny · bangkirai',
    patch: { deckHeight: 400, boardWidth: 90, boardThickness: 25, boardGap: 4, joistSpacing: 400, joistHeight: 120, beamHeight: 120, color: '#6b4a2f' },
  },
];

export const PRESET_REFS: PresetRef[] = PRESETS.map(({ id, label }) => ({ id, label }));

export function applyPreset(base: TarasConfig, id: string): TarasConfig {
  const preset = PRESETS.find((p) => p.id === id);
  return preset ? { ...base, ...preset.patch } : { ...DEFAULT_CONFIG };
}

export interface TarasSummary {
  boards: number;
  joists: number;
  areaM2: number;
}

/** Derived quantities used by the geometry, the status bar and the validator. */
export function computeSummary(c: TarasConfig): TarasSummary {
  const pitch = c.boardWidth + c.boardGap;
  const boards = Math.max(1, Math.floor((c.deckWidth + c.boardGap) / pitch));
  const joists = Math.max(2, Math.floor(c.deckLength / c.joistSpacing) + 1);
  const areaM2 = (c.deckWidth * c.deckLength) / 1_000_000;
  return { boards, joists, areaM2 };
}

const rules: Rule<TarasConfig>[] = [
  // The structural build-up (board + joist + bearer beam) must fit above ground
  // within the declared surface elevation — otherwise the frame ends up below grade.
  (c) => {
    const buildUp = c.boardThickness + c.joistHeight + c.beamHeight;
    return c.deckHeight < buildUp
      ? {
          id: 'structure_height',
          rule: 'structure_fits_height',
          severity: 'error',
          field: 'deckHeight',
          message: `Konstrukcja (deska ${c.boardThickness} + legar ${c.joistHeight} + podwalina ${c.beamHeight} = ${buildUp} mm) nie mieści się w wysokości tarasu ${c.deckHeight} mm.`,
        }
      : null;
  },
  // Safety: a deck railing should be at least 900 mm high.
  (c) =>
    c.railingEnabled && c.railingHeight < 900
      ? {
          id: 'railing_height',
          rule: 'railing_height_min',
          severity: 'warn',
          field: 'railingHeight',
          message: `Balustrada ${c.railingHeight} mm < 900 mm — zbyt niska dla bezpieczeństwa.`,
        }
      : null,
  // Deflection: joist spacing must stay proportional to board thickness.
  (c) => {
    const maxSpacing = c.boardThickness * 20;
    return c.joistSpacing > maxSpacing
      ? {
          id: 'joist_spacing',
          rule: 'joist_spacing_max',
          severity: 'error',
          field: 'joistSpacing',
          message: `Rozstaw legarów ${c.joistSpacing} mm > ${maxSpacing} mm dla deski ${c.boardThickness} mm (ugięcie).`,
        }
      : null;
  },
  // Drainage / thermal movement: board gap should sit in 3–8 mm.
  (c) =>
    c.boardGap < 3 || c.boardGap > 8
      ? {
          id: 'board_gap',
          rule: 'board_gap_range',
          severity: 'warn',
          field: 'boardGap',
          message: `Szczelina ${c.boardGap} mm poza zakresem 3–8 mm (odwodnienie / rozszerzalność).`,
        }
      : null,
  // Wide boards cup over time.
  (c) =>
    c.boardWidth > 145
      ? {
          id: 'board_width',
          rule: 'board_width_cupping',
          severity: 'warn',
          field: 'boardWidth',
          message: `Deska ${c.boardWidth} mm — szerokie deski są podatne na miskowanie (cupping).`,
        }
      : null,
];

export function validate(c: TarasConfig): Issue[] {
  return runRules(c, rules);
}
