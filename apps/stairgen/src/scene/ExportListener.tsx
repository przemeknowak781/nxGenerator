import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useStairStore } from '../store/useStairStore';
import { exportSceneToGLB } from '../export/exportGLB';

export function ExportListener() {
  const { scene } = useThree();
  useEffect(() => {
    const handler = async () => {
      const cfg = useStairStore.getState().config;
      const stair = scene.getObjectByName('StairRoot');
      if (!stair) {
        console.warn('StairRoot not found');
        return;
      }
      const blob = await exportSceneToGLB(stair, cfg, {
        includeMetadata: cfg.exportIncludeMetadata,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stairgen_${Date.now()}.glb`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    };
    window.addEventListener('stairgen:export', handler);
    return () => window.removeEventListener('stairgen:export', handler);
  }, [scene]);
  return null;
}
