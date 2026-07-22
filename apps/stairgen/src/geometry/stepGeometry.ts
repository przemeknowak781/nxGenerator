import { BufferGeometry, Float32BufferAttribute } from 'three';
import type { StairConfig } from '../config/types';
import { computeMetrics } from '../config/metrics';

const ARC_SEGMENTS = 12;
const ROUND_SEGS = 4;

interface ProfilePt { dr: number; dy: number }

function buildOuterProfile(cfg: StairConfig): ProfilePt[] {
  const t = cfg.stepThickness;
  if (cfg.nosingType === 'rounded') {
    const R = Math.min(cfg.nosingRadius, t - 0.1);
    const pts: ProfilePt[] = [];
    for (let i = 0; i <= ROUND_SEGS; i++) {
      const a = (i / ROUND_SEGS) * Math.PI / 2;
      pts.push({ dr: -R + R * Math.sin(a), dy: -R + R * Math.cos(a) });
    }
    pts.push({ dr: 0, dy: -t });
    return pts;
  }
  if (cfg.nosingType === 'chamfer') {
    const C = Math.min(cfg.chamferSize, t - 0.1);
    return [{ dr: -C, dy: 0 }, { dr: 0, dy: -C }, { dr: 0, dy: -t }];
  }
  // square / none
  return [{ dr: 0, dy: 0 }, { dr: 0, dy: -t }];
}

export function buildStepGeometry(cfg: StairConfig, k: number): BufferGeometry {
  const { riseHeight, stepAngle, columnRadius } = computeMetrics(cfg);
  const a0 = (k * stepAngle) * Math.PI / 180;
  const a1 = ((k + 1) * stepAngle) * Math.PI / 180;
  const sign = cfg.direction === 'CW' ? 1 : -1;
  const yTop = (k + 1) * riseHeight;
  const yBot = yTop - cfg.stepThickness;
  const rIn = columnRadius;
  const rOut = cfg.outerRadius + cfg.nosingOvershoot;
  const profile = buildOuterProfile(cfg);

  const positions: number[] = [];
  const indices: number[] = [];
  const innerTopRing: number[] = [];
  const innerBotRing: number[] = [];
  const profileRings: number[][] = profile.map(() => []);

  for (let i = 0; i <= ARC_SEGMENTS; i++) {
    const t = i / ARC_SEGMENTS;
    const a = sign * (a0 + (a1 - a0) * t);
    const cos = Math.cos(a);
    const sin = Math.sin(a);

    innerTopRing.push(positions.length / 3);
    positions.push(rIn * cos, yTop, rIn * sin);
    innerBotRing.push(positions.length / 3);
    positions.push(rIn * cos, yBot, rIn * sin);

    for (let p = 0; p < profile.length; p++) {
      const pt = profile[p]!;
      const r = rOut + pt.dr;
      const y = yTop + pt.dy;
      profileRings[p]!.push(positions.length / 3);
      positions.push(r * cos, y, r * sin);
    }
  }

  const P_LAST = profile.length - 1;

  for (let i = 0; i < ARC_SEGMENTS; i++) {
    const a = i;
    const b = i + 1;

    // Top face: innerTop ↔ first profile point
    const iT_a = innerTopRing[a]!;
    const iT_b = innerTopRing[b]!;
    const p0_a = profileRings[0]![a]!;
    const p0_b = profileRings[0]![b]!;
    indices.push(iT_a, p0_a, p0_b, iT_a, p0_b, iT_b);

    // Bottom face: innerBot ↔ last profile point (reverse winding)
    const iB_a = innerBotRing[a]!;
    const iB_b = innerBotRing[b]!;
    const pL_a = profileRings[P_LAST]![a]!;
    const pL_b = profileRings[P_LAST]![b]!;
    indices.push(iB_a, pL_b, pL_a, iB_a, iB_b, pL_b);

    // Inner wall (reverse winding so normals point inward toward column)
    indices.push(iT_a, iT_b, iB_b, iT_a, iB_b, iB_a);

    // Outer profile strips
    for (let p = 0; p < P_LAST; p++) {
      const q0_a = profileRings[p]![a]!;
      const q0_b = profileRings[p]![b]!;
      const q1_a = profileRings[p + 1]![a]!;
      const q1_b = profileRings[p + 1]![b]!;
      indices.push(q0_a, q1_a, q1_b, q0_a, q1_b, q0_b);
    }
  }

  // Riser front at a0 — fan from innerTop[0]
  for (let p = 0; p < P_LAST; p++) {
    indices.push(innerTopRing[0]!, profileRings[p + 1]![0]!, profileRings[p]![0]!);
  }
  indices.push(innerTopRing[0]!, innerBotRing[0]!, profileRings[P_LAST]![0]!);

  // Back closure at aN — fan reversed
  const N = ARC_SEGMENTS;
  for (let p = 0; p < P_LAST; p++) {
    indices.push(innerTopRing[N]!, profileRings[p]![N]!, profileRings[p + 1]![N]!);
  }
  indices.push(innerTopRing[N]!, profileRings[P_LAST]![N]!, innerBotRing[N]!);

  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(positions, 3));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}
