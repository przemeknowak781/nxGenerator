import { Environment as DreiEnv, ContactShadows } from '@react-three/drei';

/** Subset of drei's built-in HDRI presets the kit exposes. */
export type EnvironmentPreset =
  | 'studio'
  | 'city'
  | 'sunset'
  | 'dawn'
  | 'warehouse'
  | 'apartment'
  | 'night'
  | 'park'
  | 'forest'
  | 'lobby';

export interface SceneEnvironmentProps {
  preset: EnvironmentPreset;
  intensity?: number;
  /** Render the HDRI as a visible background. */
  showBackground?: boolean;
  /** Contact-shadow config, or `false` to disable. */
  shadows?: { softness: number; scale?: number } | false;
}

/**
 * Image-based lighting + contact shadows for a configurator stage. Product
 * -agnostic: the domain maps its own environment presets onto drei presets.
 */
export function SceneEnvironment({
  preset,
  intensity = 1,
  showBackground = false,
  shadows = { softness: 0.7 },
}: SceneEnvironmentProps) {
  return (
    <>
      <DreiEnv preset={preset} background={showBackground} environmentIntensity={intensity} />
      {shadows && (
        <ContactShadows
          position={[0, 0, 0]}
          scale={shadows.scale ?? 4000}
          blur={shadows.softness * 3}
          opacity={0.5}
          far={shadows.scale ?? 4000}
        />
      )}
    </>
  );
}
