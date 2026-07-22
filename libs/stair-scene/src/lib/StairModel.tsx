import type { StairConfig } from '@nxgen/stair-domain';
import { Step } from './Step';
import { Soffit } from './Soffit';
import { Column } from './Column';
import { Balustrade } from './Balustrade';
import { Rail } from './Rail';
import { Landing } from './Landing';

export interface StairModelProps {
  config: StairConfig;
  /** Scene-graph name used by the GLB exporter to find the root. */
  rootName?: string;
}

/**
 * The complete stair as an R3F group. Consumes a plain {@link StairConfig} —
 * it holds no store reference, so it can be driven by any state source and
 * rendered in any configurator canvas.
 */
export function StairModel({ config, rootName = 'StairRoot' }: StairModelProps) {
  return (
    <group name={rootName}>
      {Array.from({ length: config.stepCount }, (_, k) => (
        <Step key={k} cfg={config} k={k} />
      ))}
      <Soffit cfg={config} />
      <Column cfg={config} />
      <Balustrade cfg={config} />
      <Rail cfg={config} />
      <Landing cfg={config} />
    </group>
  );
}
