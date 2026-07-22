import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

export interface CameraRigProps {
  /** Camera world position. */
  position: [number, number, number];
  /** Point the camera looks at. Defaults to the origin. */
  target?: [number, number, number];
}

/**
 * Imperatively positions the active camera. Domains map their own camera
 * presets to a position/target and feed them in — the rig itself is generic.
 */
export function CameraRig({ position, target = [0, 0, 0] }: CameraRigProps) {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(position[0], position[1], position[2]);
    camera.lookAt(target[0], target[1], target[2]);
  }, [camera, position, target]);
  return null;
}
