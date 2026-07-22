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
import { PlanterModel } from '@nxgen/planter-scene';
import { validate, computeSummary, PRESET_REFS } from '@nxgen/planter-domain';
import { usePlanterStore, applyPlanterPreset } from './store';
import { ControlPanel } from './ControlPanel';

const EXPORT_EVENT = 'planter:export';

export default function App() {
  const cfg = usePlanterStore((s) => s.config);
  const issues = useMemo(() => validate(cfg), [cfg]);
  const summary = useMemo(() => computeSummary(cfg), [cfg]);

  const statusItems = [
    { k: 'Szer.', v: `${cfg.width} mm` },
    { k: 'Głęb.', v: `${cfg.depth} mm` },
    { k: 'Wys.', v: `${cfg.height} mm` },
    { k: 'Desek', v: String(summary.boards) },
    { k: 'Ziemia', v: `${summary.volumeL.toFixed(0)} l`, accent: true },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--paper)' }}>
      <Topbar
        brand={<>Planter</>}
        tagline="Donice drewniane · listwowe"
        badge="konfigurator 3D"
      >
        <PresetPicker presets={PRESET_REFS} onPick={applyPlanterPreset} />
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
          cameraPosition={[1300, 950, 1300]}
          controlsTarget={[0, 350, 0]}
          maxDistance={5000}
          grid={{
            size: 1800,
            divisions: 18,
            color: '#c9c4b8',
            centerColor: '#e8e4d8',
          }}
        >
          <SceneEnvironment
            preset="apartment"
            intensity={1}
            shadows={{ softness: 0.7, scale: 1800 }}
          />
          <PlanterModel config={cfg} />
          <ExportListener
            rootName="PlanterRoot"
            eventName={EXPORT_EVENT}
            fileBaseName="planter"
            metaKey="planterConfig"
            getMetadata={() => usePlanterStore.getState().config}
          />
        </ConfiguratorCanvas>
      </section>
    </div>
  );
}
