import { MeshStandardMaterial, Color } from 'three';
import type { MaterialConfig } from '../config/types';

export function buildMaterial(cfg: MaterialConfig): MeshStandardMaterial {
  const mat = new MeshStandardMaterial({
    color: new Color(cfg.baseColor),
    roughness: cfg.roughness,
    metalness: cfg.metallic,
  });
  if (cfg.preset === 'custom' && cfg.baseColor.toLowerCase().startsWith('#e8')) {
    // glass-ish default
    mat.transparent = true;
    mat.opacity = 0.35;
    mat.roughness = Math.min(cfg.roughness, 0.1);
  }
  return mat;
}
