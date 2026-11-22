import { useCallback, useEffect, useRef, useState } from 'react';
import { listGames, removeGame, updateGame, stateCounts } from './db.js';
import { exportStatesJson, importStatesJson } from './saveJson.js';
import { importFiles } from './importFiles.js';
import { ACCEPT, SYSTEMS } from './systems.js';
import { envProblems } from './env.js';

function Cover({ blob, label }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    if (!blob) return setUrl(null);
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  return url ? <img src={url} alt="" /> : <span className="ph">{label}</span>;
}

const fmt = (b) => (b > 1e9 ? (b / 1e9).toFixed(2) + ' GB' : (b / 1e6).toFixed(1) + ' MB');

export default function App() {
  const [games, setGames] = useState([]);
  const [counts, setCounts] = useState({});
  const [filter, setFilter] = useState('all');
  const [playing, setPlaying] = useState(null);
  const [drag, setDrag] = useState(false);
  const [msg, setMsg] = useState('');
  const picker = useRef(null);
  const problems = envProblems();

  const refresh = useCallback(async () => {
    setGames(await listGames());
    setCounts(await stateCounts());
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setPlaying(null);
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, []);

  async function doImport(files) {
    if (!files?.length) return;
    setMsg('Importing…');
    try {
      const { added, skipped } = await importFiles(files);
      setMsg(`Added ${added.length}${skipped.length ? `, skipped ${skipped.length} unsupported (${skipped.join(', ')})` : ''}.`);
    } catch (e) {
      setMsg('Import failed: ' + e.message);
    }
    refresh();
  }

  useEffect(() => { if (!playing) refresh(); }, [playing, refresh]);

  const shown = games.filter((g) => filter === 'all' || g.system === filter);

  return (
    <div
      className={'app' + (drag ? ' drag' : '')}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={(e) => e.currentTarget === e.target && setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); doImport(e.dataTransfer.files); }}
    >
      <header>
        <h1>Handheld Arcade</h1>
        <div className="tabs">
          {['all', ...Object.keys(SYSTEMS)].map((s) => (
            <button key={s} className={filter === s ? 'on' : ''} onClick={() => setFilter(s)}>
              {s === 'all' ? 'All' : SYSTEMS[s].label}
            </button>
          ))}
        </div>
        <button className="primary" onClick={() => picker.current.click()}>Import games</button>
        <input ref={picker} type="file" multiple accept={ACCEPT} hidden
          onChange={(e) => { doImport(e.target.files); e.target.value = ''; }} />
      </header>

      {problems.length > 0 && (
        <div className="banner">
          <strong>PSP and PS1 games can't run in this browser/setup:</strong>
          <ul>{problems.map((p) => <li key={p}>{p}</li>)}</ul>
          NES games don't need isolation and still work.
        </div>
      )}
      {msg && <p className="msg">{msg}</p>}

      {shown.length === 0 ? (
        <div className="empty">Drag &amp; drop your own PSP (.iso .cso .pbp), PS1 (.cue .bin .chd) or NES (.nes) files here.<br />Drop a .cue together with its .bin files. Nothing leaves your machine.</div>
      ) : (
        <div className="grid">
          {shown.map((g) => (
            <article key={g.id} className="card">
              <button className="art" onClick={() => setPlaying(g.id)} title="Play">
                <Cover blob={g.cover} label={g.name} />
                <span className="play">▶</span>
              </button>
              <h3 title={g.fileName}>{g.name}</h3>
              <small>{fmt(g.size)}</small>
              <div className="row">
                <select value={g.system} onChange={async (e) => { await updateGame(g.id, { system: e.target.value }); refresh(); }}>
                  {Object.values(SYSTEMS).map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <label className="btn">Cover
                  <input type="file" accept="image/*" hidden onChange={async (e) => {
                    const f = e.target.files[0];
                    if (f) { await updateGame(g.id, { cover: f }); refresh(); }
                  }} />
                </label>
                {counts[g.id] > 0 && (
                  <button onClick={() => exportStatesJson(g)} title="Download this game's save states as JSON">Saves ⬇ ({counts[g.id]})</button>
                )}
                <label className="btn" title="Import a saves .json for this game">Load saves
                  <input type="file" accept=".json,application/json" hidden onChange={async (e) => {
                    const f = e.target.files[0];
                    e.target.value = '';
                    if (!f) return;
                    try { setMsg(`Imported ${await importStatesJson(g, f)} save state(s) for ${g.name}.`); }
                    catch (err) { setMsg('Import failed: ' + err.message); }
                    refresh();
                  }} />
                </label>
                <button className="danger" onClick={async () => {
                  if (confirm(`Remove "${g.name}" from the library?`)) { await removeGame(g.id); refresh(); }
                }}>Remove</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {playing && (
        <div className="overlay">
          <iframe title="game" src={`play.html?id=${encodeURIComponent(playing)}`}
            allow="cross-origin-isolated; fullscreen; gamepad; autoplay" allowFullScreen />
          <button className="close" onClick={() => setPlaying(null)}>✕ Exit</button>
        </div>
      )}
    </div>
  );
}
