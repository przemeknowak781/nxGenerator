import {
  BufferGeometry, CylinderGeometry, BoxGeometry, Matrix4, Vector3, Quaternion,
} from 'three';
import { mergeBufferGeometries } from 'three-stdlib';
import type { StairConfig } from '../config/types';
import { computeMetrics } from '../config/metrics';

export function buildBalustradeGeometry(cfg: StairConfig): BufferGeometry {
  if (!cfg.railingEnabled) return new BufferGeometry();
  switch (cfg.fillType) {
    case 'vertical_bars':   return buildVerticalBars(cfg);
    case 'horizontal_bars': return buildHorizontalBars(cfg);
    case 'glass':           return buildGlassPanels(cfg);
    case 'cable':           return buildCables(cfg);
    case 'panels':          return buildGlassPanels(cfg); // same shape, different material
  }
}

function railSides(cfg: StairConfig): Array<'outer' | 'inner'> {
  return cfg.railingSide === 'both' ? ['outer', 'inner'] : [cfg.railingSide];
}

function railRadius(cfg: StairConfig, side: 'outer' | 'inner'): number {
  const { columnRadius } = computeMetrics(cfg);
  return side === 'outer'
    ? cfg.outerRadius - cfg.handrailOffsetFromPost
    : columnRadius + cfg.handrailOffsetFromPost;
}

function buildVerticalBars(cfg: StairConfig): BufferGeometry {
  const { riseHeight, stepAngle } = computeMetrics(cfg);
  const sign = cfg.direction === 'CW' ? 1 : -1;
  const parts: BufferGeometry[] = [];

  // Handrail centerline follows the helix y(t) = t*H + (railingHeight + riseHeight),
  // where t = angle / sweepAngle. Bars must span from step-top (bottom) to that
  // centerline (top) so they physically meet both step and handrail at every angle.
  for (const side of railSides(cfg)) {
    const r = railRadius(cfg, side);
    for (let k = 0; k < cfg.stepCount; k++) {
      for (const aDeg of [k * stepAngle, (k + 0.5) * stepAngle]) {
        const a = sign * aDeg * Math.PI / 180;
        const x = r * Math.cos(a);
        const z = r * Math.sin(a);
        const yBottom = (k + 1) * riseHeight; // top surface of step k
        const tFrac = aDeg / cfg.sweepAngle;
        const yTop = tFrac * cfg.totalHeight + cfg.railingHeight + riseHeight;
        const h = yTop - yBottom;
        if (h <= 0) continue;
        let geom: BufferGeometry;
        if (cfg.barProfile === 'round') {
          geom = new CylinderGeometry(cfg.barDiameter / 2, cfg.barDiameter / 2, h, 12);
        } else if (cfg.barProfile === 'flat') {
          geom = new BoxGeometry(cfg.barDiameter * 0.3, h, cfg.barDiameter);
        } else {
          geom = new BoxGeometry(cfg.barDiameter, h, cfg.barDiameter);
        }
        geom.translate(x, yBottom + h / 2, z);
        parts.push(geom);
      }
    }
  }
  return parts.length ? (mergeBufferGeometries(parts, false) ?? new BufferGeometry()) : new BufferGeometry();
}

function buildHorizontalBars(cfg: StairConfig): BufferGeometry {
  // Similar to cables but thicker, typically 3 horizontal tubes
  return buildCables({ ...cfg, cableCount: 3, cableDiameter: cfg.barDiameter });
}

function buildGlassPanels(cfg: StairConfig): BufferGeometry {
  const { riseHeight, stepAngle } = computeMetrics(cfg);
  const sign = cfg.direction === 'CW' ? 1 : -1;
  const parts: BufferGeometry[] = [];

  for (const side of railSides(cfg)) {
    const r = railRadius(cfg, side);
    for (let k = 0; k < cfg.stepCount; k++) {
      const a0 = sign * k * stepAngle * Math.PI / 180;
      const a1 = sign * (k + 1) * stepAngle * Math.PI / 180;
      const x0 = r * Math.cos(a0), z0 = r * Math.sin(a0);
      const x1 = r * Math.cos(a1), z1 = r * Math.sin(a1);
      const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
      const chord = Math.hypot(x1 - x0, z1 - z0);
      const yawAngle = Math.atan2(z1 - z0, x1 - x0);
      const yBase = (k + 1) * riseHeight;
      const h = cfg.railingHeight;
      const panel = new BoxGeometry(chord * 0.96, h * 0.9, cfg.glassThickness);
      const m = new Matrix4().makeRotationY(-yawAngle);
      m.setPosition(cx, yBase + h / 2, cz);
      panel.applyMatrix4(m);
      parts.push(panel);
    }
  }
  return parts.length ? (mergeBufferGeometries(parts, false) ?? new BufferGeometry()) : new BufferGeometry();
}

function buildCables(cfg: StairConfig): BufferGeometry {
  const sweepRad = cfg.sweepAngle * Math.PI / 180;
  const sign = cfg.direction === 'CW' ? 1 : -1;
  const N_SEG = 120;
  const parts: BufferGeometry[] = [];
  const { riseHeight } = computeMetrics(cfg);

  for (const side of railSides(cfg)) {
    const r = railRadius(cfg, side);
    for (let i = 0; i < cfg.cableCount; i++) {
      const dh = cfg.railingHeight / (cfg.cableCount + 1);
      const yOffset = dh * (i + 1);
      let prev = helicalPoint(r, cfg.totalHeight, sweepRad, sign, 0, yOffset + riseHeight);
      for (let j = 1; j <= N_SEG; j++) {
        const curr = helicalPoint(r, cfg.totalHeight, sweepRad, sign, j / N_SEG, yOffset + riseHeight);
        parts.push(tubeSegment(prev, curr, cfg.cableDiameter / 2));
        prev = curr;
      }
    }
  }
  return parts.length ? (mergeBufferGeometries(parts, false) ?? new BufferGeometry()) : new BufferGeometry();
}

function helicalPoint(r: number, H: number, sweepRad: number, sign: number, t: number, yBase: number): Vector3 {
  const a = sign * t * sweepRad;
  return new Vector3(r * Math.cos(a), t * H + yBase, r * Math.sin(a));
}

function tubeSegment(p0: Vector3, p1: Vector3, radius: number): BufferGeometry {
  const dir = new Vector3().subVectors(p1, p0);
  const len = dir.length();
  const mid = new Vector3().addVectors(p0, p1).multiplyScalar(0.5);
  const geom = new CylinderGeometry(radius, radius, len, 8);
  const up = new Vector3(0, 1, 0);
  const q = new Quaternion().setFromUnitVectors(up, dir.normalize());
  const m = new Matrix4().makeRotationFromQuaternion(q);
  m.setPosition(mid);
  geom.applyMatrix4(m);
  return geom;
}
