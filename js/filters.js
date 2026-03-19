/**
 * filters.js — Filtrado de aeronaves y render principal
 */

function getFilteredPlanes() {
  const { search, cat } = getFilters();
  const s = search.toLowerCase();

  return aircraftDB.sort((a, b) => a.name.localeCompare(b.name)).filter(p => {
    const matchSearch   = p.name.toLowerCase().includes(s)    ||
                          p.country.toLowerCase().includes(s) ||
                          p.type.toLowerCase().includes(s);
    const matchCat      = cat === 'all'  || p.type === cat;
    const matchFav      = !onlyFavs      || isFav(p.id);
    const matchTimeline = !timelineActive || (p.year >= timelineMin && p.year <= timelineMax);
    const matchConflict = activeConflict === 'all' || (p.conflicts || []).includes(activeConflict);
    return matchSearch && matchCat && matchFav && matchTimeline && matchConflict;
  });
}

function renderAll() {
  const filtered = getFilteredPlanes();
  updateResultCounter(filtered);
  currentView === 'gallery' ? renderGallery(filtered) : renderRanking(filtered);
}

function updateResultCounter(filtered) {
  const count = filtered.length;
  const el = document.getElementById('resultCount');
  if (el) el.textContent = count;

  const labels = [];
  const { cat } = getFilters();
  if (cat !== 'all') labels.push(cat.toUpperCase());
  if (onlyFavs)      labels.push('⭐ FAVORITOS');
  if (timelineActive) labels.push(`${timelineMin}–${timelineMax}`);
  if (activeConflict !== 'all') {
    const cf = conflictsDB[activeConflict];
    if (cf) labels.push(`${cf.flag} ${cf.label}`);
  }
  const { search } = getFilters();
  if (search) labels.push(`"${search}"`);

  const lbl = document.getElementById('resultFilterLabel');
  if (lbl) lbl.textContent = labels.length ? labels.join(' · ') : 'TODOS LOS MODELOS';
}

// ── Favoritos ─────────────────────────────────────────────────
function toggleFav(id) {
  let favs = getFavs();
  favs = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id];
  saveFavs(favs);

  const btn = document.getElementById(`favBtn-${id}`);
  if (btn) {
    const active = favs.includes(id);
    btn.classList.toggle('active', active);
    btn.title = active ? 'Quitar de favoritos' : 'Añadir a favoritos';
  }
  if (onlyFavs) renderAll();
}

function toggleFavFilter() {
  onlyFavs = !onlyFavs;
  const btn = document.getElementById('favFilterBtn');
  if (btn) {
    btn.classList.toggle('active', onlyFavs);
    btn.title = onlyFavs ? 'Mostrando favoritos' : 'Ver favoritos';
  }
  renderAll();
}

// ── Event listeners de filtros ─────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('mainSearch')
    ?.addEventListener('input', renderAll);
  document.getElementById('catFilter')
    ?.addEventListener('change', renderAll);
});
