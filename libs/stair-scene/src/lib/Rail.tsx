import { useMemo } from 'react';
import { buildRailGeometry } from '@nxgen/stair-geometry';
import { buildStandardMaterial } from '@nxgen/configurator-3d';
import type { StairConfig } from '@nxgen/stair-domain';

export function Rail({ cfg }: { cfg: StairConfig }) {
  const geom = useMemo(() => buildRailGeometry(cfg), [
    cfg.railingEnabled, cfg.railingHeight, cfg.railingSide,
    cfg.handrailProfile, cfg.handrailDiameter, cfg.handrailOffsetFromPost,
    cfg.totalHeight, cfg.stepCount, cfg.sweepAngle, cfg.outerRadius, cfg.columnDiameter, cfg.direction,
  ]);
  const mat = useMemo(() => buildStandardMaterial(cfg.materials.handrail), [cfg.materials.handrail]);
  return <mesh geometry={geom} material={mat} castShadow />;
}
