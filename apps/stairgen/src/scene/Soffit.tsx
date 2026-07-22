import { useMemo } from 'react';
import { useStairStore } from '../store/useStairStore';
import { buildSoffitGeometry } from '../geometry/soffitGeometry';
import { buildMaterial } from '../geometry/materials';

export function Soffit() {
  const cfg = useStairStore((s) => s.config);
  const geom = useMemo(() => buildSoffitGeometry(cfg), [
    cfg.soffitMode, cfg.soffitThickness, cfg.soffitInset, cfg.risersEnabled,
    cfg.totalHeight, cfg.stepCount, cfg.sweepAngle, cfg.outerRadius,
    cfg.columnDiameter, cfg.stepThickness, cfg.direction,
  ]);
  const mat = useMemo(() => buildMaterial(cfg.materials.soffit), [cfg.materials.soffit]);
  if (geom.getAttribute('position') === undefined) return null;
  return <mesh geometry={geom} material={mat} castShadow receiveShadow />;
}
