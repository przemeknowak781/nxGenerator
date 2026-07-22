import { describe, it, expect } from 'vitest';
import { buildColumnGeometry } from './columnGeometry';
import { DEFAULT_CONFIG } from '../config/defaults';

describe('buildColumnGeometry', () => {
  it('solid column spans 0..totalHeight + base/cap', () => {
    const g = buildColumnGeometry(DEFAULT_CONFIG);
    g.computeBoundingBox();
    expect(g.boundingBox!.max.y).toBeGreaterThanOrEqual(DEFAULT_CONFIG.totalHeight - 1);
  });

  it('columnType none returns empty geometry', () => {
    const g = buildColumnGeometry({ ...DEFAULT_CONFIG, columnType: 'none' });
    expect(g.getAttribute('position')?.count ?? 0).toBe(0);
  });

  it('dome top adds vertices vs flat top', () => {
    const flat = buildColumnGeometry({ ...DEFAULT_CONFIG, columnTopCap: 'flat' });
    const dome = buildColumnGeometry({ ...DEFAULT_CONFIG, columnTopCap: 'dome' });
    expect(dome.getAttribute('position').count).toBeGreaterThan(flat.getAttribute('position').count);
  });
});
