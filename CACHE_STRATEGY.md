# Estrategia de Cache - Ciudad de Sombras

## Descripción General
Se ha implementado una estrategia de cache multinivel para optimizar la velocidad de navegación y reducir el consumo de ancho de banda.

## Componentes Implementados

### 1. Service Worker (`sw.js`)
**Propósito:** Cachear recursos locales y manejar solicitudes de red inteligentemente.

**Estrategias:**
- **Cache First (para recursos estáticos):** CSS, JS, imágenes
  - Primero busca en el cache local
  - Si no encuentra, hace la solicitud a la red
  - Almacena el resultado para futuras visitas

- **Network First (para iframes de Ivoox):** 
  - Intenta obtener del servidor primero
  - Si falla, usa la versión en cache
  - Permite reproducción offline de audio previamente visitado

- **Stale While Revalidate (para fonts):**
  - Devuelve recurso en cache inmediatamente
  - Actualiza en background para próxima visita

**Versión de Cache:** `ciudad-sombras-v1`
- Cuando necesites invalidar el cache, cambia el número de versión en `sw.js`

### 2. HTTP Cache Headers (`.htaccess`)
**Propósito:** Configurar cache del navegador a través de headers HTTP.

**Estrategia de Expiry:**
| Tipo de Recurso | TTL | Razón |
|---|---|---|
| HTML | 1 hora | Permite actualizaciones frecuentes |
| CSS/JS | 30 días | Cambios menos frecuentes |
| Imágenes | 60 días | Raramente cambian |
| Fonts | 1 año | Prácticamente estáticas |
| Service Worker | No cachear | Siempre obtener versión más reciente |

**Compresión Gzip:**
- Automáticamente comprime HTML, CSS, JS
- Reduce tamaño de transferencia hasta 70%

### 3. Lazy Loading de iframes (`cache-manager.js`)
**Propósito:** Cargar iframes solo cuando son visibles en pantalla.

**Características:**
- Usa `IntersectionObserver` API (navegadores modernos)
- Carga iframes cuando están a 50px del viewport
- Fallback para navegadores sin soporte
- Los iframes tienen atributo `loading="lazy"` como respaldo

**Beneficio:** 
- Reduce carga inicial de la página
- Mejora tiempo de First Contentful Paint (FCP)

### 4. Preload y DNS Prefetch (`cache-manager.js`)
**Propósito:** Optimizar carga de recursos críticos y conexiones externas.

**Recursos Precargados:**
- Bootstrap.min.css
- style.css
- jquery.min.js
- bootstrap.min.js

**DNS Prefetch para:**
- fonts.googleapis.com
- kit.fontawesome.com
- www.ivoox.com
- maps.google.com

### 5. Link Prefetch
**Propósito:** Precargar páginas HTML probables a visitar.

Usa `requestIdleCallback` para no afectar performance en conexiones lentas.

## Cómo Funciona el Flujo

```
Primera Visita:
1. Navegador descarga index.html
2. Service Worker se registra
3. Cache-manager.js carga recursos críticos
4. iframes se cargan solo si son visibles (lazy loading)
5. Recursos se cachean automáticamente

Visitas Subsecuentes:
1. Service Worker intercepta solicitudes
2. Para archivos estáticos: sirve desde cache (más rápido)
3. Para iframes de Ivoox: intenta red primero, usa cache si falla
4. Headers HTTP validan si el cache está actualizado
```

## Monitoreo y Debugging

### Ver Service Workers Registrados
```javascript
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log(regs);
});
```

### Inspeccionar Cache Storage
En DevTools Chrome:
- Application → Cache Storage → ciudad-sombras-v1

### Limpiar Cache Manualmente
```javascript
caches.delete('ciudad-sombras-v1').then(() => {
  console.log('Cache limpiado');
});
```

## Invalidar Cache

Si necesitas que los usuarios descarguen nuevos recursos:

**Opción 1: Cambiar versión de Service Worker**
```javascript
// En sw.js
const CACHE_NAME = 'ciudad-sombras-v2';  // Cambiar de v1 a v2
```

**Opción 2: Cambiar URL de recurso**
```html
<!-- Agregar parámetro query -->
<link rel="stylesheet" href="/css/style.css?v=2">
```

## Medidas de Performance Esperadas

### Antes de la Estrategia:
- Primera visita: ~3-4 segundos (dependiendo de velocidad de red)
- Visitas subsecuentes: ~2-3 segundos

### Después de la Estrategia:
- Primera visita: ~2-3 segundos (mejor uso de caché HTTP)
- Visitas subsecuentes: <1 segundo (desde Service Worker)
- Offline: Página funcional con contenido en cache

## Compatibilidad de Navegadores

| Característica | Soporte |
|---|---|
| Service Workers | Chrome 40+, Firefox 44+, Edge 15+, Safari 11.1+ |
| IntersectionObserver | Chrome 51+, Firefox 55+, Safari 12.1+ |
| requestIdleCallback | Chrome 47+, Firefox 55+, Edge 79+ |
| Fallbacks | Todos los navegadores modernos |

## Mejoras Futuras

- [ ] Implementar Cache-Busting más automático
- [ ] Agregar analytics de hits/misses de cache
- [ ] Optimizar tamaño de iframes embed
- [ ] Implementar compression de imágenes
- [ ] Agregar Critical CSS inline
- [ ] Implementar Image optimization con WebP

## Referencias

- [MDN: Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [MDN: IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [HTTP Caching Best Practices](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/http-caching)
