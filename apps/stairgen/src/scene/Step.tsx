import { useMemo } from 'react';
import { useStairStore } from '../store/useStairStore';
import { buildStepGeometry } from '../geometry/stepGeometry';
import { buildMaterial } from '../geometry/materials';

export function Step({ k }: { k: number }) {
  const cfg = useStairStore((s) => s.config);
  const geom = useMemo(() => buildStepGeometry(cfg, k), [
    cfg.totalHeight, cfg.stepCount, cfg.sweepAngle, cfg.outerRadius, cfg.columnDiameter,
    cfg.stepThickness, cfg.nosingType, cfg.nosingRadius, cfg.chamferSize, cfg.nosingOvershoot,
    cfg.direction, cfg.walkLineRatio, k,
  ]);
  const mat = useMemo(() => buildMaterial(cfg.materials.step), [cfg.materials.step]);
  return <mesh geometry={geom} material={mat} castShadow receiveShadow />;
}
