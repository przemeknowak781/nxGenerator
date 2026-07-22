import { create } from 'zustand';
import type { StairConfig } from '../config/types';
import { DEFAULT_CONFIG } from '../config/defaults';
import { applyPreset } from '../config/presets';

export const INITIAL_CONFIG: StairConfig = applyPreset(DEFAULT_CONFIG, 'loft_metal_120');

interface State {
  config: StairConfig;
  update: (patch: Partial<StairConfig>) => void;
  applyPreset: (preset: Partial<StairConfig>) => void;
  reset: () => void;
}

export const useStairStore = create<State>((set) => ({
  config: INITIAL_CONFIG,
  update: (patch) => set((s) => ({ config: { ...s.config, ...patch } })),
  applyPreset: (preset) => set((s) => ({ config: { ...s.config, ...preset } })),
  reset: () => set({ config: INITIAL_CONFIG }),
}));
