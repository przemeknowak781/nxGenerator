import { useStairStore } from '../store/useStairStore';
import { computeMetrics } from '../config/metrics';

export function StatusBar() {
  const cfg = useStairStore((s) => s.config);
  const m = computeMetrics(cfg);

  const items: { k: string; v: string; accent?: boolean }[] = [
    { k: 'Wys.',  v: `${cfg.totalHeight} mm` },
    { k: 'Kąt',   v: `${cfg.sweepAngle}°` },
    { k: 'Stopni', v: String(cfg.stepCount) },
    { k: 'Rise',  v: `${m.riseHeight.toFixed(0)} mm` },
    { k: 'Walk',  v: `${m.walklineDepth.toFixed(0)} mm` },
    { k: 'Szer.', v: `${m.effectiveWidth.toFixed(0)} mm` },
    { k: '2h+s',  v: m.blondel.toFixed(0), accent: true },
  ];

  return (
    <footer className="sg-statusbar">
      {items.map(({ k, v, accent }) => (
        <div className="sg-stat" key={k}>
          <span className="sg-stat__k">{k}</span>
          <span className={`sg-stat__v${accent ? ' sg-stat__v--accent' : ''}`}>{v}</span>
        </div>
      ))}
      <div className="sg-statusbar__spacer" />
      <span className="sg-statusbar__meta">mm · ° · PL-WT-2019</span>
    </footer>
  );
}
