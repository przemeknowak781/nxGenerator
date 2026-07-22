import { useControls, folder } from 'leva';
import { useStairStore } from '../store/useStairStore';

export function ControlPanel() {
  const cfg = useStairStore.getState().config;
  const update = useStairStore((s) => s.update);

  useControls(() => ({
    Geometria: folder({
      totalHeight:   { value: cfg.totalHeight,   min: 1500, max: 5000, step: 10, onChange: (v: number) => update({ totalHeight: v }) },
      sweepAngle:    { value: cfg.sweepAngle,    min: 90,   max: 720,  step: 5,  onChange: (v: number) => update({ sweepAngle: v }) },
      direction:     { value: cfg.direction,     options: ['CW', 'CCW'] as const, onChange: (v: 'CW' | 'CCW') => update({ direction: v }) },
      outerRadius:   { value: cfg.outerRadius,   min: 500,  max: 1500, step: 10, onChange: (v: number) => update({ outerRadius: v }) },
      walkLineRatio: { value: cfg.walkLineRatio, min: 0.3,  max: 0.8,  step: 0.01, onChange: (v: number) => update({ walkLineRatio: v }) },
    }),
    Stopnie: folder({
      stepCount:        { value: cfg.stepCount, min: 6, max: 40, step: 1, onChange: (v: number) => update({ stepCount: v }) },
      stepThickness:    { value: cfg.stepThickness, min: 20, max: 200, step: 2, onChange: (v: number) => update({ stepThickness: v }) },
      nosingType:       { value: cfg.nosingType, options: ['none', 'square', 'rounded', 'chamfer'] as const, onChange: (v: typeof cfg.nosingType) => update({ nosingType: v }) },
      nosingRadius:     { value: cfg.nosingRadius, min: 0, max: 30, step: 1, onChange: (v: number) => update({ nosingRadius: v }) },
      chamferSize:      { value: cfg.chamferSize, min: 0, max: 20, step: 1, onChange: (v: number) => update({ chamferSize: v }) },
      nosingOvershoot:  { value: cfg.nosingOvershoot, min: 0, max: 50, step: 1, onChange: (v: number) => update({ nosingOvershoot: v }) },
    }),
    Podniebienie: folder({
      soffitMode:      { value: cfg.soffitMode, options: ['stepped', 'smooth_helix', 'offset_slab'] as const, onChange: (v: typeof cfg.soffitMode) => update({ soffitMode: v }) },
      soffitThickness: { value: cfg.soffitThickness, min: 30, max: 400, step: 5, onChange: (v: number) => update({ soffitThickness: v }) },
      soffitInset:     { value: cfg.soffitInset, min: 0, max: 50, step: 1, onChange: (v: number) => update({ soffitInset: v }) },
      risersEnabled:   { value: cfg.risersEnabled, onChange: (v: boolean) => update({ risersEnabled: v }) },
    }),
    'Słup centralny': folder({
      columnType:       { value: cfg.columnType, options: ['solid', 'tube', 'none'] as const, onChange: (v: typeof cfg.columnType) => update({ columnType: v }) },
      columnDiameter:   { value: cfg.columnDiameter, min: 60, max: 400, step: 5, onChange: (v: number) => update({ columnDiameter: v }) },
      columnTopCap:     { value: cfg.columnTopCap, options: ['flat', 'dome', 'spike', 'none'] as const, onChange: (v: typeof cfg.columnTopCap) => update({ columnTopCap: v }) },
      columnBottomBase: { value: cfg.columnBottomBase, options: ['flat', 'flange', 'plinth', 'none'] as const, onChange: (v: typeof cfg.columnBottomBase) => update({ columnBottomBase: v }) },
      columnBaseDiameter: { value: cfg.columnBaseDiameter, min: 100, max: 500, step: 10, onChange: (v: number) => update({ columnBaseDiameter: v }) },
      columnBaseHeight:   { value: cfg.columnBaseHeight, min: 10, max: 100, step: 2, onChange: (v: number) => update({ columnBaseHeight: v }) },
    }),
    Spocznik: folder({
      landingShape:     { value: cfg.landingShape, options: ['none', 'quarter', 'half', 'square'] as const, onChange: (v: 'none' | 'quarter' | 'half' | 'square') => update({ landingShape: v }) },
      landingWidth:     { value: cfg.landingWidth, min: 500, max: 2000, step: 10, onChange: (v: number) => update({ landingWidth: v }) },
      landingDepth:     { value: cfg.landingDepth, min: 500, max: 2000, step: 10, onChange: (v: number) => update({ landingDepth: v }) },
      landingThickness: { value: cfg.landingThickness, min: 20, max: 200, step: 2, onChange: (v: number) => update({ landingThickness: v }) },
    }),
    Balustrada: folder({
      railingEnabled:    { value: cfg.railingEnabled, onChange: (v: boolean) => update({ railingEnabled: v }) },
      railingHeight:     { value: cfg.railingHeight, min: 800, max: 1300, step: 10, onChange: (v: number) => update({ railingHeight: v }) },
      railingSide:       { value: cfg.railingSide, options: ['outer', 'inner', 'both'] as const, onChange: (v: typeof cfg.railingSide) => update({ railingSide: v }) },
      fillType:          { value: cfg.fillType, options: ['vertical_bars', 'horizontal_bars', 'glass', 'cable', 'panels'] as const, onChange: (v: typeof cfg.fillType) => update({ fillType: v }) },
      barSpacing:        { value: cfg.barSpacing, min: 50, max: 300, step: 5, onChange: (v: number) => update({ barSpacing: v }) },
      barDiameter:       { value: cfg.barDiameter, min: 8, max: 40, step: 1, onChange: (v: number) => update({ barDiameter: v }) },
      barProfile:        { value: cfg.barProfile, options: ['round', 'square', 'flat'] as const, onChange: (v: typeof cfg.barProfile) => update({ barProfile: v }) },
      glassThickness:    { value: cfg.glassThickness, min: 8, max: 25, step: 1, onChange: (v: number) => update({ glassThickness: v }) },
      cableCount:        { value: cfg.cableCount, min: 2, max: 12, step: 1, onChange: (v: number) => update({ cableCount: v }) },
      cableDiameter:     { value: cfg.cableDiameter, min: 3, max: 12, step: 1, onChange: (v: number) => update({ cableDiameter: v }) },
      handrailProfile:   { value: cfg.handrailProfile, options: ['round', 'oval', 'rectangular', 'flat'] as const, onChange: (v: typeof cfg.handrailProfile) => update({ handrailProfile: v }) },
      handrailDiameter:  { value: cfg.handrailDiameter, min: 20, max: 80, step: 1, onChange: (v: number) => update({ handrailDiameter: v }) },
      handrailOffsetFromPost: { value: cfg.handrailOffsetFromPost, min: 20, max: 150, step: 5, onChange: (v: number) => update({ handrailOffsetFromPost: v }) },
    }),
    Materiały: folder({
      'stopnie kolor':   { value: cfg.materials.step.baseColor, onChange: (v: string) => update({ materials: { ...useStairStore.getState().config.materials, step: { ...useStairStore.getState().config.materials.step, baseColor: v } } }) },
      'stopnie szorstkość': { value: cfg.materials.step.roughness, min: 0, max: 1, step: 0.01, onChange: (v: number) => update({ materials: { ...useStairStore.getState().config.materials, step: { ...useStairStore.getState().config.materials.step, roughness: v } } }) },
      'podniebienie kolor': { value: cfg.materials.soffit.baseColor, onChange: (v: string) => update({ materials: { ...useStairStore.getState().config.materials, soffit: { ...useStairStore.getState().config.materials.soffit, baseColor: v } } }) },
      'słup kolor':      { value: cfg.materials.column.baseColor, onChange: (v: string) => update({ materials: { ...useStairStore.getState().config.materials, column: { ...useStairStore.getState().config.materials.column, baseColor: v } } }) },
      'tralki kolor':    { value: cfg.materials.bars.baseColor, onChange: (v: string) => update({ materials: { ...useStairStore.getState().config.materials, bars: { ...useStairStore.getState().config.materials.bars, baseColor: v } } }) },
      'pochwyt kolor':   { value: cfg.materials.handrail.baseColor, onChange: (v: string) => update({ materials: { ...useStairStore.getState().config.materials, handrail: { ...useStairStore.getState().config.materials.handrail, baseColor: v } } }) },
    }),
    Scena: folder({
      envPreset:       { value: cfg.envPreset, options: ['studio', 'showroom', 'interior_warm', 'interior_cool', 'dusk'] as const, onChange: (v: typeof cfg.envPreset) => update({ envPreset: v }) },
      envIntensity:    { value: cfg.envIntensity, min: 0, max: 3, step: 0.05, onChange: (v: number) => update({ envIntensity: v }) },
      backgroundMode:  { value: cfg.backgroundMode, options: ['solid', 'gradient', 'hdri_visible', 'transparent'] as const, onChange: (v: typeof cfg.backgroundMode) => update({ backgroundMode: v }) },
      backgroundColor: { value: cfg.backgroundColor, onChange: (v: string) => update({ backgroundColor: v }) },
      shadowsEnabled:  { value: cfg.shadowsEnabled, onChange: (v: boolean) => update({ shadowsEnabled: v }) },
      shadowSoftness:  { value: cfg.shadowSoftness, min: 0, max: 2, step: 0.05, onChange: (v: number) => update({ shadowSoftness: v }) },
      cameraPreset:    { value: cfg.cameraPreset, options: ['hero', 'top', 'elevation', 'detail_nosing', 'underside'] as const, onChange: (v: typeof cfg.cameraPreset) => update({ cameraPreset: v }) },
    }),
    Zgodność: folder({
      buildingType:          { value: cfg.buildingType, options: ['residential', 'public', 'auxiliary'] as const, onChange: (v: typeof cfg.buildingType) => update({ buildingType: v }) },
      showValidationOverlay: { value: cfg.showValidationOverlay, onChange: (v: boolean) => update({ showValidationOverlay: v }) },
    }),
    Export: folder({
      exportIncludeMaterials: { value: cfg.exportIncludeMaterials, onChange: (v: boolean) => update({ exportIncludeMaterials: v }) },
      exportIncludeMetadata:  { value: cfg.exportIncludeMetadata, onChange: (v: boolean) => update({ exportIncludeMetadata: v }) },
    }),
  }));

  return null;
}
