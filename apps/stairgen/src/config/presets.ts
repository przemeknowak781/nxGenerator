import type { StairConfig, MaterialConfig } from './types';

type MaterialsPatch = Partial<StairConfig['materials']>;

interface PresetDef {
  id: string;
  label: string;
  patch: Partial<Omit<StairConfig, 'materials'>>;
  materials: MaterialsPatch;
}

const m = (
  preset: MaterialConfig['preset'],
  baseColor: string,
  roughness: number,
  metallic: number,
): MaterialConfig => ({ preset, baseColor, roughness, metallic, textureScale: 1 });

export const PRESET_LIST: PresetDef[] = [
  {
    id: 'mieszkanie_beton_140',
    label: 'Mieszkanie · beton Ø140',
    patch: {
      totalHeight: 2900, sweepAngle: 360, outerRadius: 900, columnDiameter: 140,
      soffitMode: 'smooth_helix', soffitThickness: 120, stepThickness: 40,
      nosingType: 'chamfer', chamferSize: 4,
      fillType: 'glass', glassThickness: 12,
      handrailProfile: 'round', handrailDiameter: 42,
      buildingType: 'residential',
    },
    materials: {
      step:     m('concrete_anthracite', '#3a3d42', 0.85, 0),
      soffit:   m('concrete_anthracite', '#3a3d42', 0.85, 0),
      column:   m('steel_black',         '#1a1a1a', 0.4,  1),
      handrail: m('steel_inox',          '#c8c8c8', 0.3,  1),
      bars:     m('steel_inox',          '#c8c8c8', 0.3,  1),
    },
  },
  {
    id: 'mieszkanie_drewno_160',
    label: 'Mieszkanie · drewno Ø160',
    patch: {
      totalHeight: 2900, sweepAngle: 360, outerRadius: 900, columnDiameter: 160,
      soffitMode: 'offset_slab', soffitThickness: 80, stepThickness: 50,
      nosingType: 'rounded', nosingRadius: 10,
      fillType: 'vertical_bars', barProfile: 'round', barDiameter: 16, barSpacing: 100,
      handrailProfile: 'oval', handrailDiameter: 50,
    },
    materials: {
      step:     m('oak_natural', '#b68654', 0.55, 0),
      soffit:   m('oak_natural', '#a9794a', 0.6,  0),
      column:   m('oak_natural', '#8a5e36', 0.65, 0),
      landing:  m('oak_natural', '#b68654', 0.55, 0),
      handrail: m('oak_natural', '#b68654', 0.55, 0),
      bars:     m('steel_black', '#2a2a2a', 0.4,  1),
    },
  },
  {
    id: 'loft_metal_120',
    label: 'Loft · metal Ø120',
    patch: {
      totalHeight: 3000, sweepAngle: 450, outerRadius: 800, columnDiameter: 120,
      soffitMode: 'stepped', risersEnabled: true, stepThickness: 30,
      nosingType: 'square',
      fillType: 'cable', cableCount: 6, cableDiameter: 6,
      handrailProfile: 'round', handrailDiameter: 30,
    },
    materials: {
      step:     m('steel_black', '#1a1a1a', 0.4,  1),
      soffit:   m('steel_black', '#1a1a1a', 0.4,  1),
      column:   m('steel_black', '#1a1a1a', 0.4,  1),
      landing:  m('steel_black', '#1a1a1a', 0.4,  1),
      handrail: m('steel_black', '#222222', 0.35, 1),
      bars:     m('steel_inox',  '#cccccc', 0.3,  1),
    },
  },
  {
    id: 'publiczny_beton_180',
    label: 'Publiczny · beton Ø180',
    patch: {
      totalHeight: 3200, sweepAngle: 450, outerRadius: 1300, columnDiameter: 180,
      soffitMode: 'smooth_helix', soffitThickness: 150, stepThickness: 50,
      nosingType: 'chamfer', chamferSize: 6,
      fillType: 'vertical_bars', barDiameter: 20, barSpacing: 110,
      railingHeight: 1100, railingSide: 'both',
      buildingType: 'public',
    },
    materials: {
      step:     m('concrete_grey', '#a8a8a8', 0.9, 0),
      soffit:   m('concrete_grey', '#a8a8a8', 0.9, 0),
      column:   m('concrete_grey', '#8e8e8e', 0.9, 0),
      bars:     m('steel_inox',    '#c0c0c0', 0.3, 1),
      handrail: m('steel_inox',    '#c8c8c8', 0.3, 1),
    },
  },
  {
    id: 'premium_marmur_150',
    label: 'Premium · marmur Ø150',
    patch: {
      totalHeight: 2900, sweepAngle: 360, outerRadius: 1000, columnDiameter: 150,
      soffitMode: 'smooth_helix', soffitThickness: 100, stepThickness: 45,
      nosingType: 'rounded', nosingRadius: 8,
      fillType: 'glass', glassThickness: 12,
      handrailProfile: 'round', handrailDiameter: 44,
      envPreset: 'showroom',
    },
    materials: {
      step:     m('marble_white', '#ede8df', 0.25, 0),
      soffit:   m('marble_white', '#ede8df', 0.25, 0),
      column:   m('marble_white', '#d8d3ca', 0.3,  0),
      landing:  m('marble_white', '#ede8df', 0.25, 0),
      handrail: m('brass',        '#b08d3e', 0.3,  1),
      bars:     m('brass',        '#b08d3e', 0.3,  1),
    },
  },
];

export const PRESETS: Record<string, PresetDef> = Object.fromEntries(PRESET_LIST.map((p) => [p.id, p]));

export function applyPreset(base: StairConfig, id: string): StairConfig {
  const preset = PRESETS[id];
  if (!preset) return base;
  return {
    ...base,
    ...preset.patch,
    materials: { ...base.materials, ...preset.materials },
  };
}
