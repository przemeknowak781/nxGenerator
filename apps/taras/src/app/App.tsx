import { useMemo } from 'react';
import { Leva } from 'leva';
import {
  ConfiguratorCanvas,
  SceneEnvironment,
  ExportListener,
  triggerExport,
} from '@nxgen/configurator-3d';
import {
  Topbar,
  StatusBar,
  ValidationPanel,
  PresetPicker,
  ExportButton,
  levaTheme,
} from '@nxgen/ui-kit';
import { TarasModel } from '@nxgen/taras-scene';
import { validate, computeSummary, PRESET_REFS } from '@nxgen/taras-domain';
import { useTarasStore, applyTarasPreset } from './store';
import { ControlPanel } from './ControlPanel';

const EXPORT_EVENT = 'taras:export';

export default function App() {
  const cfg = useTarasStore((s) => s.config);
  const issues = useMemo(() => validate(cfg), [cfg]);
  const summary = useMemo(() => computeSummary(cfg), [cfg]);

  const statusItems = [
    { k: 'Szer.', v: `${cfg.deckWidth} mm` },
    { k: 'Dł.', v: `${cfg.deckLength} mm` },
    { k: 'Wys.', v: `${cfg.deckHeight} mm` },
    { k: 'Pow.', v: `${summary.areaM2.toFixed(1)} m²` },
    { k: 'Desek', v: String(summary.boards) },
    { k: 'Legarów', v: String(summary.joists), accent: true },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--paper)' }}>
      <Topbar
        brand={<>Taras</>}
        tagline="Konfigurator tarasów drewnianych"
        badge="konfigurator 3D"
      >
        <PresetPicker presets={PRESET_REFS} onPick={applyTarasPreset} />
        <ExportButton onClick={() => triggerExport(EXPORT_EVENT)} />
      </Topbar>

      <aside className="sg-left">
        <div className="sg-left__head">
          <div>
            <div className="sg-kicker" style={{ marginBottom: 4 }}>
              Konfigurator
            </div>
            <div className="sg-left__title">Parametry</div>
          </div>
          <div className="sg-left__index">01 / SYS</div>
        </div>
        <div className="sg-left__leva">
          <ControlPanel />
          <Leva fill flat hideCopyButton titleBar={false} theme={levaTheme} />
        </div>
      </aside>

      <ValidationPanel issues={issues} kicker="Audyt" title="Zgodność" />
      <StatusBar items={statusItems} meta="mm" />

      <section className="sg-stage">
        <div className="sg-stage__badge">
          <span className="sg-stage__badge-dot" />
          WIDOK 3D · PODGLĄD NA ŻYWO
        </div>
        <ConfiguratorCanvas
          cameraPosition={[5000, 3400, 5200]}
          controlsTarget={[0, 300, 0]}
          maxDistance={16000}
          grid={{
            size: 8000,
            divisions: 40,
            color: '#c9c4b8',
            centerColor: '#e8e4d8',
          }}
        >
          <SceneEnvironment
            preset="apartment"
            intensity={1}
            shadows={{ softness: 0.8, scale: 8000 }}
          />
          <TarasModel config={cfg} />
          <ExportListener
            rootName="TarasRoot"
            eventName={EXPORT_EVENT}
            fileBaseName="taras"
            metaKey="tarasConfig"
            getMetadata={() => useTarasStore.getState().config}
          />
        </ConfiguratorCanvas>
      </section>
    </div>
  );
}
