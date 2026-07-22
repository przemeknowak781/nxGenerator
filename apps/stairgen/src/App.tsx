import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Leva } from 'leva';
import { Stair } from './scene/Stair';
import { SceneEnvironment } from './scene/Environment';
import { CameraRig } from './scene/Camera';
import { ExportListener } from './scene/ExportListener';
import { Topbar } from './ui/Topbar';
import { ControlPanel } from './ui/ControlPanel';
import { ValidationPanel } from './ui/ValidationPanel';
import { StatusBar } from './ui/StatusBar';

const levaTheme = {
  colors: {
    elevation1: '#ffffff',
    elevation2: '#ffffff',
    elevation3: '#f6f5f1',
    accent1: '#b2542b',
    accent2: '#c66a3e',
    accent3: '#d97e51',
    highlight1: '#9a968e',
    highlight2: '#2a2a28',
    highlight3: '#0e0e0c',
    vivid1: '#b2542b',
    folderWidgetColor: '#6b6862',
    folderTextColor: '#0e0e0c',
    toolTipBackground: '#0e0e0c',
    toolTipText: '#ffffff',
  },
  fonts: {
    mono: "'JetBrains Mono', ui-monospace, monospace",
    sans: "'IBM Plex Sans', system-ui, sans-serif",
  },
  fontSizes: {
    root: '11.5px',
    toolTip: '11px',
  },
  sizes: {
    titleBarHeight: '0px',
    rootWidth: '340px',
    controlWidth: '180px',
    rowHeight: '26px',
    folderTitleHeight: '30px',
    numberInputMinWidth: '38px',
  },
  space: {
    sm: '6px',
    md: '10px',
    rowGap: '6px',
    colGap: '8px',
  },
  radii: {
    xs: '2px',
    sm: '2px',
    lg: '3px',
  },
  borderWidths: {
    root: '0px',
    input: '1px',
    focus: '1px',
    hover: '1px',
    active: '1px',
    folder: '1px',
  },
  shadows: {
    level1: 'none',
    level2: 'none',
  },
};

export default function App() {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--paper)' }}>
      <Topbar />

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

      <ValidationPanel />
      <StatusBar />

      <section className="sg-stage">
        <div className="sg-stage__badge">
          <span className="sg-stage__badge-dot" />
          WIDOK 3D · PODGLĄD NA ŻYWO
        </div>
        <Canvas
          camera={{ position: [3200, 1800, 3200], fov: 40, near: 1, far: 20000 }}
          shadows
          gl={{ preserveDrawingBuffer: true, antialias: true }}
          style={{ position: 'absolute', inset: 0 }}
        >
          <SceneEnvironment />
          <CameraRig />
          <Stair />
          <ExportListener />
          <OrbitControls target={[0, 1500, 0]} maxDistance={10000} />
          <gridHelper args={[4000, 40, '#c9c4b8', '#e8e4d8']} />
        </Canvas>
      </section>
    </div>
  );
}
