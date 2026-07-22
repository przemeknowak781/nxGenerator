import { createConfiguratorStore } from '@nxgen/configurator-core';
import { DEFAULT_CONFIG, applyPreset, type StairConfig } from '@nxgen/stair-domain';

/** The app boots on the loft-metal preset. */
export const INITIAL_CONFIG: StairConfig = applyPreset(DEFAULT_CONFIG, 'loft_metal_120');

/** Stair configurator store — a typed instance of the shared store factory. */
export const useStairStore = createConfiguratorStore(INITIAL_CONFIG);

/** Merge a preset (by id) onto the current config and commit it. */
export function applyStairPreset(id: string): void {
  const { config, setConfig } = useStairStore.getState();
  setConfig(applyPreset(config, id));
}
