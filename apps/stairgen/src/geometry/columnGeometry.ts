import { BufferGeometry, CylinderGeometry, SphereGeometry, ConeGeometry } from 'three';
import { mergeBufferGeometries } from 'three-stdlib';
import type { StairConfig } from '../config/types';

export function buildColumnGeometry(cfg: StairConfig): BufferGeometry {
  if (cfg.columnType === 'none') return new BufferGeometry();

  const r = cfg.columnDiameter / 2;
  const H = cfg.totalHeight;
  const parts: BufferGeometry[] = [];

  if (cfg.columnType === 'solid') {
    const shaft = new CylinderGeometry(r, r, H, 48);
    shaft.translate(0, H / 2, 0);
    parts.push(shaft);
  } else {
    // tube — outer + inner (inverted) gives a hollow cylinder visually
    const outer = new CylinderGeometry(r, r, H, 48, 1, true);
    outer.translate(0, H / 2, 0);
    parts.push(outer);
    const ri = Math.max(r - cfg.columnWallThickness, 1);
    const inner = new CylinderGeometry(ri, ri, H, 48, 1, true);
    inner.translate(0, H / 2, 0);
    inner.scale(-1, 1, 1); // flip normals
    parts.push(inner);
  }

  if (cfg.columnTopCap === 'dome') {
    const d = new SphereGeometry(r, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    d.translate(0, H, 0);
    parts.push(d);
  } else if (cfg.columnTopCap === 'spike') {
    const c = new ConeGeometry(r, r * 2, 32);
    c.translate(0, H + r, 0);
    parts.push(c);
  }

  if (cfg.columnBottomBase === 'flange' || cfg.columnBottomBase === 'plinth') {
    const br = cfg.columnBaseDiameter / 2;
    const bh = cfg.columnBaseHeight;
    const base = new CylinderGeometry(br, br, bh, 48);
    base.translate(0, bh / 2, 0);
    parts.push(base);
  }

  return mergeBufferGeometries(parts, false) ?? new BufferGeometry();
}
