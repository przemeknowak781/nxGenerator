import { useControls, folder } from 'leva';
import { usePlanterStore } from './store';

/** Product-specific Leva schema. Chrome + theme come from @nxgen/ui-kit. */
export function ControlPanel() {
  const cfg = usePlanterStore.getState().config;
  const update = usePlanterStore((s) => s.update);

  useControls(() => ({
    Wymiary: folder({
      width:     { value: cfg.width,     min: 250, max: 1400, step: 10, onChange: (v: number) => update({ width: v }) },
      depth:     { value: cfg.depth,     min: 250, max: 1000, step: 10, onChange: (v: number) => update({ depth: v }) },
      height:    { value: cfg.height,    min: 150, max: 1200, step: 10, onChange: (v: number) => update({ height: v }) },
      legHeight: { value: cfg.legHeight, min: 0,   max: 400,  step: 10, onChange: (v: number) => update({ legHeight: v }) },
    }),
    Deska: folder({
      boardWidth:     { value: cfg.boardWidth,     min: 60, max: 160, step: 5, onChange: (v: number) => update({ boardWidth: v }) },
      boardThickness: { value: cfg.boardThickness, min: 15, max: 35,  step: 1, onChange: (v: number) => update({ boardThickness: v }) },
      boardGap:       { value: cfg.boardGap,       min: 0,  max: 20,  step: 1, onChange: (v: number) => update({ boardGap: v }) },
    }),
    Materiał: folder({
      color:     { value: cfg.color, onChange: (v: string) => update({ color: v }) },
      roughness: { value: cfg.roughness, min: 0, max: 1, step: 0.01, onChange: (v: number) => update({ roughness: v }) },
      metallic:  { value: cfg.metallic, min: 0, max: 1, step: 0.01, onChange: (v: number) => update({ metallic: v }) },
    }),
  }));

  return null;
}
