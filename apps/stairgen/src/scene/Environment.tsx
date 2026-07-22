import { Environment as DreiEnv, ContactShadows } from '@react-three/drei';
import { useStairStore } from '../store/useStairStore';
import type { EnvPreset } from '../config/types';

type DreiPreset = 'studio' | 'city' | 'sunset' | 'dawn' | 'warehouse' | 'apartment' | 'night' | 'park' | 'forest' | 'lobby';

const PRESET_MAP: Record<EnvPreset, DreiPreset> = {
  studio: 'studio',
  showroom: 'warehouse',
  interior_warm: 'apartment',
  interior_cool: 'lobby',
  dusk: 'sunset',
  hdri_custom: 'studio',
};

export function SceneEnvironment() {
  const cfg = useStairStore((s) => s.config);
  return (
    <>
      <DreiEnv
        preset={PRESET_MAP[cfg.envPreset]}
        background={cfg.backgroundMode === 'hdri_visible'}
        environmentIntensity={cfg.envIntensity}
      />
      {cfg.shadowsEnabled && (
        <ContactShadows
          position={[0, 0, 0]}
          scale={4000}
          blur={cfg.shadowSoftness * 3}
          opacity={0.5}
          far={4000}
        />
      )}
    </>
  );
}
