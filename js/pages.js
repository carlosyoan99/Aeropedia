/**
 * pages.js — Bootstrap común para páginas independientes.
 * Depende de: state.js, utils.js, theme.js
 */

/* ── Carga de datos ─────────────────────────────────────────── */
export async function loadData() {
  const base = './';
  let aRes, cRes;
  try {
    [aRes, cRes] = await Promise.all([
      fetch(base + 'data/aircraft.json'),
      fetch(base + 'data/conflicts.json'),
    ]);
  } catch (fetchErr) {
    throw new Error('No se pudo conectar al servidor. Abre el proyecto con: npx serve . (no con file://)');
  }
  if (!aRes.ok || !cRes.ok) {
    throw new Error('Archivos de datos no encontrados (' + aRes.status + '/' + cRes.status + ').');
  }
  aircraftDB  = await aRes.json();
  conflictsDB = await cRes.json();
}

/* ── Navegación entre páginas ───────────────────────────────── */
export function goHome()    { location.href = './index.html'; }
export function goMach()    { location.href = './mach.html'; }
export function goTheater() { location.href = './theater.html'; }
export function goFavs()    { location.href = './favorites.html'; }
export function goKills()   { location.href = './kills.html'; }
export function goFleets()  { location.href = './fleets.html'; }
export function goCompare() { location.href = './compare.html'; }

/* ── Barra de navegación compartida ────────────────────────── */
export function buildNavBar(activePage) {
  const pages = [
    { id: 'home',     label: 'Archivo',  icon: 'fa-fighter-jet',   fn: 'goHome()' },
    { id: 'kills',    label: 'Combate',  icon: 'fa-crosshairs',    fn: 'goKills()' },
    { id: 'fleets',   label: 'Flotas',   icon: 'fa-globe',         fn: 'goFleets()' },
    { id: 'theater',  label: 'Teatro',   icon: 'fa-crosshairs',    fn: 'goTheater()' },
    { id: 'compare',  label: 'Comparar', icon: 'fa-balance-scale', fn: 'goCompare()' },
    { id: 'favorites',label: 'Favoritos',icon: 'fa-star',          fn: 'goFavs()' },
    { id: 'mach',     label: 'Mach',     icon: 'fa-tachometer-alt',fn: 'goMach()' },
  ];
  return '<nav class="page-nav">' +
    '<a class="logo" onclick="goHome();return false;" href="#">' +
      '<div class="logo-icon"><i class="fas fa-fighter-jet"></i></div>' +
      '<span class="logo-text">AERO<span>PEDIA</span></span>' +
    '</a>' +
    '<div class="page-nav-links">' +
      pages.map(function(p) {
        return '<button class="nav-link ' + (p.id === activePage ? 'active' : '') + '" onclick="' + p.fn + '">' +
          '<i class="fas ' + p.icon + '"></i><span>' + p.label + '</span>' +
        '</button>';
      }).join('') +
    '</div>' +
    '<div class="theme-toggle-wrap" title="Cambiar tema (D)">' +
      '<i class="theme-icon fas fa-sun" style="color:#eab308"></i>' +
      '<button id="themeToggle" onclick="toggleTheme()" aria-label="Cambiar tema"></button>' +
      '<i class="theme-icon fas fa-moon" style="color:#94a3b8"></i>' +
    '</div>' +
  '</nav>';
}

/* ── Mensaje de error de carga ──────────────────────────────── */
export function showLoadError(containerId, err) {
  var el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:4rem 1rem;color:var(--text-3)">' +
    '<i class="fas fa-exclamation-triangle" style="font-size:2.5rem;margin-bottom:1rem;display:block;color:#f87171"></i>' +
    '<p style="font-family:var(--font-head);font-size:.9rem;text-transform:uppercase;letter-spacing:.08em;margin-bottom:.5rem">Error al cargar datos</p>' +
    '<p style="font-size:.8rem;color:var(--text-3);max-width:22rem;margin:0 auto">' + (err ? err.message : 'Error desconocido') + '</p>' +
    '<p style="font-size:.72rem;margin-top:.75rem;color:var(--text-3)">Asegúrate de abrir el proyecto desde un servidor: <code style="background:var(--bg-stat);padding:2px 6px;border-radius:4px">npx serve .</code></p>' +
  '</div>';
}

