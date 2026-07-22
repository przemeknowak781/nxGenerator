import { useEffect, useRef, useState } from 'react';
import type { PresetRef } from '@nxgen/configurator-core';

export interface PresetPickerProps {
  presets: PresetRef[];
  onPick: (id: string) => void;
  label?: string;
}

/** Dropdown preset library. Domain supplies the list + the apply callback. */
export function PresetPicker({ presets, onPick, label = 'Preset' }: PresetPickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div className="sg-preset" ref={rootRef}>
      <button className="sg-btn" onClick={() => setOpen((v) => !v)}>
        <span>{label}</span>
        <span className="sg-btn__caret" />
      </button>
      {open && (
        <div className="sg-preset__menu" role="listbox">
          <div className="sg-preset__header">
            <div className="sg-kicker">Biblioteka · {presets.length} ustawień</div>
          </div>
          {presets.map((p, i) => (
            <div
              key={p.id}
              role="option"
              aria-selected="false"
              className="sg-preset__item"
              onClick={() => {
                onPick(p.id);
                setOpen(false);
              }}
            >
              <span className="sg-preset__index">{String(i + 1).padStart(2, '0')}</span>
              <span>{p.label}</span>
              <span className="sg-preset__arrow">›</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
