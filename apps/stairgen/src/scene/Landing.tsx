import { useMemo } from 'react';
import { useStairStore } from '../store/useStairStore';
import { buildLandingGeometry } from '../geometry/landingGeometry';
import { buildMaterial } from '../geometry/materials';

export function Landing() {
  const cfg = useStairStore((s) => s.config);
  const geom = useMemo(() => buildLandingGeometry(cfg), [
    cfg.landingShape, cfg.landingWidth, cfg.landingDepth, cfg.landingThickness,
    cfg.sweepAngle, cfg.outerRadius, cfg.totalHeight, cfg.direction,
  ]);
  const mat = useMemo(() => buildMaterial(cfg.materials.landing), [cfg.materials.landing]);
  return <mesh geometry={geom} material={mat} castShadow receiveShadow />;
}
