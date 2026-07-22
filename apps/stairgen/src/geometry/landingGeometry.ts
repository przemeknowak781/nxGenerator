import { BufferGeometry, ExtrudeGeometry, Shape } from 'three';
import type { StairConfig } from '../config/types';

export function buildLandingGeometry(cfg: StairConfig): BufferGeometry {
  if (cfg.landingShape === 'none') return new BufferGeometry();

  const shape = new Shape();

  if (cfg.landingShape === 'square' || cfg.landingShape === 'custom') {
    const w = cfg.landingWidth / 2;
    const d = cfg.landingDepth / 2;
    shape.moveTo(-w, -d);
    shape.lineTo(w, -d);
    shape.lineTo(w, d);
    shape.lineTo(-w, d);
    shape.closePath();
  } else {
    // quarter / half — pie slice starting at top of the run
    const sweep = cfg.landingShape === 'half' ? Math.PI : Math.PI / 2;
    const startAngle = cfg.sweepAngle * Math.PI / 180;
    const sign = cfg.direction === 'CW' ? 1 : -1;
    const r = cfg.outerRadius;
    shape.moveTo(0, 0);
    const segs = 24;
    for (let i = 0; i <= segs; i++) {
      const a = startAngle + sign * (i / segs) * sweep;
      shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    shape.closePath();
  }

  const g = new ExtrudeGeometry(shape, { depth: cfg.landingThickness, bevelEnabled: false });
  g.rotateX(Math.PI / 2);
  g.translate(0, cfg.totalHeight, 0);
  return g;
}
