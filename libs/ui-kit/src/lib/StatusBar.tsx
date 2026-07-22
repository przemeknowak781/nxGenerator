export interface StatusItem {
  k: string;
  v: string;
  accent?: boolean;
}

export interface StatusBarProps {
  items: StatusItem[];
  meta?: string;
}

/** Bottom metrics strip. The domain computes the items; the layout is shared. */
export function StatusBar({ items, meta }: StatusBarProps) {
  return (
    <footer className="sg-statusbar">
      {items.map(({ k, v, accent }) => (
        <div className="sg-stat" key={k}>
          <span className="sg-stat__k">{k}</span>
          <span className={`sg-stat__v${accent ? ' sg-stat__v--accent' : ''}`}>{v}</span>
        </div>
      ))}
      <div className="sg-statusbar__spacer" />
      {meta && <span className="sg-statusbar__meta">{meta}</span>}
    </footer>
  );
}
