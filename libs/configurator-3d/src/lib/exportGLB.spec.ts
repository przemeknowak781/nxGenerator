import { describe, it, expect } from 'vitest';
import { Mesh, BoxGeometry, MeshStandardMaterial, Group } from 'three';
import { exportSceneToGLB } from './exportGLB';

/**
 * End-to-end check of the GLB export path, including the hand-written binary
 * container splicing in injectExtras: export a real scene, then parse the GLB
 * container back and verify the header, chunk layout and embedded metadata.
 */

function makeScene(): Group {
  const g = new Group();
  g.name = 'Root';
  const mesh = new Mesh(new BoxGeometry(100, 100, 100), new MeshStandardMaterial());
  g.add(mesh);
  return g;
}

interface ParsedGlb {
  magic: number;
  version: number;
  declaredLength: number;
  actualLength: number;
  json: {
    asset?: { version?: string; extras?: Record<string, unknown> };
    meshes?: unknown[];
  };
  jsonChunkType: number;
}

// jsdom does not implement Blob.prototype.arrayBuffer (standard in browsers
// since 2019); GLTFExporter itself relies on it, so polyfill via FileReader.
if (typeof Blob.prototype.arrayBuffer !== 'function') {
  Blob.prototype.arrayBuffer = function (this: Blob): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as ArrayBuffer);
      r.onerror = () => reject(r.error);
      r.readAsArrayBuffer(this);
    });
  };
}

async function parseGlb(blob: Blob): Promise<ParsedGlb> {
  const buf = await blob.arrayBuffer();
  const view = new DataView(buf);
  const jsonLen = view.getUint32(12, true);
  const jsonText = new TextDecoder().decode(new Uint8Array(buf, 20, jsonLen));
  return {
    magic: view.getUint32(0, true),
    version: view.getUint32(4, true),
    declaredLength: view.getUint32(8, true),
    actualLength: buf.byteLength,
    jsonChunkType: view.getUint32(16, true),
    json: JSON.parse(jsonText),
  };
}

describe('exportSceneToGLB', () => {
  it('produces a well-formed GLB container', async () => {
    const blob = await exportSceneToGLB(makeScene());
    expect(blob.type).toBe('model/gltf-binary');
    const glb = await parseGlb(blob);
    expect(glb.magic).toBe(0x46546c67); // "glTF"
    expect(glb.version).toBe(2);
    expect(glb.declaredLength).toBe(glb.actualLength);
    expect(glb.jsonChunkType).toBe(0x4e4f534a); // "JSON"
    expect(glb.json.asset?.version).toBe('2.0');
    expect(glb.json.meshes?.length).toBeGreaterThan(0);
  });

  it('embeds round-trippable metadata and keeps the container consistent', async () => {
    const config = { deckWidth: 4000, nested: { a: 1 }, label: 'próba-ą-ż' };
    const blob = await exportSceneToGLB(makeScene(), {
      metadata: config,
      metaKey: 'tarasConfig',
      version: '1.2.3',
    });
    const glb = await parseGlb(blob);
    // Container must stay self-consistent after the JSON chunk was rewritten.
    expect(glb.declaredLength).toBe(glb.actualLength);
    expect(glb.json.meshes?.length).toBeGreaterThan(0);
    // Metadata round-trips exactly, under the configured key.
    const extras = glb.json.asset?.extras as Record<string, unknown>;
    expect(extras['tarasConfig']).toEqual(config);
    expect(extras['version']).toBe('1.2.3');
    expect(typeof extras['timestamp']).toBe('string');
  });

  it('scales millimetre scenes to metres by default', async () => {
    const blob = await exportSceneToGLB(makeScene());
    const glb = (await parseGlb(blob)) as ParsedGlb & {
      json: { nodes?: Array<{ scale?: number[]; matrix?: number[] }> };
    };
    // GLTFExporter may encode the transform as TRS `scale` or a 4×4 `matrix`
    // (diagonal = scale); accept either representation.
    const scaled = glb.json.nodes?.find(
      (n) => n.scale?.[0] === 0.001 || n.matrix?.[0] === 0.001,
    );
    expect(scaled, 'a node carrying the 0.001 mm→m scale').toBeDefined();
    if (scaled?.matrix) {
      expect(scaled.matrix[5]).toBeCloseTo(0.001);
      expect(scaled.matrix[10]).toBeCloseTo(0.001);
    }
  });
});
