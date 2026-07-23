import { useMemo } from 'react';
import { BoxGeometry, Color } from 'three';
import { buildStandardMaterial } from '@nxgen/configurator-3d';
import { computeSummary, type PlanterConfig } from '@nxgen/planter-domain';

export interface PlanterModelProps {
  config: PlanterConfig;
  /** Scene-graph name used by the GLB exporter to find the root. */
  rootName?: string;
}

const POST = 40; // corner-post / leg section

/**
 * Parametric wooden planter: four corner posts carrying horizontal slat courses
 * on each face, raised on four legs. The course count comes from the domain's
 * `computeSummary`, so the model and the validator always agree.
 */
export function PlanterModel({ config, rootName = 'PlanterRoot' }: PlanterModelProps) {
  const { width, depth, height, legHeight, boardWidth, boardThickness, boardGap } = config;
  const { courses } = computeSummary(config);

  const slatMat = useMemo(
    () => buildStandardMaterial({ baseColor: config.color, roughness: config.roughness, metallic: config.metallic }),
    [config.color, config.roughness, config.metallic],
  );
  // Posts and legs in a darker shade of the same species.
  const frameMat = useMemo(() => {
    const dark = '#' + new Color(config.color).multiplyScalar(0.55).getHexString();
    return buildStandardMaterial({ baseColor: dark, roughness: 0.8, metallic: 0 });
  }, [config.color]);

  // Slat courses stack up the body from the leg tops.
  const pitch = boardWidth + boardGap;
  const courseYs = useMemo(
    () => Array.from({ length: courses }, (_, i) => legHeight + boardWidth / 2 + i * pitch),
    [courses, legHeight, boardWidth, pitch],
  );

  // Slats butt against the corner posts (span the clear distance BETWEEN them)
  // rather than overlapping them — otherwise the coplanar faces Z-fight.
  const xSlat = useMemo(() => new BoxGeometry(Math.max(width - 2 * POST, 1), boardWidth, boardThickness), [width, boardWidth, boardThickness]);
  const zSlat = useMemo(
    () => new BoxGeometry(boardThickness, boardWidth, Math.max(depth - 2 * POST, 1)),
    [boardThickness, boardWidth, depth],
  );
  const postGeom = useMemo(() => new BoxGeometry(POST, height, POST), [height]);
  const legGeom = useMemo(() => new BoxGeometry(POST, legHeight, POST), [legHeight]);

  const zFace = depth / 2 - boardThickness / 2;
  const xFace = width / 2 - boardThickness / 2;
  const cx = width / 2 - POST / 2;
  const cz = depth / 2 - POST / 2;
  const corners: [number, number][] = [[-cx, -cz], [cx, -cz], [-cx, cz], [cx, cz]];

  return (
    <group name={rootName}>
      {/* corner posts (body) */}
      {corners.map(([x, z], i) => (
        <mesh key={`post${i}`} geometry={postGeom} material={frameMat} position={[x, legHeight + height / 2, z]} castShadow receiveShadow />
      ))}
      {/* legs */}
      {corners.map(([x, z], i) => (
        <mesh key={`leg${i}`} geometry={legGeom} material={frameMat} position={[x, legHeight / 2, z]} castShadow />
      ))}
      {/* slat courses on all four faces */}
      {courseYs.map((y, i) => (
        <group key={`course${i}`}>
          <mesh geometry={xSlat} material={slatMat} position={[0, y, -zFace]} castShadow receiveShadow />
          <mesh geometry={xSlat} material={slatMat} position={[0, y, zFace]} castShadow receiveShadow />
          <mesh geometry={zSlat} material={slatMat} position={[-xFace, y, 0]} castShadow receiveShadow />
          <mesh geometry={zSlat} material={slatMat} position={[xFace, y, 0]} castShadow receiveShadow />
        </group>
      ))}
    </group>
  );
}
