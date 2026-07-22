import { useMemo } from 'react';
import { BoxGeometry, Color } from 'three';
import { buildStandardMaterial } from '@nxgen/configurator-3d';
import { computeSummary, type TarasConfig } from '@nxgen/taras-domain';

export interface TarasModelProps {
  config: TarasConfig;
  /** Scene-graph name used by the GLB exporter to find the root. */
  rootName?: string;
}

const JOIST_THICKNESS = 45;
const POST = 90;

/**
 * Parametric wooden deck: a run of top boards over a joist substructure carried
 * by corner posts. Board count and joist count come from the domain's
 * `computeSummary`, so the model and the validator always agree.
 */
export function TarasModel({ config, rootName = 'TarasRoot' }: TarasModelProps) {
  const { deckLength, deckHeight, boardWidth, boardThickness, boardGap, joistHeight } = config;
  const { boards, joists } = computeSummary(config);

  const deckMat = useMemo(
    () => buildStandardMaterial({ baseColor: config.color, roughness: config.roughness, metallic: config.metallic }),
    [config.color, config.roughness, config.metallic],
  );
  // Structure in a darker shade of the same species.
  const frameMat = useMemo(() => {
    const dark = '#' + new Color(config.color).multiplyScalar(0.55).getHexString();
    return buildStandardMaterial({ baseColor: dark, roughness: 0.8, metallic: 0 });
  }, [config.color]);

  const pitch = boardWidth + boardGap;
  const spanW = boards * boardWidth + (boards - 1) * boardGap; // actual covered width

  const boardGeom = useMemo(
    () => new BoxGeometry(boardWidth, boardThickness, deckLength),
    [boardWidth, boardThickness, deckLength],
  );
  const joistGeom = useMemo(
    () => new BoxGeometry(spanW, joistHeight, JOIST_THICKNESS),
    [spanW, joistHeight],
  );
  // deckHeight is the elevation of the walking surface (top of boards); the
  // frame stacks downward from it: boards, then joists, then posts to ground.
  const frameTop = deckHeight - boardThickness;
  const postHeight = Math.max(frameTop - joistHeight, 1);
  const postGeom = useMemo(
    () => new BoxGeometry(POST, postHeight, POST),
    [postHeight],
  );

  const boardXs = useMemo(
    () => Array.from({ length: boards }, (_, i) => -spanW / 2 + boardWidth / 2 + i * pitch),
    [boards, spanW, boardWidth, pitch],
  );
  const joistZs = useMemo(
    () => Array.from({ length: joists }, (_, i) => -deckLength / 2 + (i * deckLength) / (joists - 1)),
    [joists, deckLength],
  );

  const boardY = deckHeight - boardThickness / 2;
  const joistY = frameTop - joistHeight / 2;
  const postY = postHeight / 2;
  const px = spanW / 2 - POST / 2;
  const pz = deckLength / 2 - POST / 2;

  return (
    <group name={rootName}>
      {boardXs.map((x, i) => (
        <mesh key={`b${i}`} geometry={boardGeom} material={deckMat} position={[x, boardY, 0]} castShadow receiveShadow />
      ))}
      {joistZs.map((z, i) => (
        <mesh key={`j${i}`} geometry={joistGeom} material={frameMat} position={[0, joistY, z]} castShadow receiveShadow />
      ))}
      {[[-px, -pz], [px, -pz], [-px, pz], [px, pz]].map(([x, z], i) => (
        <mesh key={`p${i}`} geometry={postGeom} material={frameMat} position={[x, postY, z]} castShadow />
      ))}
    </group>
  );
}
