import { useMemo } from 'react';
import { buildStandardMaterial } from '@nxgen/configurator-3d';
import type { PlanterConfig } from '@nxgen/planter-domain';

export interface PlanterModelProps {
  config: PlanterConfig;
  /** Scene-graph name used by the GLB exporter to find the root. */
  rootName?: string;
}

/**
 * Minimal parametric model for the Planter configurator — a single
 * box driven by the config. Swap the geometry for the real product form.
 */
export function PlanterModel({
  config,
  rootName = 'PlanterRoot',
}: PlanterModelProps) {
  const material = useMemo(
    () =>
      buildStandardMaterial({
        baseColor: config.color,
        roughness: config.roughness,
        metallic: config.metallic,
      }),
    [config.color, config.roughness, config.metallic],
  );

  return (
    <group name={rootName}>
      <mesh
        material={material}
        position={[0, config.height / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[config.width, config.height, config.depth]} />
      </mesh>
    </group>
  );
}
