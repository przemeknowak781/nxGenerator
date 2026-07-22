import { BufferGeometry, Curve, TubeGeometry, Vector3 } from 'three';
import { mergeBufferGeometries } from 'three-stdlib';
import type { StairConfig } from '../config/types';
import { computeMetrics } from '../config/metrics';

class HelixCurve extends Curve<Vector3> {
  r: number;
  H: number;
  sweepRad: number;
  sign: number;
  yOffset: number;

  constructor(r: number, H: number, sweepRad: number, sign: number, yOffset: number) {
    super();
    this.r = r;
    this.H = H;
    this.sweepRad = sweepRad;
    this.sign = sign;
    this.yOffset = yOffset;
  }

  override getPoint(t: number, target = new Vector3()): Vector3 {
    const a = this.sign * t * this.sweepRad;
    return target.set(
      this.r * Math.cos(a),
      t * this.H + this.yOffset,
      this.r * Math.sin(a),
    );
  }
}

export function buildRailGeometry(cfg: StairConfig): BufferGeometry {
  if (!cfg.railingEnabled) return new BufferGeometry();
  const { riseHeight, columnRadius } = computeMetrics(cfg);
  const tubularSegments = Math.max(cfg.stepCount * 12, 128);
  const radialSegments = cfg.handrailProfile === 'round' || cfg.handrailProfile === 'oval' ? 16 : 4;
  const radius = cfg.handrailDiameter / 2;
  const yOffset = cfg.railingHeight + riseHeight;

  const sides: Array<'outer' | 'inner'> =
    cfg.railingSide === 'both' ? ['outer', 'inner'] : [cfg.railingSide];

  const parts: BufferGeometry[] = sides.map((side) => {
    const r = side === 'outer'
      ? cfg.outerRadius - cfg.handrailOffsetFromPost
      : columnRadius + cfg.handrailOffsetFromPost;
    const curve = new HelixCurve(
      r, cfg.totalHeight, cfg.sweepAngle * Math.PI / 180,
      cfg.direction === 'CW' ? 1 : -1,
      yOffset,
    );
    return new TubeGeometry(curve, tubularSegments, radius, radialSegments, false);
  });

  if (parts.length === 1) return parts[0]!;
  return mergeBufferGeometries(parts, false) ?? parts[0]!;
}
