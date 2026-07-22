import { BufferGeometry, Float32BufferAttribute } from 'three';
import type { StairConfig } from '../config/types';
import { computeMetrics } from '../config/metrics';

export function buildSoffitGeometry(cfg: StairConfig): BufferGeometry {
  if (cfg.soffitMode === 'stepped') return buildStepped(cfg);
  if (cfg.soffitMode === 'smooth_helix') return buildSmoothHelix(cfg, cfg.soffitThickness);
  return buildSmoothHelix(cfg, cfg.soffitThickness + cfg.stepThickness);
}

function buildStepped(cfg: StairConfig): BufferGeometry {
  if (!cfg.risersEnabled) return new BufferGeometry();
  const { riseHeight, stepAngle, columnRadius } = computeMetrics(cfg);
  const rIn = columnRadius;
  const rOut = cfg.outerRadius;
  const sign = cfg.direction === 'CW' ? 1 : -1;

  const positions: number[] = [];
  const indices: number[] = [];

  for (let k = 1; k < cfg.stepCount; k++) {
    const a = sign * (k * stepAngle) * Math.PI / 180;
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    const yTop = k * riseHeight;
    const yBot = yTop - riseHeight;
    const base = positions.length / 3;
    positions.push(rIn * cos, yTop, rIn * sin);
    positions.push(rOut * cos, yTop, rOut * sin);
    positions.push(rIn * cos, yBot, rIn * sin);
    positions.push(rOut * cos, yBot, rOut * sin);
    // Riser faces outward (-tangent direction, i.e., away from next step).
    // Winding depends on helix direction; flip for sign === 1 so normal
    // consistently points outward from the step stack (into the open space).
    if (sign === -1) {
      indices.push(base, base + 3, base + 1, base, base + 2, base + 3);
    } else {
      indices.push(base, base + 1, base + 3, base, base + 3, base + 2);
    }
  }

  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(positions, 3));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}

function buildSmoothHelix(cfg: StairConfig, thickness: number): BufferGeometry {
  const { columnRadius } = computeMetrics(cfg);
  const N = Math.max(cfg.stepCount * 8, 128);
  const sweepRad = cfg.sweepAngle * Math.PI / 180;
  const sign = cfg.direction === 'CW' ? 1 : -1;
  const rIn = columnRadius + cfg.soffitInset;
  const rOut = cfg.outerRadius;
  const t = thickness;
  const H = cfg.totalHeight;

  const positions: number[] = [];
  const indices: number[] = [];

  // Each angular step emits 8 vertices (4 corners × 2 duplicates for hard edges
  // between shell faces and side walls). Stride = 8. Indices per ring:
  //   0: iT_shell, 1: oT_shell, 2: iB_shell, 3: oB_shell
  //   4: iT_wall,  5: oT_wall,  6: iB_wall,  7: oB_wall
  const ring = (ix: number) => {
    const b = ix * 8;
    return {
      iT_s: b,     oT_s: b + 1, iB_s: b + 2, oB_s: b + 3,
      iT_w: b + 4, oT_w: b + 5, iB_w: b + 6, oB_w: b + 7,
    };
  };

  for (let i = 0; i <= N; i++) {
    const a = sign * (i / N) * sweepRad;
    const y = (i / N) * H;
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    const xIn = rIn * cos;
    const zIn = rIn * sin;
    const xOut = rOut * cos;
    const zOut = rOut * sin;
    // shell group
    positions.push(xIn,  y,     zIn);
    positions.push(xOut, y,     zOut);
    positions.push(xIn,  y - t, zIn);
    positions.push(xOut, y - t, zOut);
    // wall group — same positions, distinct indices so normals don't average across hard edges
    positions.push(xIn,  y,     zIn);
    positions.push(xOut, y,     zOut);
    positions.push(xIn,  y - t, zIn);
    positions.push(xOut, y - t, zOut);
  }

  // Winding conventions are written for sign = -1 (CCW helix viewed from +Y).
  // For sign = +1 (CW), every triangle must be reversed so normals still face
  // the intended outward direction.
  const invert = sign === 1;
  const tri = invert
    ? (a: number, b: number, c: number) => { indices.push(a, c, b); }
    : (a: number, b: number, c: number) => { indices.push(a, b, c); };

  for (let i = 0; i < N; i++) {
    const A = ring(i);
    const B = ring(i + 1);
    // Top shell (normal +Y): CCW from +Y view
    tri(A.iT_s, A.oT_s, B.oT_s);
    tri(A.iT_s, B.oT_s, B.iT_s);
    // Bottom shell (normal -Y): reverse relative to top
    tri(A.iB_s, B.oB_s, A.oB_s);
    tri(A.iB_s, B.iB_s, B.oB_s);
    // Outer side (normal +radial)
    tri(A.oT_w, A.oB_w, B.oB_w);
    tri(A.oT_w, B.oB_w, B.oT_w);
    // Inner side (normal -radial): reverse relative to outer
    tri(A.iT_w, B.iB_w, A.iB_w);
    tri(A.iT_w, B.iT_w, B.iB_w);
  }

  // End caps — close the ribbon at i=0 and i=N
  const s0 = ring(0);
  const sN = ring(N);
  tri(s0.iT_w, s0.iB_w, s0.oB_w);
  tri(s0.iT_w, s0.oB_w, s0.oT_w);
  tri(sN.iT_w, sN.oB_w, sN.iB_w);
  tri(sN.iT_w, sN.oT_w, sN.oB_w);

  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(positions, 3));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}
