export function isSafari() {
  const ua = navigator.userAgent;
  const iOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const desktopSafari = /Safari\//.test(ua) && !/Chrome|Chromium|CriOS|FxiOS|Edg|OPR|Android|Firefox/.test(ua);
  return iOS || desktopSafari;
}

/** Returns an array of human-readable problems (empty = OK). */
export function envProblems() {
  const p = [];
  if (isSafari())
    p.push('Safari (and every iOS browser) is not supported: it lacks Cross-Origin-Embedder-Policy "credentialless", which the threaded PSP core needs. Use Chrome, Edge or Firefox 119+ on desktop.');
  if (!window.crossOriginIsolated)
    p.push('crossOriginIsolated is false, so SharedArrayBuffer/threads are unavailable. Run the app via "npm run dev" or "npm run preview" on http://localhost (the COOP/COEP headers come from vite.config.js) and open it directly, not through another server or proxy.');
  return p;
}
