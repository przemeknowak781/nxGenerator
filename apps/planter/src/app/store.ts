import { createConfiguratorStore } from '@nxgen/configurator-core';
import { DEFAULT_CONFIG, applyPreset } from '@nxgen/planter-domain';

/** Planter configurator store — an instance of the shared factory. */
export const usePlanterStore = createConfiguratorStore(DEFAULT_CONFIG);

/** Merge a preset (by id) onto the current config and commit it. */
export function applyPlanterPreset(id: string): void {
  const { config, setConfig } = usePlanterStore.getState();
  setConfig(applyPreset(config, id));
}
