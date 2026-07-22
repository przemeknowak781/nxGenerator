import type { ReactNode } from 'react';

export interface TopbarProps {
  /** Brand mark (e.g. `stair<em>gen</em>`). */
  brand: ReactNode;
  tagline: string;
  /** Optional engine/status pill. */
  badge?: string;
  /** Right-aligned action slot (preset picker, export button…). */
  children?: ReactNode;
}

/** Application top bar: brand + tagline, optional status pill, action slot. */
export function Topbar({ brand, tagline, badge, children }: TopbarProps) {
  return (
    <header className="sg-topbar">
      <div className="sg-brand">
        <div className="sg-brand__mark">{brand}</div>
        <div className="sg-brand__tag">{tagline}</div>
      </div>

      {badge && (
        <div className="sg-topbar__pill" title="Stan silnika geometrii">
          <span className="sg-topbar__pill-dot" />
          {badge}
        </div>
      )}

      <div style={{ flex: 1 }} />
      {children}
    </header>
  );
}
