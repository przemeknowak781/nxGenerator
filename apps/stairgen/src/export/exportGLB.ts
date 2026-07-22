import type { Object3D } from 'three';
import { GLTFExporter } from 'three-stdlib';
import type { StairConfig } from '../config/types';

interface Options {
  includeMetadata?: boolean;
  unitScale?: 'meters' | 'mm';
}

export async function exportSceneToGLB(
  object: Object3D,
  config: StairConfig,
  opts: Options = {},
): Promise<Blob> {
  const exporter = new GLTFExporter();
  const root = object.clone(true);
  if (opts.unitScale !== 'mm') root.scale.setScalar(0.001);

  const result = await new Promise<ArrayBuffer>((resolve, reject) => {
    exporter.parse(
      root,
      (data) => resolve(data as ArrayBuffer),
      (err) => reject(err),
      { binary: true } as unknown as Parameters<typeof exporter.parse>[3],
    );
  });

  const finalBuf = opts.includeMetadata
    ? injectExtras(result, { stairgenConfig: config, version: '0.1.0', timestamp: new Date().toISOString() })
    : result;
  return new Blob([finalBuf], { type: 'model/gltf-binary' });
}

function injectExtras(glb: ArrayBuffer, extras: Record<string, unknown>): ArrayBuffer {
  const view = new DataView(glb);
  const jsonChunkLength = view.getUint32(12, true);
  const jsonBytes = new Uint8Array(glb, 20, jsonChunkLength);
  const jsonText = new TextDecoder().decode(jsonBytes);
  const gltf = JSON.parse(jsonText) as { asset?: { extras?: Record<string, unknown> } };
  gltf.asset ??= {};
  gltf.asset.extras = { ...(gltf.asset.extras ?? {}), ...extras };
  const newJsonText = JSON.stringify(gltf);
  const padLen = (4 - (newJsonText.length % 4)) % 4;
  const padded = newJsonText + ' '.repeat(padLen);
  const newJsonBytes = new TextEncoder().encode(padded);

  const binChunkOffset = 20 + jsonChunkLength;
  const binChunkBytes = new Uint8Array(glb, binChunkOffset);
  const totalLength = 12 + 8 + newJsonBytes.length + binChunkBytes.length;
  const out = new ArrayBuffer(totalLength);
  const outView = new DataView(out);
  outView.setUint32(0, 0x46546c67, true); // magic "glTF"
  outView.setUint32(4, 2, true);           // version
  outView.setUint32(8, totalLength, true);
  outView.setUint32(12, newJsonBytes.length, true);
  outView.setUint32(16, 0x4e4f534a, true); // "JSON"
  new Uint8Array(out, 20, newJsonBytes.length).set(newJsonBytes);
  new Uint8Array(out, 20 + newJsonBytes.length).set(binChunkBytes);
  return out;
}
