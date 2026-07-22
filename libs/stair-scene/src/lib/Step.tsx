import { useMemo } from 'react';
import { buildStepGeometry } from '@nxgen/stair-geometry';
import { buildStandardMaterial } from '@nxgen/configurator-3d';
import type { StairConfig } from '@nxgen/stair-domain';

export function Step({ cfg, k }: { cfg: StairConfig; k: number }) {
  const geom = useMemo(() => buildStepGeometry(cfg, k), [
    cfg.totalHeight, cfg.stepCount, cfg.sweepAngle, cfg.outerRadius, cfg.columnDiameter,
    cfg.stepThickness, cfg.nosingType, cfg.nosingRadius, cfg.chamferSize, cfg.nosingOvershoot,
    cfg.direction, cfg.walkLineRatio, k,
  ]);
  const mat = useMemo(() => buildStandardMaterial(cfg.materials.step), [cfg.materials.step]);
  return <mesh geometry={geom} material={mat} castShadow receiveShadow />;
}
