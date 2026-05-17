const CACHE = 'gymtracker-v1';

const FILES = [
  '/',
  '/index.html',
  '/style.css',
  '/js/core.js',
  '/js/ui.js',
  '/js/defaults.js',
  '/js/routines.js',
  '/js/workout.js',
  '/js/stats.js',
  '/js/trainer.js',
  'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.44.0/tabler-icons.min.css'
];

// Instalar: cachear todos los archivos
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(FILES))
  );
  self.skipWaiting();
});

// Activar: limpiar caches antiguos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: cache-first para assets locales, network-first para la API
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Llamadas a APIs de IA — siempre red, nunca cachear
  if (url.hostname.includes('openrouter.ai') ||
      url.hostname.includes('groq.com') ||
      url.hostname.includes('anthropic.com') ||
      url.hostname.includes('googleapis.com')) {
    return; // deja pasar sin interceptar
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        // Cachear respuestas válidas de nuestros assets
        if (res && res.status === 200 && res.type !== 'opaque') {
          const clone = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return res;
      }).catch(() => {
        // Sin red y sin cache — devolver index.html como fallback
        if (e.request.destination === 'document') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
