import { useMemo } from 'react';
import { buildColumnGeometry } from '@nxgen/stair-geometry';
import { buildStandardMaterial } from '@nxgen/configurator-3d';
import type { StairConfig } from '@nxgen/stair-domain';

export function Column({ cfg }: { cfg: StairConfig }) {
  const geom = useMemo(() => buildColumnGeometry(cfg), [
    cfg.columnType, cfg.columnDiameter, cfg.columnWallThickness,
    cfg.columnTopCap, cfg.columnBottomBase, cfg.columnBaseDiameter, cfg.columnBaseHeight,
    cfg.totalHeight,
  ]);
  const mat = useMemo(() => buildStandardMaterial(cfg.materials.column), [cfg.materials.column]);
  // Element disabled → empty geometry; skip the mesh so three.js
  // never computes a NaN bounding sphere and the GLB export stays clean.
  if (!geom.getAttribute('position')?.count) return null;
  return <mesh geometry={geom} material={mat} castShadow receiveShadow />;
}
