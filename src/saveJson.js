import { listStates, putState } from './db.js';

const FORMAT = 'handheld-arcade-states';

function toBase64(bytes) {
  let out = '';
  for (let i = 0; i < bytes.length; i += 0x8000) out += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(out);
}
const fromBase64 = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

export async function exportStatesJson(game) {
  const states = (await listStates(game.id)).map((s) => ({
    slot: s.slot,
    savedAt: new Date(s.savedAt).toISOString(),
    state: toBase64(s.state),
  }));
  const json = JSON.stringify({ format: FORMAT, version: 1, game: { name: game.name, system: game.system, fileName: game.fileName }, states }, null, 2);
  const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: `${game.name}.states.json` });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function importStatesJson(game, file) {
  const data = JSON.parse(await file.text());
  if (data.format !== FORMAT || !Array.isArray(data.states)) throw new Error('Not a Handheld Arcade save-state file.');
  if (data.game?.system && data.game.system !== game.system) throw new Error(`These states are for ${data.game.system}, this game is ${game.system}.`);
  for (const s of data.states) await putState(game.id, s.slot, fromBase64(s.state));
  return data.states.length;
}
