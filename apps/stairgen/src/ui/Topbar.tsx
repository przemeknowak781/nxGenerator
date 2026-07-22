import { PresetPicker } from './PresetPicker';
import { ExportButton } from './ExportButton';

export function Topbar() {
  return (
    <header className="sg-topbar">
      <div className="sg-brand">
        <div className="sg-brand__mark">
          stair<em>gen</em>
        </div>
        <div className="sg-brand__tag">Schody kręcone · Podniebienie pełne</div>
      </div>

      <div className="sg-topbar__pill" title="Stan silnika geometrii">
        <span className="sg-topbar__pill-dot" />
        silnik: NURBS-helix · v0.9
      </div>

      <div style={{ flex: 1 }} />

      <PresetPicker />
      <ExportButton />
    </header>
  );
}
