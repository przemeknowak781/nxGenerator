import { describe, it, expect } from 'vitest';
import { computeMetrics } from './metrics';
import { DEFAULT_CONFIG } from './defaults';

describe('computeMetrics', () => {
  it('computes rise from totalHeight and stepCount', () => {
    const m = computeMetrics({ ...DEFAULT_CONFIG, totalHeight: 2900, stepCount: 16 });
    expect(m.riseHeight).toBeCloseTo(181.25, 2);
  });

  it('computes walkline depth from stepAngle and walkline radius', () => {
    const m = computeMetrics({
      ...DEFAULT_CONFIG,
      totalHeight: 2900, stepCount: 16, sweepAngle: 360,
      outerRadius: 800, columnDiameter: 140, walkLineRatio: 0.5,
    });
    const expectedR = (800 + 70) / 2;
    const expectedAngle = (360 / 16) * Math.PI / 180;
    expect(m.walklineDepth).toBeCloseTo(expectedR * expectedAngle, 2);
  });

  it('computes Blondel as 2*rise + walklineDepth', () => {
    const m = computeMetrics(DEFAULT_CONFIG);
    expect(m.blondel).toBeCloseTo(2 * m.riseHeight + m.walklineDepth, 3);
  });
});
