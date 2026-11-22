import { openDB } from 'idb';

let dbp;
const db = () =>
  (dbp ??= openDB('handheld-arcade', 2, {
    upgrade(d) {
      if (!d.objectStoreNames.contains('games')) d.createObjectStore('games', { keyPath: 'id' });
      if (!d.objectStoreNames.contains('files')) d.createObjectStore('files'); // id -> { file, extras }
      if (!d.objectStoreNames.contains('states')) d.createObjectStore('states', { keyPath: 'key' }); // `${gameId}:${slot}`
    },
  }));

export async function addGame({ name, system, fileName, file, extras = [] }) {
  const id = crypto.randomUUID();
  const d = await db();
  const tx = d.transaction(['games', 'files'], 'readwrite');
  tx.objectStore('games').put({ id, name, system, fileName, size: file.size + extras.reduce((a, e) => a + e.blob.size, 0), cover: null, addedAt: Date.now() });
  tx.objectStore('files').put({ file, extras }, id);
  await tx.done;
  return id;
}

export async function listGames() {
  const all = await (await db()).getAll('games');
  return all.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getGameFiles(id) {
  const d = await db();
  const [meta, files] = await Promise.all([d.get('games', id), d.get('files', id)]);
  return meta && files ? { meta, ...files } : null;
}

export async function updateGame(id, patch) {
  const d = await db();
  const g = await d.get('games', id);
  if (g) await d.put('games', { ...g, ...patch });
}

export async function removeGame(id) {
  const d = await db();
  const tx = d.transaction(['games', 'files', 'states'], 'readwrite');
  tx.objectStore('games').delete(id);
  tx.objectStore('files').delete(id);
  for (const s of await tx.objectStore('states').getAll()) if (s.gameId === id) tx.objectStore('states').delete(s.key);
  await tx.done;
}

// ---- save states (kept per game and slot) ----
export async function putState(gameId, slot, state) {
  await (await db()).put('states', { key: `${gameId}:${slot}`, gameId, slot: String(slot), state, savedAt: Date.now() });
}

export async function getState(gameId, slot) {
  return (await (await db()).get('states', `${gameId}:${slot}`)) ?? null;
}

export async function listStates(gameId) {
  const all = await (await db()).getAll('states');
  return all.filter((s) => s.gameId === gameId).sort((a, b) => a.slot.localeCompare(b.slot));
}

export async function stateCounts() {
  const counts = {};
  for (const s of await (await db()).getAll('states')) counts[s.gameId] = (counts[s.gameId] || 0) + 1;
  return counts;
}
