import { create } from 'zustand';

/**
 * The state shape every configurator store exposes. `config` is the single
 * source of truth; the scene, UI chrome and validator all derive from it.
 */
export interface ConfiguratorState<T> {
  config: T;
  /** Patch a subset of fields (the common path for control-panel edits). */
  update: (patch: Partial<T>) => void;
  /** Replace the whole config (used when applying a preset). */
  setConfig: (next: T) => void;
  /** Restore the initial config the store was created with. */
  reset: () => void;
}

/**
 * Factory for a Zustand store bound to a specific configuration type.
 *
 * Every configurator in the ecosystem calls this with its own initial config,
 * getting an identical, well-typed state API for free. This is the seam that
 * lets the shared scene/UI libraries stay product-agnostic.
 *
 * @example
 * export const useStairStore = createConfiguratorStore(INITIAL_STAIR_CONFIG);
 */
export function createConfiguratorStore<T extends object>(initial: T) {
  return create<ConfiguratorState<T>>((set) => ({
    config: initial,
    update: (patch) => set((state) => ({ config: { ...state.config, ...patch } })),
    setConfig: (next) => set(() => ({ config: next })),
    reset: () => set(() => ({ config: initial })),
  }));
}

export type ConfiguratorStore<T extends object> = ReturnType<
  typeof createConfiguratorStore<T>
>;
