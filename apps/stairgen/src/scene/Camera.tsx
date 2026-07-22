import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useStairStore } from '../store/useStairStore';
import type { CameraPreset } from '../config/types';

const POSITIONS: Record<CameraPreset, [number, number, number]> = {
  hero:          [3200, 1800, 3200],
  top:           [0,    5000, 0.1],
  elevation:     [4500, 1500, 0],
  detail_nosing: [1400, 800,  1400],
  underside:     [2000, 200,  2000],
};

export function CameraRig() {
  const preset = useStairStore((s) => s.config.cameraPreset);
  const { camera } = useThree();
  useEffect(() => {
    const [x, y, z] = POSITIONS[preset];
    camera.position.set(x, y, z);
    camera.lookAt(0, 1500, 0);
  }, [preset, camera]);
  return null;
}
