/* Perfektus Timer — service worker: guarda a app no iPhone para funcionar sem internet.
   Para forçar uma atualização depois de alterar o index.html, muda o número da versão. */
const CACHE = 'perfektus-timer-v3';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Responde da cache e, havendo rede, atualiza a cópia em segundo plano. */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(e.request, { ignoreSearch: true }).then(hit => {
        const net = fetch(e.request)
          .then(res => { if (res && res.ok) cache.put(e.request, res.clone()); return res; })
          .catch(() => hit);
        return hit || net;
      })
    )
  );
});
