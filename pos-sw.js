// Kadima Caja · guarda la app en el equipo para abrirla sin internet
const CACHE = 'kadima-caja-v16';
const APP = [
  'caja.html',
  'cocina.html',
  'cocina-manifest.webmanifest',
  'pos-manifest.webmanifest',
  'pos-icon-192.png',
  'pos-icon-512.png',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.79.0/dist/umd/supabase.js',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(APP)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k.startsWith('kadima-caja-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// Solo atiende los archivos de la app; los datos (Supabase) siempre van a internet.
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const esApp = APP.some(a => url.href === new URL(a, self.registration.scope).href) ||
                (url.origin === location.origin && (url.pathname.endsWith('/caja.html') || url.pathname.endsWith('/cocina.html')));
  if (e.request.method !== 'GET' || !esApp) return;
  // primero internet (para recibir actualizaciones); si no hay, la copia guardada
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok) { const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
