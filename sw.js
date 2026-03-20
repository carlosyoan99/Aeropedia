/**
 * AeroPedia — Service Worker
 * ─────────────────────────────────────────────────────────────────────────────
 * Estrategias de caché:
 *   • Assets estáticos (HTML, CSS, JS, fuentes, iconos)  → Cache-First
 *   • Imágenes externas (Wikimedia, Unsplash)             → Network-First con fallback
 *   • CDN scripts (Tailwind, FA, Chart.js)               → Stale-While-Revalidate
 *
 * Para actualizar la caché basta con cambiar CACHE_VERSION.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const CACHE_VERSION  = 'aeropedia-v1.1';
const STATIC_CACHE   = `${CACHE_VERSION}-static`;
const IMAGE_CACHE    = `${CACHE_VERSION}-images`;
const CDN_CACHE      = `${CACHE_VERSION}-cdn`;

// Assets propios que se cachean en el install
const STATIC_ASSETS = [
    './',
    './index.html',
    './compare.html',
    './favorites.html',
    './mach.html',
    './theater.html',
    './fleets.html',
    './kills.html',
    './styles.css',
    './js/compare.js',
    './js/detail.js',
    './js/filters.js',
    './js/mach.js',
    './js/main.js',
    './js/pages.js',
    './js/pwa.js',
    './js/render.js',
    './js/shorcuts.js',
    './js/state.js',
    './js/theater.js',
    './js/theme.js',
    './js/timeline.js',
    './js/utils.js',
    './data/aircraft.json',
    './data/conflicts.json',
    './data/fleets.json',
    './data/kills.json',
    './manifest.json',
    './icons/icon-72.svg',
    './icons/icon-96.svg',
    './icons/icon-128.svg',
    './icons/icon-192.svg',
    './icons/icon-512.svg',
];

// Dominios CDN que usamos
const CDN_ORIGINS = [
    'cdnjs.cloudflare.com',
    'fonts.googleapis.com',
    'fonts.gstatic.com',
];

// Dominios de imágenes externas
const IMAGE_ORIGINS = [
    'upload.wikimedia.org',
];

// ─────────────────────────────────────────────────────────────────────────────
// INSTALL — precachear assets estáticos
// ─────────────────────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())  // activar sin esperar a que cierren las tabs viejas
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVATE — limpiar cachés antiguas
// ─────────────────────────────────────────────────────────────────────────────
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            const validCaches = [STATIC_CACHE, IMAGE_CACHE, CDN_CACHE];
            return Promise.all(
                keys
                    .filter(key => !validCaches.includes(key))
                    .map(key => {
                        console.log(`[SW] Eliminando caché antigua: ${key}`);
                        return caches.delete(key);
                    })
            );
        }).then(() => self.clients.claim())
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// FETCH — enrutar peticiones según origen
// ─────────────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Ignorar peticiones que no sean GET
    if (request.method !== 'GET') return;

    // Ignorar extensiones de Chrome y similares
    if (!url.protocol.startsWith('http')) return;

    // ── CDN: Stale-While-Revalidate ──────────────────────────────────────────
    if (CDN_ORIGINS.some(origin => url.hostname.includes(origin))) {
        event.respondWith(staleWhileRevalidate(request, CDN_CACHE));
        return;
    }

    // ── Imágenes externas: Network-First con fallback al caché ───────────────
    if (IMAGE_ORIGINS.some(origin => url.hostname.includes(origin))) {
        event.respondWith(networkFirstWithFallback(request, IMAGE_CACHE));
        return;
    }

    // ── Assets propios: Cache-First ──────────────────────────────────────────
    event.respondWith(cacheFirst(request, STATIC_CACHE));
});

// ─────────────────────────────────────────────────────────────────────────────
// ESTRATEGIAS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Cache-First: sirve desde caché si existe, si no va a la red y cachea la respuesta.
 * Ideal para assets propios que cambian poco.
 */
async function cacheFirst(request, cacheName) {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        // Sin red y sin caché: devolver una respuesta de error controlada
        return new Response('// AeroPedia: recurso no disponible sin conexión', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
        });
    }
}

/**
 * Network-First con fallback: intenta la red primero, guarda en caché,
 * y si falla sirve la versión cacheada.
 * Ideal para imágenes que pueden cambiar pero queremos tenerlas offline.
 */
async function networkFirstWithFallback(request, cacheName) {
    try {
        const response = await fetch(request, { cache: 'no-store' });
        if (response.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        const cached = await caches.match(request);
        if (cached) return cached;

        // Fallback: SVG placeholder inline
        return new Response(
            `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">
                <rect width="400" height="200" fill="#1e293b"/>
                <text x="50%" y="45%" text-anchor="middle" fill="#475569" font-family="monospace" font-size="14">
                    SIN SEÑAL
                </text>
                <text x="50%" y="62%" text-anchor="middle" fill="#334155" font-family="monospace" font-size="11">
                    IMAGEN NO DISPONIBLE OFFLINE
                </text>
            </svg>`,
            { status: 200, headers: { 'Content-Type': 'image/svg+xml' } }
        );
    }
}

/**
 * Stale-While-Revalidate: sirve desde caché inmediatamente mientras
 * actualiza en background. Ideal para CDNs que cambian poco.
 */
async function staleWhileRevalidate(request, cacheName) {
    const cache  = await caches.open(cacheName);
    const cached = await cache.match(request);

    // Actualizar en background sin bloquear
    const networkFetch = fetch(request).then(response => {
        if (response.ok) cache.put(request, response.clone());
        return response;
    }).catch(() => null);

    return cached || await networkFetch;
}

// ─────────────────────────────────────────────────────────────────────────────
// MENSAJES — recibir comandos desde la app
// ─────────────────────────────────────────────────────────────────────────────
self.addEventListener('message', event => {
    if (event.data?.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    if (event.data?.type === 'CLEAR_CACHE') {
        caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))));
    }
});
