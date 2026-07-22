/**
 * Generic preset model. A preset is a named, partial patch over a configuration.
 * Domains that need deep merging (e.g. nested material maps) compose their own
 * apply function on top of {@link applyPreset}.
 */

export interface Preset<T> {
  id: string;
  label: string;
  patch: Partial<T>;
}

/** Reference to a preset for pickers that only need identity + label. */
export type PresetRef = Pick<Preset<unknown>, 'id' | 'label'>;

/** Shallow-merge a preset patch onto a base configuration. */
export function applyPreset<T extends object>(base: T, preset: Preset<T>): T {
  return { ...base, ...preset.patch };
}

/** Index a preset list by id for O(1) lookup. */
export function indexPresets<T>(list: ReadonlyArray<Preset<T>>): Record<string, Preset<T>> {
  return Object.fromEntries(list.map((p) => [p.id, p]));
}
