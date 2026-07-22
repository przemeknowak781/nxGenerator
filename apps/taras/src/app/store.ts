import { createConfiguratorStore } from '@nxgen/configurator-core';
import { DEFAULT_CONFIG, applyPreset } from '@nxgen/taras-domain';

/** Taras configurator store — an instance of the shared factory. */
export const useTarasStore = createConfiguratorStore(DEFAULT_CONFIG);

/** Merge a preset (by id) onto the current config and commit it. */
export function applyTarasPreset(id: string): void {
  const { config, setConfig } = useTarasStore.getState();
  setConfig(applyPreset(config, id));
}
