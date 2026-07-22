import type { ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

export interface GridConfig {
  size: number;
  divisions: number;
  color?: string;
  centerColor?: string;
}

export interface ConfiguratorCanvasProps {
  children: ReactNode;
  /** Initial camera position. */
  cameraPosition?: [number, number, number];
  fov?: number;
  near?: number;
  far?: number;
  /** OrbitControls look-at target. */
  controlsTarget?: [number, number, number];
  maxDistance?: number;
  /** Floor grid, or `false` to hide it. */
  grid?: GridConfig | false;
  className?: string;
}

/**
 * The shared 3D stage for every configurator: a shadow-enabled `<Canvas>` with
 * orbit controls and an optional floor grid. `preserveDrawingBuffer` is on so
 * screenshots / GLB previews work. Domain scenes are passed as `children`.
 */
export function ConfiguratorCanvas({
  children,
  cameraPosition = [3200, 1800, 3200],
  fov = 40,
  near = 1,
  far = 20000,
  controlsTarget = [0, 1500, 0],
  maxDistance = 10000,
  grid = { size: 4000, divisions: 40, color: '#c9c4b8', centerColor: '#e8e4d8' },
  className,
}: ConfiguratorCanvasProps) {
  return (
    <Canvas
      className={className}
      camera={{ position: cameraPosition, fov, near, far }}
      shadows
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      style={{ position: 'absolute', inset: 0 }}
    >
      {children}
      <OrbitControls target={controlsTarget} maxDistance={maxDistance} />
      {grid && (
        <gridHelper
          args={[grid.size, grid.divisions, grid.centerColor ?? '#e8e4d8', grid.color ?? '#c9c4b8']}
        />
      )}
    </Canvas>
  );
}
