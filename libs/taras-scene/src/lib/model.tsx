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
const BEAM_THICKNESS = 90; // bearer beam width
const POST = 90;
const RAILPOST = 70;
const RAILH = 45; // top/bottom rail section
const BAL = 32; // vertical baluster section
const BAL_PITCH = 120; // target centre-to-centre spacing of balusters

function spread(count: number, half: number): number[] {
  if (count < 2) return [0];
  return Array.from({ length: count }, (_, i) => -half + (i * 2 * half) / (count - 1));
}

// Evenly place interior balusters across a clear run, targeting BAL_PITCH.
// Returns centre offsets (excluding the corner posts at the ends).
function balusters(clearLen: number): number[] {
  const gaps = Math.max(2, Math.round(clearLen / BAL_PITCH));
  const n = gaps - 1;
  return Array.from({ length: n }, (_, i) => -clearLen / 2 + ((i + 1) * clearLen) / gaps);
}

/**
 * Parametric wooden deck. Structure, bottom-up: posts → bearer beams
 * (podwaliny) → joists → boards, plus an optional perimeter railing. Board and
 * joist counts come from the domain's `computeSummary`, so the model and the
 * validator always agree.
 */
export function TarasModel({ config, rootName = 'TarasRoot' }: TarasModelProps) {
  const {
    deckLength, deckHeight, boardWidth, boardThickness, boardGap,
    joistHeight, beamHeight, railingEnabled, railingHeight,
  } = config;
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
  const spanW = boards * boardWidth + (boards - 1) * boardGap; // covered width

  // deckHeight is the walking surface (top of boards); the frame stacks down:
  // boards, joists, bearer beams, then posts to the ground.
  const frameTop = deckHeight - boardThickness; // = joist top
  const joistBottom = frameTop - joistHeight;
  const beamCenterY = joistBottom - beamHeight / 2;
  const beamBottom = joistBottom - beamHeight;
  const postHeight = Math.max(beamBottom, 1);

  // --- Geometries ---
  const boardGeom = useMemo(() => new BoxGeometry(boardWidth, boardThickness, deckLength), [boardWidth, boardThickness, deckLength]);
  const joistGeom = useMemo(() => new BoxGeometry(spanW, joistHeight, JOIST_THICKNESS), [spanW, joistHeight]);
  const beamGeom = useMemo(() => new BoxGeometry(BEAM_THICKNESS, beamHeight, deckLength), [beamHeight, deckLength]);
  const postGeom = useMemo(() => new BoxGeometry(POST, postHeight, POST), [postHeight]);

  // --- Positions ---
  const boardXs = useMemo(() => Array.from({ length: boards }, (_, i) => -spanW / 2 + boardWidth / 2 + i * pitch), [boards, spanW, boardWidth, pitch]);
  const joistZs = useMemo(() => spread(joists, deckLength / 2), [joists, deckLength]);

  // Two bearer beams run along the length, inset from the edge, under the joists.
  const bearerX = Math.max(spanW / 2 - Math.min(spanW * 0.18, 450), BEAM_THICKNESS / 2);
  const bearerXs = [-bearerX, bearerX];
  // Posts sit under the bearers; more of them for longer decks.
  const nPostsPerBearer = Math.max(2, Math.round(deckLength / 1800) + 1);
  const postZs = spread(nPostsPerBearer, deckLength / 2 - 150);

  const boardY = deckHeight - boardThickness / 2;
  const joistY = frameTop - joistHeight / 2;
  const postY = postHeight / 2;

  // --- Railing (optional perimeter: corner posts, a top handrail and a bottom
  // rail, with vertical balusters filling the space between them) ---
  const topRailY = deckHeight + railingHeight - RAILH / 2;
  const bottomRailY = deckHeight + RAILH / 2 + 40; // bottom rail just above deck
  const balH = topRailY - bottomRailY; // baluster spans between the two rails
  const balCenterY = (topRailY + bottomRailY) / 2;

  const railGeom = useMemo(() => {
    if (!railingEnabled) return null;
    return {
      post: new BoxGeometry(RAILPOST, railingHeight, RAILPOST),
      railX: new BoxGeometry(spanW, RAILH, RAILH),
      railZ: new BoxGeometry(RAILH, RAILH, deckLength),
      bal: new BoxGeometry(BAL, balH, BAL),
    };
  }, [railingEnabled, railingHeight, spanW, deckLength, balH]);

  const rpx = spanW / 2 - RAILPOST / 2;
  const rpz = deckLength / 2 - RAILPOST / 2;
  const rzEdge = deckLength / 2 - RAILH / 2;
  const rxEdge = spanW / 2 - RAILH / 2;
  // Baluster runs along each side, inset from the corner posts.
  const balXs = balusters(spanW - RAILPOST); // along the width edges (z = ±rzEdge)
  const balZs = balusters(deckLength - RAILPOST); // along the length edges (x = ±rxEdge)

  return (
    <group name={rootName}>
      {/* deck boards */}
      {boardXs.map((x, i) => (
        <mesh key={`b${i}`} geometry={boardGeom} material={deckMat} position={[x, boardY, 0]} castShadow receiveShadow />
      ))}
      {/* joists */}
      {joistZs.map((z, i) => (
        <mesh key={`j${i}`} geometry={joistGeom} material={frameMat} position={[0, joistY, z]} castShadow receiveShadow />
      ))}
      {/* bearer beams (podwaliny) */}
      {bearerXs.map((x, i) => (
        <mesh key={`beam${i}`} geometry={beamGeom} material={frameMat} position={[x, beamCenterY, 0]} castShadow receiveShadow />
      ))}
      {/* posts under the bearers */}
      {bearerXs.flatMap((x, bi) =>
        postZs.map((z, pi) => (
          <mesh key={`p${bi}-${pi}`} geometry={postGeom} material={frameMat} position={[x, postY, z]} castShadow />
        )),
      )}

      {/* railing */}
      {railGeom && (
        <group>
          {/* corner posts */}
          {[[-rpx, -rpz], [rpx, -rpz], [-rpx, rpz], [rpx, rpz]].map(([x, z], i) => (
            <mesh key={`rp${i}`} geometry={railGeom.post} material={deckMat} position={[x, deckHeight + railingHeight / 2, z]} castShadow />
          ))}
          {/* top handrail + bottom rail on all four sides */}
          {[topRailY, bottomRailY].flatMap((y, li) => [
            <mesh key={`rxa${li}`} geometry={railGeom.railX} material={deckMat} position={[0, y, -rzEdge]} castShadow />,
            <mesh key={`rxb${li}`} geometry={railGeom.railX} material={deckMat} position={[0, y, rzEdge]} castShadow />,
            <mesh key={`rza${li}`} geometry={railGeom.railZ} material={deckMat} position={[-rxEdge, y, 0]} castShadow />,
            <mesh key={`rzb${li}`} geometry={railGeom.railZ} material={deckMat} position={[rxEdge, y, 0]} castShadow />,
          ])}
          {/* vertical balusters along the width edges (front / back) */}
          {balXs.flatMap((x, i) => [
            <mesh key={`bxa${i}`} geometry={railGeom.bal} material={deckMat} position={[x, balCenterY, -rzEdge]} castShadow />,
            <mesh key={`bxb${i}`} geometry={railGeom.bal} material={deckMat} position={[x, balCenterY, rzEdge]} castShadow />,
          ])}
          {/* vertical balusters along the length edges (left / right) */}
          {balZs.flatMap((z, i) => [
            <mesh key={`bza${i}`} geometry={railGeom.bal} material={deckMat} position={[-rxEdge, balCenterY, z]} castShadow />,
            <mesh key={`bzb${i}`} geometry={railGeom.bal} material={deckMat} position={[rxEdge, balCenterY, z]} castShadow />,
          ])}
        </group>
      )}
    </group>
  );
}
