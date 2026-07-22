import { useMemo } from 'react';
import { useStairStore } from '../store/useStairStore';
import { validate } from '../config/validators';
import type { Severity } from '../config/types';

const COLORS: Record<Severity, string> = {
  error: 'var(--err)',
  warn:  'var(--warn)',
  info:  'var(--subtle)',
};

const LABELS: Record<Severity, string> = {
  error: 'Błąd',
  warn:  'Ostrzeżenie',
  info:  'Informacja',
};

export function ValidationPanel() {
  const cfg = useStairStore((s) => s.config);
  const issues = useMemo(() => validate(cfg), [cfg]);

  const counts = issues.reduce(
    (acc, i) => ((acc[i.severity] = (acc[i.severity] ?? 0) + 1), acc),
    {} as Record<Severity, number>,
  );

  return (
    <aside className="sg-right">
      <div className="sg-right__head">
        <div>
          <div className="sg-kicker" style={{ marginBottom: 4 }}>Audyt WT · 2019</div>
          <div className="sg-right__title">Zgodność</div>
        </div>
        <div className="sg-right__stat">
          {issues.length === 0 ? 'OK' : `${issues.length} UWAG`}
        </div>
      </div>

      <div className="sg-right__body">
        {issues.length === 0 && (
          <div className="sg-empty">
            <div className="sg-empty__check">✓</div>
            <div>Wszystkie reguły spełnione</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: 0.4 }}>
              Projekt gotowy do eksportu
            </div>
          </div>
        )}

        {issues.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, fontFamily: 'var(--font-mono)', fontSize: 10 }}>
            {(['error','warn','info'] as const).map((s) =>
              counts[s] ? (
                <span
                  key={s}
                  style={{
                    padding: '3px 8px',
                    background: s === 'error' ? 'var(--err-soft)' : s === 'warn' ? 'var(--warn-soft)' : 'var(--paper-warm)',
                    color: s === 'error' ? 'var(--err)' : s === 'warn' ? 'var(--warn)' : 'var(--muted)',
                    borderRadius: 2,
                    fontWeight: 600,
                    letterSpacing: 0.08,
                    textTransform: 'uppercase',
                  }}
                >
                  {s} · {counts[s]}
                </span>
              ) : null,
            )}
          </div>
        )}

        {issues.map((i) => (
          <div key={i.id} className="sg-issue" data-sev={i.severity}>
            <div className="sg-issue__tag" style={{ color: COLORS[i.severity] }}>
              <span className="sg-issue__dot" style={{ background: COLORS[i.severity] }} />
              {LABELS[i.severity]} · {i.rule}
            </div>
            <div className="sg-issue__msg">{i.message}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}
