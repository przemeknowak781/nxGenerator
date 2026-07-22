import { useMemo } from 'react';
import { buildSoffitGeometry } from '@nxgen/stair-geometry';
import { buildStandardMaterial } from '@nxgen/configurator-3d';
import type { StairConfig } from '@nxgen/stair-domain';

export function Soffit({ cfg }: { cfg: StairConfig }) {
  const geom = useMemo(() => buildSoffitGeometry(cfg), [
    cfg.soffitMode, cfg.soffitThickness, cfg.soffitInset, cfg.risersEnabled,
    cfg.totalHeight, cfg.stepCount, cfg.sweepAngle, cfg.outerRadius,
    cfg.columnDiameter, cfg.stepThickness, cfg.direction,
  ]);
  const mat = useMemo(() => buildStandardMaterial(cfg.materials.soffit), [cfg.materials.soffit]);
  if (geom.getAttribute('position') === undefined) return null;
  return <mesh geometry={geom} material={mat} castShadow receiveShadow />;
}
