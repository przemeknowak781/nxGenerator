import { useMemo } from 'react';
import { useStairStore } from '../store/useStairStore';
import { buildRailGeometry } from '../geometry/railGeometry';
import { buildMaterial } from '../geometry/materials';

export function Rail() {
  const cfg = useStairStore((s) => s.config);
  const geom = useMemo(() => buildRailGeometry(cfg), [
    cfg.railingEnabled, cfg.railingHeight, cfg.railingSide,
    cfg.handrailProfile, cfg.handrailDiameter, cfg.handrailOffsetFromPost,
    cfg.totalHeight, cfg.stepCount, cfg.sweepAngle, cfg.outerRadius, cfg.columnDiameter, cfg.direction,
  ]);
  const mat = useMemo(() => buildMaterial(cfg.materials.handrail), [cfg.materials.handrail]);
  return <mesh geometry={geom} material={mat} castShadow />;
}
