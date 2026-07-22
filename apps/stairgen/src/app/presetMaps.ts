import type { CameraPreset, EnvPreset } from '@nxgen/stair-domain';
import type { EnvironmentPreset } from '@nxgen/configurator-3d';

/** Camera framings mapped to world positions (target is the stair mid-height). */
export const CAMERA_POSITIONS: Record<CameraPreset, [number, number, number]> = {
  hero:          [3200, 1800, 3200],
  top:           [0,    5000, 0.1],
  elevation:     [4500, 1500, 0],
  detail_nosing: [1400, 800,  1400],
  underside:     [2000, 200,  2000],
};

/** Stair environment presets mapped onto drei's built-in HDRI presets. */
export const ENV_PRESET_MAP: Record<EnvPreset, EnvironmentPreset> = {
  studio: 'studio',
  showroom: 'warehouse',
  interior_warm: 'apartment',
  interior_cool: 'lobby',
  dusk: 'sunset',
  hdri_custom: 'studio',
};
