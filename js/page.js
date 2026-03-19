/**
 * pages.js — Bootstrap común para páginas independientes.
 * Carga los JSON, aplica tema y expone helpers usados en mach.html,
 * theater.html y favorites.html.
 * Depende de: state.js, utils.js, theme.js
 */

/* ── Carga de datos ─────────────────────────────────────────── */
async function loadData() {
  const base = getBasePath();
  const [aRes, cRes] = await Promise.all([
    fetch(base + 'data/aircraft.json'),
    fetch(base + 'data/conflicts.json'),
  ]);
  if (!aRes.ok || !cRes.ok) throw new Error('No se pudieron cargar los datos.');
  aircraftDB  = await aRes.json();
  conflictsDB = await cRes.json();
}

/** Devuelve el prefijo de ruta relativo al raíz del proyecto */
function getBasePath() {
  // Si la página está en una subcarpeta futura, ajustar aquí.
  return './';
}

/* ── Navegación entre páginas ───────────────────────────────── */
function goHome()     { location.href = getBasePath() + 'index.html'; }
function goMach()     { location.href = getBasePath() + 'mach.html'; }
function goTheater()  { location.href = getBasePath() + 'theater.html'; }
function goFavorites(){ location.href = getBasePath() + 'favorites.html'; }

/* ── Barra de navegación compartida ────────────────────────── */
function buildNavBar(activePage) {
  const pages = [
    { id: 'home',      label: 'Archivo',   icon: 'fa-fighter-jet', fn: 'goHome()' },
    { id: 'theater',   label: 'Teatro',    icon: 'fa-crosshairs',  fn: 'goTheater()' },
    { id: 'favorites', label: 'Favoritos', icon: 'fa-star',        fn: 'goFavorites()' },
    { id: 'mach',      label: 'Mach Calc', icon: 'fa-tachometer-alt', fn: 'goMach()' },
  ];
  return `
    <nav class="page-nav">
      <a class="logo" onclick="goHome(); return false;" href="#">
        <div class="logo-icon"><i class="fas fa-fighter-jet"></i></div>
        <span class="logo-text">AERO<span>PEDIA</span></span>
      </a>
      <div class="page-nav-links">
        ${pages.map(p => `
          <button class="nav-link ${p.id === activePage ? 'active' : ''}"
                  onclick="${p.fn}">
            <i class="fas ${p.icon}"></i>
            <span>${p.label}</span>
          </button>`).join('')}
      </div>
      <div class="theme-toggle-wrap" title="Cambiar tema (D)">
        <i class="theme-icon fas fa-sun" style="color:#eab308"></i>
        <button id="themeToggle" onclick="toggleTheme()" aria-label="Cambiar tema"></button>
        <i class="theme-icon fas fa-moon" style="color:#94a3b8"></i>
      </div>
    </nav>`;
}

/* ── Mini-card de avión (usada en theater y favorites) ───────── */
function buildAircraftCard(plane, opts = {}) {
  const favActive = isFav(plane.id);
  return `
    <article class="mini-card" id="mini-${plane.id}">
      <div class="mini-img-wrap">
        <img src="${plane.img}" alt="${plane.name}" loading="lazy"
             onerror="this.src='${FALLBACK_IMG}'">
        <span class="mini-badge-type">${plane.type}</span>
        <span class="mini-badge-year mono">${plane.year}</span>
      </div>
      <div class="mini-body">
        <div class="mini-header">
          <h3 class="mini-name header-font">${plane.name}</h3>
          <div class="mini-meta">
            <span class="mini-country mono">${plane.country}</span>
            ${genBadgeHTML(plane)}
          </div>
        </div>
        <p class="mini-desc">${plane.desc}</p>
        <div class="mini-stats">
          <div class="mini-stat"><span class="mini-stat-l">Velocidad</span><span class="mini-stat-v mono">${plane.speed.toLocaleString('es-ES')} km/h</span></div>
          <div class="mini-stat"><span class="mini-stat-l">Alcance</span><span class="mini-stat-v mono">${plane.range.toLocaleString('es-ES')} km</span></div>
          <div class="mini-stat"><span class="mini-stat-l">Techo</span><span class="mini-stat-v mono">${plane.ceiling.toLocaleString('es-ES')} m</span></div>
          <div class="mini-stat"><span class="mini-stat-l">MTOW</span><span class="mini-stat-v mono">${(plane.mtow/1000).toFixed(1)} T</span></div>
        </div>
        <div class="mini-trivia">
          <i class="fas fa-bolt mini-trivia-icon"></i>
          <span>${plane.trivia}</span>
        </div>
        <div class="mini-actions">
          <button class="mini-btn-home" onclick="viewInGallery('${plane.id}')" title="Ver en galería">
            <i class="fas fa-external-link-alt"></i> Ver en galería
          </button>
          <button class="mini-fav-btn btn-icon fav-btn ${favActive ? 'active' : ''}"
                  id="favBtn-${plane.id}"
                  onclick="toggleFavPage('${plane.id}')"
                  title="${favActive ? 'Quitar de favoritos' : 'Añadir a favoritos'}">
            <i class="fas fa-star"></i>
          </button>
        </div>
      </div>
    </article>`;
}

/** Navegar a la galería principal mostrando ese avión */
function viewInGallery(id) {
  location.href = getBasePath() + `index.html#${id}`;
}

/** Toggle favorito desde página independiente */
function toggleFavPage(id) {
  let favs = getFavs();
  favs = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id];
  saveFavs(favs);
  const btn = document.getElementById(`favBtn-${id}`);
  if (btn) {
    const active = favs.includes(id);
    btn.classList.toggle('active', active);
    btn.title = active ? 'Quitar de favoritos' : 'Añadir a favoritos';
  }
}

/* ── Atajos de teclado globales en páginas independientes ────── */
document.addEventListener('keydown', e => {
  const tag    = document.activeElement?.tagName.toLowerCase();
  const typing = ['input','select','textarea'].includes(tag);
  if (typing) return;
  if (e.key === 'd' || e.key === 'D') toggleTheme();
});

