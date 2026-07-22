import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { exportSceneToGLB } from './exportGLB';

export interface ExportListenerProps {
  /** `name` of the object in the scene graph to export. */
  rootName: string;
  /** Window event that triggers an export (dispatched by the UI). */
  eventName: string;
  /** Base of the downloaded file name: `${fileBaseName}_<timestamp>.glb`. */
  fileBaseName: string;
  /** Supplies the config snapshot embedded in the GLB, evaluated at export time. */
  getMetadata?: () => unknown;
  metaKey?: string;
  unitScale?: 'meters' | 'mm';
}

/**
 * Drop-in exporter for any configurator scene. Mount it inside the `<Canvas>`;
 * dispatching `eventName` on `window` exports the named object as a GLB and
 * triggers a browser download. Decoupled from any specific store — the caller
 * provides `getMetadata`.
 */
export function ExportListener({
  rootName,
  eventName,
  fileBaseName,
  getMetadata,
  metaKey,
  unitScale,
}: ExportListenerProps) {
  const { scene } = useThree();
  useEffect(() => {
    const handler = async () => {
      const target = scene.getObjectByName(rootName);
      if (!target) {
        console.warn(`[configurator-3d] export root "${rootName}" not found`);
        return;
      }
      const blob = await exportSceneToGLB(target, {
        metadata: getMetadata?.(),
        ...(metaKey ? { metaKey } : {}),
        ...(unitScale ? { unitScale } : {}),
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileBaseName}_${Date.now()}.glb`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    };
    window.addEventListener(eventName, handler);
    return () => window.removeEventListener(eventName, handler);
  }, [scene, rootName, eventName, fileBaseName, getMetadata, metaKey, unitScale]);
  return null;
}

/** Fire the export event a matching {@link ExportListener} is waiting for. */
export function triggerExport(eventName: string): void {
  window.dispatchEvent(new CustomEvent(eventName));
}
