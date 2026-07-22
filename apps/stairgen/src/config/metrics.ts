import type { StairConfig, ComputedMetrics } from './types';

export function computeMetrics(c: StairConfig): ComputedMetrics {
  const riseHeight = c.totalHeight / c.stepCount;
  const stepAngle = c.sweepAngle / c.stepCount;
  const columnRadius = c.columnDiameter / 2;
  const effectiveWidth = c.outerRadius - columnRadius;
  const walklineRadius = columnRadius + effectiveWidth * c.walkLineRatio;
  const walklineDepth = walklineRadius * (stepAngle * Math.PI / 180);
  const blondel = 2 * riseHeight + walklineDepth;
  return { riseHeight, walklineDepth, effectiveWidth, blondel, stepAngle, columnRadius };
}
