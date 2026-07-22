import { useMemo } from 'react';
import { useStairStore } from '../store/useStairStore';
import { buildBalustradeGeometry } from '../geometry/balustradeGeometry';
import { buildMaterial } from '../geometry/materials';

export function Balustrade() {
  const cfg = useStairStore((s) => s.config);
  const geom = useMemo(() => buildBalustradeGeometry(cfg), [
    cfg.railingEnabled, cfg.railingHeight, cfg.railingSide, cfg.fillType,
    cfg.barSpacing, cfg.barDiameter, cfg.barProfile,
    cfg.glassThickness, cfg.cableCount, cfg.cableDiameter,
    cfg.handrailOffsetFromPost, cfg.totalHeight, cfg.stepCount,
    cfg.sweepAngle, cfg.outerRadius, cfg.columnDiameter, cfg.direction,
  ]);
  const bars = useMemo(() => buildMaterial(cfg.materials.bars), [cfg.materials.bars]);
  const glass = useMemo(() => buildMaterial(cfg.materials.glass), [cfg.materials.glass]);
  const material = cfg.fillType === 'glass' || cfg.fillType === 'panels' ? glass : bars;
  return <mesh geometry={geom} material={material} castShadow receiveShadow />;
}