/* ── Mini-card de avión ─────────────────────────────────────── */
function buildAircraftCard(plane) {
  var favActive = isFav(plane.id);
  var genBadge  = typeof genBadgeHTML === 'function' ? genBadgeHTML(plane) : '';
  return '<article class="mini-card" id="mini-' + plane.id + '">' +
    '<div class="mini-img-wrap">' +
      '<img src=".\/public\/mid\/' + plane.img + '.webp" alt="' + plane.name + '" loading="lazy" onerror="this.src=\'' + FALLBACK_IMG + '\'">' +
      '<span class="mini-badge-type">' + plane.type + '</span>' +
      '<span class="mini-badge-year mono">' + plane.year + '</span>' +
    '</div>' +
    '<div class="mini-body">' +
      '<div class="mini-header">' +
        '<h3 class="mini-name header-font">' + plane.name + '</h3>' +
        '<div class="mini-meta">' +
          '<span class="mini-country mono">' + plane.country + '</span>' +
          genBadge +
        '</div>' +
      '</div>' +
      '<p class="mini-desc">' + plane.desc + '</p>' +
      '<div class="mini-stats">' +
        '<div class="mini-stat"><span class="mini-stat-l">Velocidad</span><span class="mini-stat-v mono">' + plane.speed.toLocaleString('es-ES') + ' km/h</span></div>' +
        '<div class="mini-stat"><span class="mini-stat-l">Alcance</span><span class="mini-stat-v mono">' + plane.range.toLocaleString('es-ES') + ' km</span></div>' +
        '<div class="mini-stat"><span class="mini-stat-l">Techo</span><span class="mini-stat-v mono">' + plane.ceiling.toLocaleString('es-ES') + ' m</span></div>' +
        '<div class="mini-stat"><span class="mini-stat-l">MTOW</span><span class="mini-stat-v mono">' + (plane.mtow / 1000).toFixed(1) + ' T</span></div>' +
      '</div>' +
      (plane.trivia ? '<div class="mini-trivia"><i class="fas fa-bolt mini-trivia-icon"></i><span>' + plane.trivia + '</span></div>' : '') +
      '<div class="mini-actions">' +
        '<button class="mini-btn-home" onclick="viewInGallery(\'' + plane.id + '\')">' +
          '<i class="fas fa-external-link-alt"></i> Ver en galería' +
        '</button>' +
        '<button class="mini-fav-btn btn-icon fav-btn ' + (favActive ? 'active' : '') + '" ' +
                'id="favBtn-' + plane.id + '" ' +
                'onclick="toggleFavPage(\'' + plane.id + '\')" ' +
                'title="' + (favActive ? 'Quitar de favoritos' : 'Añadir a favoritos') + '">' +
          '<i class="fas fa-star"></i>' +
        '</button>' +
      '</div>' +
    '</div>' +
  '</article>';
}

/* ── Navegación a la galería principal con hash ─────────────── */
export function viewInGallery(id) {
  location.href = './index.html#' + id;
}

/* ── Toggle favorito en páginas independientes ───────────────── */
export function toggleFavPage(id) {
  var favs = getFavs();
  favs = favs.includes(id) ? favs.filter(f => f !== id) : favs.concat([id]);
  saveFavs(favs);
  var btn = document.getElementById('favBtn-' + id);
  if (btn) {
    var active = favs.includes(id);
    btn.classList.toggle('active', active);
    btn.title = active ? 'Quitar de favoritos' : 'Añadir a favoritos';
  }
}

/* ── Atajo de teclado: tema ──────────────────────────────────── */
document.addEventListener('keydown', e => {
  var tag    = document.activeElement && document.activeElement.tagName.toLowerCase();
  var typing = ['input','select','textarea'].includes(tag);
  if (typing) return;
  if (e.key === 'd' || e.key === 'D') toggleTheme();
});