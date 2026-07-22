import { useMemo } from 'react';
import { buildLandingGeometry } from '@nxgen/stair-geometry';
import { buildStandardMaterial } from '@nxgen/configurator-3d';
import type { StairConfig } from '@nxgen/stair-domain';

export function Landing({ cfg }: { cfg: StairConfig }) {
  const geom = useMemo(() => buildLandingGeometry(cfg), [
    cfg.landingShape, cfg.landingWidth, cfg.landingDepth, cfg.landingThickness,
    cfg.sweepAngle, cfg.outerRadius, cfg.totalHeight, cfg.direction,
  ]);
  const mat = useMemo(() => buildStandardMaterial(cfg.materials.landing), [cfg.materials.landing]);
  return <mesh geometry={geom} material={mat} castShadow receiveShadow />;
}
