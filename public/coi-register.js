// If the host didn't send COOP/COEP headers, install the service worker and reload once.
(function () {
  if (window.crossOriginIsolated || !window.isSecureContext || !('serviceWorker' in navigator)) return;
  var KEY = 'coi-reloaded';
  try { if (sessionStorage.getItem(KEY)) return; } catch (e) { /* ignore */ }
  navigator.serviceWorker.register('/coi-sw.js').then(function (reg) {
    var go = function () {
      try { sessionStorage.setItem(KEY, '1'); } catch (e) { /* ignore */ }
      location.reload();
    };
    if (reg.active && navigator.serviceWorker.controller) return go();
    navigator.serviceWorker.addEventListener('controllerchange', go);
  }).catch(function (e) { console.warn('coi service worker failed', e); });
})();
