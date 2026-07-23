import { useControls, folder } from 'leva';
import { useTarasStore } from './store';

/** Product-specific Leva schema. Chrome + theme come from @nxgen/ui-kit. */
export function ControlPanel() {
  const cfg = useTarasStore.getState().config;
  const update = useTarasStore((s) => s.update);

  useControls(() => ({
    Wymiary: folder({
      deckWidth:  { value: cfg.deckWidth,  min: 1500, max: 8000,  step: 50, onChange: (v: number) => update({ deckWidth: v }) },
      deckLength: { value: cfg.deckLength, min: 1500, max: 10000, step: 50, onChange: (v: number) => update({ deckLength: v }) },
      deckHeight: { value: cfg.deckHeight, min: 60,   max: 1500,  step: 10, onChange: (v: number) => update({ deckHeight: v }) },
    }),
    Deska: folder({
      boardWidth:     { value: cfg.boardWidth,     min: 70, max: 200, step: 5, onChange: (v: number) => update({ boardWidth: v }) },
      boardThickness: { value: cfg.boardThickness, min: 19, max: 45,  step: 1, onChange: (v: number) => update({ boardThickness: v }) },
      boardGap:       { value: cfg.boardGap,       min: 2,  max: 14,  step: 1, onChange: (v: number) => update({ boardGap: v }) },
    }),
    Konstrukcja: folder({
      joistSpacing: { value: cfg.joistSpacing, min: 300, max: 900, step: 10, onChange: (v: number) => update({ joistSpacing: v }) },
      joistHeight:  { value: cfg.joistHeight,  min: 100, max: 220, step: 5,  onChange: (v: number) => update({ joistHeight: v }) },
      beamHeight:   { value: cfg.beamHeight,   min: 80,  max: 240, step: 10, onChange: (v: number) => update({ beamHeight: v }) },
    }),
    Balustrada: folder({
      railingEnabled: { value: cfg.railingEnabled, onChange: (v: boolean) => update({ railingEnabled: v }) },
      railingHeight:  { value: cfg.railingHeight,  min: 700, max: 1200, step: 10, onChange: (v: number) => update({ railingHeight: v }) },
      balusterGap:    { value: cfg.balusterGap,    min: 60,  max: 300,  step: 5,  onChange: (v: number) => update({ balusterGap: v }) },
    }),
    Materiał: folder({
      color:     { value: cfg.color, onChange: (v: string) => update({ color: v }) },
      roughness: { value: cfg.roughness, min: 0, max: 1, step: 0.01, onChange: (v: number) => update({ roughness: v }) },
      metallic:  { value: cfg.metallic, min: 0, max: 1, step: 0.01, onChange: (v: number) => update({ metallic: v }) },
    }),
  }));

  return null;
}
