import { useEffect, useState } from 'react';
import { ACTIONS, keyFor, loadUserControls, saveUserControls } from './controls.js';
import { KEYMAP } from './keymap.js';

const ALL = ACTIONS.flatMap((g) => g.items.map(([i]) => i));

export default function ControlsPanel({ onClose }) {
  const [keys, setKeys] = useState(() => loadUserControls().keys);
  const [listening, setListening] = useState(null); // action index being rebound
  const [note, setNote] = useState('');

  const commit = (next) => { setKeys(next); saveUserControls(next); };

  useEffect(() => {
    if (listening == null) return;
    const onKey = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.key === 'Escape') return setListening(null);
      const name = KEYMAP[e.keyCode];
      if (!name) return setNote("That key can't be used. Try another.");
      // If another action already uses this key, swap the two bindings.
      const clash = ALL.find((i) => i !== listening && keyFor(i, keys) === name);
      const next = { ...keys, [listening]: name };
      if (clash != null) {
        next[clash] = keyFor(listening, keys);
        setNote(`"${name}" was used by another action, so the two were swapped.`);
      } else setNote('');
      commit(next);
      setListening(null);
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [listening, keys]);

  useEffect(() => {
    const onEsc = (e) => e.key === 'Escape' && listening == null && onClose();
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [listening, onClose]);

  return (
    <div className="modal" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="panel">
        <div className="panel-head">
          <h2>Keyboard controls</h2>
          <button onClick={onClose}>✕</button>
        </div>
        <p className="hint">Click a key, then press the new one. Applies to every game. Gamepad bindings are unchanged.</p>
        <div className="groups">
          {ACTIONS.map((g) => (
            <section key={g.group}>
              <h3>{g.group}</h3>
              {g.items.map(([idx, label]) => (
                <div className="bind" key={idx}>
                  <span>{label}</span>
                  <button className={listening === idx ? 'on' : ''} onClick={() => { setNote(''); setListening(idx); }}>
                    {listening === idx ? 'Press a key…' : keyFor(idx, keys).toUpperCase()}
                  </button>
                </div>
              ))}
            </section>
          ))}
        </div>
        {note && <p className="hint warn">{note}</p>}
        <div className="panel-foot">
          <button className="danger" onClick={() => { commit({}); setNote('Reset to the default WASD layout.'); }}>Reset to defaults</button>
          <button className="primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}
