// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registered:', registration);

        // Check for updates periodically (every hour)
        setInterval(() => {
          registration.update();
        }, 3600000);
      })
      .catch(error => {
        console.log('Service Worker registration failed:', error);
      });
  });
}

// Lazy Load iframes
function initLazyLoadIframes() {
  const iframes = document.querySelectorAll('iframe[data-src]');

  if ('IntersectionObserver' in window) {
    const iframeObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const iframe = entry.target;
          iframe.src = iframe.dataset.src;
          iframe.removeAttribute('data-src');
          observer.unobserve(iframe);
        }
      });
    }, {
      rootMargin: '50px'
    });

    iframes.forEach(iframe => {
      iframeObserver.observe(iframe);
    });
  } else {
    // Fallback for browsers without IntersectionObserver
    iframes.forEach(iframe => {
      iframe.src = iframe.dataset.src;
      iframe.removeAttribute('data-src');
    });
  }
}

// Preload critical resources
function preloadCriticalResources() {
  const criticalResources = [
    { rel: 'preload', as: 'style', href: '/css/bootstrap.min.css' },
    { rel: 'preload', as: 'style', href: '/css/style.css' },
    { rel: 'preload', as: 'script', href: '/js/jquery.min.js' },
    { rel: 'preload', as: 'script', href: '/js/bootstrap.min.js' }
  ];

  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = resource.rel;
    link.as = resource.as;
    link.href = resource.href;
    document.head.appendChild(link);
  });
}

// DNS Prefetch for external resources
function initDNSPrefetch() {
  const externalDomains = [
    'https://fonts.googleapis.com',
    'https://kit.fontawesome.com',
    'https://www.ivoox.com',
    'https://maps.google.com'
  ];

  externalDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = domain;
    document.head.appendChild(link);
  });
}

// Prefetch next page links
function prefetchLinks() {
  const links = document.querySelectorAll('a[href$=".html"]');

  if ('prefetch' in Link.prototype) {
    links.forEach(link => {
      link.prefetch?.();
    });
  } else if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      links.forEach(link => {
        const prefetchLink = document.createElement('link');
        prefetchLink.rel = 'prefetch';
        prefetchLink.href = link.href;
        document.head.appendChild(prefetchLink);
      });
    });
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initLazyLoadIframes();
  preloadCriticalResources();
  initDNSPrefetch();
  prefetchLinks();
});

// Cache API cleanup for older caches
if ('caches' in window) {
  caches.keys().then(cacheNames => {
    cacheNames.forEach(cacheName => {
      if (cacheName.startsWith('ciudad-sombras-') && cacheName !== 'ciudad-sombras-v1') {
        caches.delete(cacheName);
      }
    });
  });
}
