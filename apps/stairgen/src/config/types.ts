export type BuildingType = 'residential' | 'public' | 'auxiliary';
export type Direction = 'CW' | 'CCW';
export type NosingType = 'none' | 'square' | 'rounded' | 'chamfer';
export type TopFinish = 'flat' | 'antislip_grooves' | 'none';
export type SoffitMode = 'stepped' | 'smooth_helix' | 'offset_slab';
export type ColumnType = 'solid' | 'tube' | 'none';
export type ColumnCap = 'flat' | 'dome' | 'spike' | 'none';
export type ColumnBase = 'flat' | 'flange' | 'plinth' | 'none';
export type LandingShape = 'none' | 'quarter' | 'half' | 'square' | 'custom';
export type EdgeProfile = 'square' | 'bullnose' | 'chamfer';
export type RailingSide = 'outer' | 'inner' | 'both';
export type FillType = 'vertical_bars' | 'horizontal_bars' | 'glass' | 'cable' | 'panels';
export type BarProfile = 'round' | 'square' | 'flat';
export type HandrailProfile = 'round' | 'oval' | 'rectangular' | 'flat';
export type MaterialPreset =
  | 'oak_natural' | 'oak_lacquered' | 'walnut'
  | 'concrete_grey' | 'concrete_anthracite'
  | 'marble_white' | 'marble_black'
  | 'steel_black' | 'steel_inox' | 'brass' | 'white_lacquer' | 'custom';
export type EnvPreset = 'studio' | 'showroom' | 'interior_warm' | 'interior_cool' | 'dusk' | 'hdri_custom';
export type BackgroundMode = 'solid' | 'gradient' | 'hdri_visible' | 'transparent';
export type CameraPreset = 'hero' | 'top' | 'elevation' | 'detail_nosing' | 'underside';

export interface MaterialConfig {
  preset: MaterialPreset;
  baseColor: string;
  roughness: number;
  metallic: number;
  textureScale: number;
}

export interface StairConfig {
  totalHeight: number;
  sweepAngle: number;
  direction: Direction;
  outerRadius: number;
  walkLineRatio: number;

  stepCount: number;
  stepCountAuto: boolean;
  stepThickness: number;
  nosingType: NosingType;
  nosingRadius: number;
  chamferSize: number;
  nosingOvershoot: number;
  edgeRoundingTop: number;
  edgeRoundingBottom: number;
  topFinish: TopFinish;

  soffitMode: SoffitMode;
  soffitThickness: number;
  soffitInset: number;
  risersEnabled: boolean;

  columnType: ColumnType;
  columnDiameter: number;
  columnWallThickness: number;
  columnTopCap: ColumnCap;
  columnBottomBase: ColumnBase;
  columnBaseDiameter: number;
  columnBaseHeight: number;

  landingShape: LandingShape;
  landingWidth: number;
  landingDepth: number;
  landingOverhang: number;
  landingThickness: number;
  landingEdgeProfile: EdgeProfile;

  railingEnabled: boolean;
  railingHeight: number;
  railingSide: RailingSide;
  fillType: FillType;
  barSpacing: number;
  barDiameter: number;
  barProfile: BarProfile;
  glassThickness: number;
  cableCount: number;
  cableDiameter: number;
  bottomRailEnabled: boolean;
  bottomRailHeight: number;
  handrailProfile: HandrailProfile;
  handrailDiameter: number;
  handrailOffsetFromPost: number;

  materials: {
    step: MaterialConfig;
    soffit: MaterialConfig;
    column: MaterialConfig;
    bars: MaterialConfig;
    handrail: MaterialConfig;
    landing: MaterialConfig;
    glass: MaterialConfig;
  };

  envPreset: EnvPreset;
  envIntensity: number;
  backgroundMode: BackgroundMode;
  backgroundColor: string;
  shadowsEnabled: boolean;
  shadowSoftness: number;
  cameraPreset: CameraPreset;

  buildingType: BuildingType;
  showValidationOverlay: boolean;

  exportFormat: 'glb' | 'gltf+bin';
  exportIncludeMaterials: boolean;
  exportDraco: boolean;
  exportUnitScale: 'meters' | 'mm';
  exportIncludeMetadata: boolean;
  exportScreenshotPNG: boolean;
}

export type Severity = 'error' | 'warn' | 'info';
export interface Issue {
  id: string;
  severity: Severity;
  field: keyof StairConfig | string;
  message: string;
  rule: string;
}

export interface ComputedMetrics {
  riseHeight: number;
  walklineDepth: number;
  effectiveWidth: number;
  blondel: number;
  stepAngle: number;
  columnRadius: number;
}
