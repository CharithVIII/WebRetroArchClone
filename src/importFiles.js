import { guessSystem, extOf, stripExt } from './systems.js';
import { addGame } from './db.js';

/** Turns dropped files into library entries. CUE sheets claim the BINs they reference. */
export async function importFiles(fileList) {
  const files = [...fileList];
  const used = new Set();
  const added = [];
  const skipped = [];

  for (const cue of files.filter((f) => extOf(f.name) === 'cue')) {
    const text = await cue.text();
    const refs = [...text.matchAll(/FILE\s+"([^"]+)"/gi)].map((m) => m[1].split(/[\/]/).pop().toLowerCase());
    const bins = files.filter((f) => refs.includes(f.name.toLowerCase()));
    bins.forEach((b) => used.add(b));
    used.add(cue);
    await addGame({
      name: stripExt(cue.name), system: 'psx', fileName: cue.name, file: cue,
      extras: bins.map((b) => ({ name: b.name, blob: b })),
    });
    added.push(cue.name);
  }

  for (const f of files) {
    if (used.has(f)) continue;
    const system = guessSystem(f.name);
    if (!system) { skipped.push(f.name); continue; }
    await addGame({ name: stripExt(f.name), system, fileName: f.name, file: f });
    added.push(f.name);
  }
  return { added, skipped };
}
