import { useMemo } from 'react';
import { buildBalustradeGeometry } from '@nxgen/stair-geometry';
import { buildStandardMaterial } from '@nxgen/configurator-3d';
import type { StairConfig } from '@nxgen/stair-domain';

export function Balustrade({ cfg }: { cfg: StairConfig }) {
  const geom = useMemo(() => buildBalustradeGeometry(cfg), [
    cfg.railingEnabled, cfg.railingHeight, cfg.railingSide, cfg.fillType,
    cfg.barSpacing, cfg.barDiameter, cfg.barProfile,
    cfg.glassThickness, cfg.cableCount, cfg.cableDiameter,
    cfg.handrailOffsetFromPost, cfg.totalHeight, cfg.stepCount,
    cfg.sweepAngle, cfg.outerRadius, cfg.columnDiameter, cfg.direction,
  ]);
  const bars = useMemo(() => buildStandardMaterial(cfg.materials.bars), [cfg.materials.bars]);
  const glass = useMemo(() => buildStandardMaterial(cfg.materials.glass), [cfg.materials.glass]);
  const material = cfg.fillType === 'glass' || cfg.fillType === 'panels' ? glass : bars;
  return <mesh geometry={geom} material={material} castShadow receiveShadow />;
}
