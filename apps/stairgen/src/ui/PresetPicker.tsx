import { useEffect, useRef, useState } from 'react';
import { useStairStore } from '../store/useStairStore';
import { PRESET_LIST, applyPreset } from '../config/presets';

export function PresetPicker() {
  const [open, setOpen] = useState(false);
  const applyPresetFn = useStairStore((s) => s.applyPreset);
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
        <span>Preset</span>
        <span className="sg-btn__caret" />
      </button>
      {open && (
        <div className="sg-preset__menu" role="listbox">
          <div className="sg-preset__header">
            <div className="sg-kicker">Biblioteka · {PRESET_LIST.length} ustawień</div>
          </div>
          {PRESET_LIST.map((p, i) => (
            <div
              key={p.id}
              role="option"
              aria-selected="false"
              className="sg-preset__item"
              onClick={() => {
                const base = useStairStore.getState().config;
                const merged = applyPreset(base, p.id);
                applyPresetFn(merged);
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
