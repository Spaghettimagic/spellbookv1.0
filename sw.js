const CACHE_NAME = 'spellbook-v1.0';
const STATIC_CACHE = 'spellbook-static-v1.0';
const DYNAMIC_CACHE = 'spellbook-dynamic-v1.0';

// Risorse statiche da precaricare
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/css/tokens.css',
  './assets/css/base.css',
  './assets/js/core/utils.js',
  './assets/js/core/state.js',
  './assets/js/core/ui.js',
  './assets/js/core/search.js',
  './assets/js/core/search-ui.js',
  './home.js',
  './effects/index.html','./effects/list.js','./effects/details.html','./effects/details.js','./effects/add.html','./effects/add.js',
  './routine/index.html','./routine/routine.js',
  './show/index.html','./show/show.js',
  './practice/index.html','./practice/practice.js',
  './settings/index.html','./settings/settings.js',
  './assets/img/favicon.svg'
];

// Pagine di fallback
const FALLBACK_HTML = `
<!DOCTYPE html>
<html lang="it" data-theme="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <title>Offline — Spellbook</title>
  <link rel="stylesheet" href="./assets/css/tokens.css">
  <link rel="stylesheet" href="./assets/css/base.css">
</head>
<body>
  <main class="wrap" style="display:flex;align-items:center;justify-content:center;min-height:80vh">
    <div class="surface stack" style="text-align:center;padding:32px;max-width:400px">
      <h1>Offline</h1>
      <p>Sei offline e questa pagina non è disponibile nella cache.</p>
      <p>Verifica la connessione e riprova.</p>
      <a href="./index.html" class="btn btn-primary">Torna alla home</a>
    </div>
  </main>
</body>
</html>
`;

// Installa il service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        // Precarica tutte le risorse statiche
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // Crea cache per la pagina fallback
        return caches.open(DYNAMIC_CACHE).then(cache => {
          return cache.put(
            new Request('offline.html'),
            new Response(FALLBACK_HTML, {
              headers: { 'Content-Type': 'text/html' }
            })
          );
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Attiva il service worker
self.addEventListener('activate', event => {
  // Rimuovi le vecchie cache
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Gestione richieste fetch
self.addEventListener('fetch', event => {
  const request = event.request;
  
  // Ignora richieste diverse da GET
  if (request.method !== 'GET') {
    return;
  }
  
  // URL della richiesta
  const requestUrl = new URL(request.url);
  
  // Strategia: Cache con fallback alla rete per le risorse statiche
  if (STATIC_ASSETS.some(asset => 
      requestUrl.pathname.endsWith(asset) || asset === requestUrl.pathname)) {
    event.respondWith(
      caches.match(request)
        .then(cachedResponse => {
          // Verifica se è nella cache
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Altrimenti, vai in rete
          return fetch(request)
            .then(response => {
              // Salva una copia nella cache
              const responseClone = response.clone();
              caches.open(STATIC_CACHE).then(cache => {
                cache.put(request, responseClone);
              });
              return response;
            })
            .catch(() => {
              // Se la rete fallisce e la richiesta è per una pagina HTML
              if (request.headers.get('accept').includes('text/html')) {
                return caches.match('offline.html');
              }
            });
        })
    );
  } 
  // Strategia: Rete con cache di fallback per il resto
  else {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Solo se l'utente ha attivato la modalità offline, salva tutto
          const offlinePref = self.localStorage ? 
            localStorage.getItem('ms.offline') || 'on' : 'on';
            
          if (offlinePref === 'on') {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(request, responseClone);
            }).catch(() => {});
          }
          return response;
        })
        .catch(() => {
          return caches.match(request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              // Se la richiesta è per una pagina HTML
              if (request.headers.get('accept').includes('text/html')) {
                return caches.match('offline.html');
              }
              
              return null;
            });
        })
    );
  }
});

// Sincronizzazione in background
self.addEventListener('sync', event => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// Gestione notifiche push
self.addEventListener('push', event => {
  const notificationPref = self.localStorage ? 
    localStorage.getItem('ms.notifications') || 'on' : 'on';
    
  if (notificationPref === 'on' && event.data) {
    const data = event.data.json();
    
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: './assets/img/favicon.svg',
        badge: './assets/img/favicon.svg',
        vibrate: [100, 50, 100],
        data: data.url ? { url: data.url } : null
      })
    );
  }
});

// Gestisce il click sulle notifiche
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  } else {
    event.waitUntil(
      clients.openWindow('.')
    );
  }
});

// Funzione per sincronizzare dati in background
async function syncData() {
  // Qui implementare la sincronizzazione con un backend
  // Per ora è solo uno stub dato che l'app è completamente client-side
  return Promise.resolve();
}