import { MeshStandardMaterial, Color } from 'three';

/**
 * Minimal, product-agnostic description of a PBR surface. Any configurator's
 * per-element material config is expected to be assignable to this shape.
 */
export interface SurfaceConfig {
  /** Optional preset name; `'custom'` unlocks the glass heuristic below. */
  preset?: string;
  baseColor: string;
  roughness: number;
  metallic: number;
}

/**
 * Build a `MeshStandardMaterial` from a {@link SurfaceConfig}. A `custom` preset
 * with a pale blue-ish base colour (`#e8…`) is treated as glass — transparent
 * and low-roughness — so glass balustrades/panels render correctly without the
 * caller special-casing them.
 */
export function buildStandardMaterial(cfg: SurfaceConfig): MeshStandardMaterial {
  const mat = new MeshStandardMaterial({
    color: new Color(cfg.baseColor),
    roughness: cfg.roughness,
    metalness: cfg.metallic,
  });
  if (cfg.preset === 'custom' && cfg.baseColor.toLowerCase().startsWith('#e8')) {
    mat.transparent = true;
    mat.opacity = 0.35;
    mat.roughness = Math.min(cfg.roughness, 0.1);
  }
  return mat;
}
