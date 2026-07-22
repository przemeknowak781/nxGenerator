import { useStairStore } from '../store/useStairStore';
import { Step } from './Step';
import { Soffit } from './Soffit';
import { Column } from './Column';
import { Balustrade } from './Balustrade';
import { Rail } from './Rail';
import { Landing } from './Landing';

export function Stair() {
  const n = useStairStore((s) => s.config.stepCount);
  return (
    <group name="StairRoot">
      {Array.from({ length: n }, (_, k) => <Step key={k} k={k} />)}
      <Soffit />
      <Column />
      <Balustrade />
      <Rail />
      <Landing />
    </group>
  );
}
