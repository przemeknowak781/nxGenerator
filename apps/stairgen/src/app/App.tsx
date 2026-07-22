import { useMemo } from 'react';
import { Leva } from 'leva';
import {
  ConfiguratorCanvas,
  CameraRig,
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
import { StairModel } from '@nxgen/stair-scene';
import { validate, computeMetrics, PRESET_REFS } from '@nxgen/stair-domain';
import { useStairStore, applyStairPreset } from './store';
import { ControlPanel } from './ControlPanel';
import { CAMERA_POSITIONS, ENV_PRESET_MAP } from './presetMaps';

const EXPORT_EVENT = 'stairgen:export';

export default function App() {
  const cfg = useStairStore((s) => s.config);
  const issues = useMemo(() => validate(cfg), [cfg]);
  const metrics = useMemo(() => computeMetrics(cfg), [cfg]);

  const statusItems = [
    { k: 'Wys.', v: `${cfg.totalHeight} mm` },
    { k: 'Kąt', v: `${cfg.sweepAngle}°` },
    { k: 'Stopni', v: String(cfg.stepCount) },
    { k: 'Rise', v: `${metrics.riseHeight.toFixed(0)} mm` },
    { k: 'Walk', v: `${metrics.walklineDepth.toFixed(0)} mm` },
    { k: 'Szer.', v: `${metrics.effectiveWidth.toFixed(0)} mm` },
    { k: '2h+s', v: metrics.blondel.toFixed(0), accent: true },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--paper)' }}>
      <Topbar
        brand={<>stair<em>gen</em></>}
        tagline="Schody kręcone · Podniebienie pełne"
        badge="silnik: NURBS-helix · v0.9"
      >
        <PresetPicker presets={PRESET_REFS} onPick={applyStairPreset} />
        <ExportButton onClick={() => triggerExport(EXPORT_EVENT)} />
      </Topbar>

      <aside className="sg-left">
        <div className="sg-left__head">
          <div>
            <div className="sg-kicker" style={{ marginBottom: 4 }}>Konfigurator</div>
            <div className="sg-left__title">Parametry</div>
          </div>
          <div className="sg-left__index">01 / SYS</div>
        </div>
        <div className="sg-left__leva">
          <ControlPanel />
          <Leva fill flat hideCopyButton titleBar={false} theme={levaTheme} />
        </div>
      </aside>

      <ValidationPanel issues={issues} kicker="Audyt WT · 2019" title="Zgodność" />
      <StatusBar items={statusItems} meta="mm · ° · PL-WT-2019" />

      <section className="sg-stage">
        <div className="sg-stage__badge">
          <span className="sg-stage__badge-dot" />
          WIDOK 3D · PODGLĄD NA ŻYWO
        </div>
        <ConfiguratorCanvas cameraPosition={CAMERA_POSITIONS[cfg.cameraPreset]}>
          <SceneEnvironment
            preset={ENV_PRESET_MAP[cfg.envPreset]}
            intensity={cfg.envIntensity}
            showBackground={cfg.backgroundMode === 'hdri_visible'}
            shadows={cfg.shadowsEnabled ? { softness: cfg.shadowSoftness } : false}
          />
          <CameraRig position={CAMERA_POSITIONS[cfg.cameraPreset]} target={[0, 1500, 0]} />
          <StairModel config={cfg} />
          <ExportListener
            rootName="StairRoot"
            eventName={EXPORT_EVENT}
            fileBaseName="stairgen"
            metaKey="stairgenConfig"
            getMetadata={() =>
              useStairStore.getState().config.exportIncludeMetadata
                ? useStairStore.getState().config
                : undefined
            }
          />
        </ConfiguratorCanvas>
      </section>
    </div>
  );
}
