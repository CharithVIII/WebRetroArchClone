import { getGameFiles, getState, putState } from './db.js';
import { SYSTEMS, extOf } from './systems.js';
import { envProblems } from './env.js';
import { buildControls, loadUserControls } from './controls.js';

const $ = (id) => document.getElementById(id);
const BASE = '/emulatorjs/data/';

function fail(title, items) {
  $('status').classList.add('hide');
  const err = $('error');
  err.hidden = false;
  err.innerHTML = '';
  const h = document.createElement('h2');
  h.textContent = title;
  const ul = document.createElement('ul');
  for (const i of [].concat(items)) {
    const li = document.createElement('li');
    li.textContent = i;
    ul.append(li);
  }
  err.append(h, ul);
}

// EmulatorJS remembers each game's controls, which would hide later changes made in the library's
// Controls panel. When that panel was edited after this game last applied it, push the new keys in.
function applyUserControls(gameId) {
  const { keys, stamp } = loadUserControls();
  const flag = `ha-controls-applied:${gameId}`;
  try {
    if (!stamp || stamp <= Number(localStorage.getItem(flag) || 0)) return;
    const E = window.EJS_emulator;
    const built = buildControls(keys);
    for (const [idx, c] of Object.entries(built[0])) if (E.controls[0][idx]) E.controls[0][idx].value = c.value;
    E.setupKeys();
    E.checkGamepadInputs();
    E.saveSettings();
    localStorage.setItem(flag, String(Date.now()));
  } catch (e) {
    console.warn('Could not apply custom controls', e);
  }
}

async function main() {
  const id = new URLSearchParams(location.search).get('id');
  if (!id) return fail('No game selected', 'Open this page from the library (play.html?id=...).');

  const rec = await getGameFiles(id);
  if (!rec) return fail('Game not found', 'It may have been removed from this browser storage.');
  const sys = SYSTEMS[rec.meta.system];

  if (sys.isolated) {
    const problems = envProblems();
    if (problems.length) return fail(`${sys.label} can't run here`, problems);
  }

  // Dev servers fall back to index.html for missing files, so check it is really JS.
  try {
    const r = await fetch(BASE + 'loader.js');
    const t = r.ok ? await r.text() : '';
    if (!r.ok || t.trimStart().startsWith('<')) throw new Error('missing');
  } catch {
    return fail('EmulatorJS not found', [
      `Expected the self-hosted EmulatorJS data folder at public${BASE} (so ${BASE}loader.js exists).`,
      'See public/emulatorjs/README.md for setup.',
    ]);
  }

  // A cue sheet can't be loaded alone from a blob; use the single BIN when there is exactly one.
  let blob = rec.file;
  let name = rec.meta.fileName;
  if (extOf(name) === 'cue') {
    if (rec.extras.length === 1) {
      blob = rec.extras[0].blob;
      name = rec.extras[0].name;
    } else if (rec.extras.length === 0) {
      return fail('Missing BIN', 'This .cue was imported without its .bin file(s). Remove it and re-import both together.');
    } else {
      return fail('Multi-BIN disc not supported', 'Convert this disc to a single .chd (chdman createcd) or merge the tracks into one .bin, then re-import.');
    }
  }

  const url = URL.createObjectURL(blob);
  Object.assign(window, {
    EJS_player: '#game',
    EJS_core: sys.core,
    EJS_gameUrl: url,
    EJS_gameName: name,
    EJS_pathtodata: BASE,
    EJS_threads: sys.threads,
    EJS_defaultControls: buildControls(),
    EJS_startOnLoaded: true,
    EJS_color: '#6c8cff',
    EJS_onGameStart: () => {
      $('status').classList.add('hide');
      applyUserControls(id);
    },
    // Save states go to the app's own database (per game + slot) instead of EmulatorJS's storage.
    // Registering these handlers replaces EmulatorJS's default save/load behaviour.
    EJS_onSaveState: async ({ state }) => {
      const slot = window.EJS_emulator.getSettingValue?.('save-state-slot') || '1';
      await putState(id, slot, state);
      window.EJS_emulator.displayMessage(`STATE SAVED (SLOT ${slot})`);
    },
    EJS_onLoadState: async () => {
      const slot = window.EJS_emulator.getSettingValue?.('save-state-slot') || '1';
      const rec = await getState(id, slot);
      if (!rec) return window.EJS_emulator.displayMessage(`NO SAVED STATE IN SLOT ${slot}`);
      window.EJS_emulator.gameManager.loadState(rec.state);
      window.EJS_emulator.displayMessage(`STATE LOADED (SLOT ${slot})`);
    },
  });
  $('status').textContent = `Starting ${rec.meta.name}...`;

  const s = document.createElement('script');
  s.src = BASE + 'loader.js';
  s.onerror = () => fail('Failed to load EmulatorJS', 'loader.js could not be loaded.');
  document.body.append(s);
}

main().catch((e) => fail('Unexpected error', String(e?.message || e)));
