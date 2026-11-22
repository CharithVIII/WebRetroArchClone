export const SYSTEMS = {
  psp: { id: 'psp', label: 'PSP', core: 'psp', threads: true, isolated: true, exts: ['iso', 'cso', 'pbp'] },
  psx: { id: 'psx', label: 'PS1', core: 'psx', threads: false, isolated: true, exts: ['cue', 'bin', 'chd'] },
  nes: { id: 'nes', label: 'NES', core: 'nes', threads: false, isolated: false, exts: ['nes', 'unf', 'unif'] },
};

export const ACCEPT = Object.values(SYSTEMS).flatMap((s) => s.exts.map((e) => '.' + e)).join(',');

export const extOf = (name) => (name.split('.').pop() || '').toLowerCase();

/** Best guess; .iso is assumed PSP (changeable per game in the UI). */
export function guessSystem(name) {
  const e = extOf(name);
  return Object.values(SYSTEMS).find((s) => s.exts.includes(e))?.id ?? null;
}

export const stripExt = (n) => n.replace(/\.[^.]+$/, '');
