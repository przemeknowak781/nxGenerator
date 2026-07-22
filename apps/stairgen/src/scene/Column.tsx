import { useMemo } from 'react';
import { useStairStore } from '../store/useStairStore';
import { buildColumnGeometry } from '../geometry/columnGeometry';
import { buildMaterial } from '../geometry/materials';

export function Column() {
  const cfg = useStairStore((s) => s.config);
  const geom = useMemo(() => buildColumnGeometry(cfg), [
    cfg.columnType, cfg.columnDiameter, cfg.columnWallThickness,
    cfg.columnTopCap, cfg.columnBottomBase, cfg.columnBaseDiameter, cfg.columnBaseHeight,
    cfg.totalHeight,
  ]);
  const mat = useMemo(() => buildMaterial(cfg.materials.column), [cfg.materials.column]);
  return <mesh geometry={geom} material={mat} castShadow receiveShadow />;
}
