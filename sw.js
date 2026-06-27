const CACHE_NAME = 'ciudad-sombras-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/bootstrap.min.css',
  '/css/owl.carousel.css',
  '/css/owl.theme.css',
  '/css/magnific-popup.css',
  '/css/superslides.css',
  '/css/style.css',
  '/js/jquery.min.js',
  '/js/jquery.superslides.js',
  '/js/waypoints.min.js',
  '/js/bootstrap.min.js',
  '/js/owl.carousel.min.js',
  '/js/bootstrap-hover-dropdown.min.js',
  '/js/validator.min.js',
  '/js/form-scripts.js',
  '/js/jquery.magnific-popup.min.js',
  '/js/script.js',
  '/js/modernizr.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.log('Cache addAll error:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    return;
  }

  if (url.origin !== location.origin) {
    event.respondWith(fetch(request));
    return;
  }

  if (request.url.includes('.woff') ||
      request.url.includes('.woff2') ||
      request.url.includes('.ttf')) {
    event.respondWith(
      caches.match(request).then(response => {
        return response || fetch(request).then(response => {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, clonedResponse);
          });
          return response;
        });
      }).catch(() => new Response('', { status: 404 }))
    );
    return;
  }

  if (request.url.includes('ivoox.com')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, clonedResponse);
          });
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  if (request.url.endsWith('.html')) {
    event.respondWith(
      fetch(request).then(response => {
        const clonedResponse = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, clonedResponse);
        });
        return response;
      }).catch(() => caches.match(request))
    );
    return;
  }

  if (request.url.endsWith('.css') ||
      request.url.endsWith('.js') ||
      request.url.match(/\.(png|jpg|jpeg|svg|gif|webp)$/i)) {
    event.respondWith(
      caches.match(request).then(response => {
        return response || fetch(request).then(response => {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, clonedResponse);
          });
          return response;
        });
      })
    );
  } else {
    event.respondWith(
      fetch(request).then(response => {
        const clonedResponse = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, clonedResponse);
        });
        return response;
      }).catch(() => caches.match(request))
    );
  }
});
