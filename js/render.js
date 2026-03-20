/**
 * render.js — Renderizado de tarjetas, galería y tabla de ranking
 */

// ── SKELETON LOADING ──────────────────────────────────────────
function showSkeletons(count) {
  count = count || 6;
  const gallery = document.getElementById('gallery');
  if (!gallery) return;
  gallery.innerHTML = Array.from({ length: count }).map(function() { return `
    <div class="skeleton-card">
      <div class="skeleton sk-img"></div>
      <div class="skeleton-body">
        <div class="skeleton sk-title"></div>
        <div class="skeleton sk-sub"></div>
        <div class="sk-grid">
          <div class="skeleton sk-badge"></div>
          <div class="skeleton sk-badge"></div>
        </div>
        <div class="skeleton sk-bar"></div>
        <div class="skeleton sk-bar"></div>
        <div class="skeleton sk-btn"></div>
      </div>
    </div>`; }).join('');
}

// ── ESTADO VACÍO ──────────────────────────────────────────────
function buildEmptyState() {
  const msg = onlyFavs
    ? 'No tienes aeronaves guardadas. Usa ★ en las tarjetas para guardarlas.'
    : 'No hay resultados. Ajusta la búsqueda o los filtros.';
  return `
    <div class="empty-state">
      <div class="hud-lines">
        <div class="hud-scan-line"></div>
        <div class="hud-scan-line" style="animation-delay:.3s"></div>
        <div class="hud-scan-line" style="animation-delay:.6s"></div>
      </div>
      <i class="fas fa-satellite-dish empty-icon"></i>
      <p class="empty-title">// 0 AERONAVES ENCONTRADAS</p>
      <p class="empty-msg">${msg}</p>
    </div>`;
}

// ── CARD (versión limpia) ─────────────────────────────────────
function createCard(plane) {
  const speedPct   = Math.min((plane.speed / 3600) * 100, 100);
  const rangePct   = Math.min((plane.range / 15000) * 100, 100);
  const ceilingPct = Math.min((plane.ceiling / 25000) * 100, 100);
  const isSelected = compareList.includes(plane.id);
  const favActive  = isFav(plane.id);

  // ── Etiquetas: solo las 4 indicadas ──────────────────────────
  // 1. País
  const countryTag = `<span class="card-tag tag-country">${plane.country}</span>`;

  // 2. Rol principal (primer rol del array, o tipo si no hay roles)
  /*
  const roleLabel = (plane.roles && plane.roles.length)
    ? plane.roles[0]
    : plane.type;
  const roleTag = `<span class="card-tag tag-role">${roleLabel}</span>`;
*/
  // 3. Estado activo (solo si está activo o es prototipo)
  const statusMap = { active: 'Activo', prototype: 'Prototipo', limited: 'Limitado', retired: null };
  const statusLabel = statusMap[plane.status] || null;
  const statusTag = statusLabel
    ? `<span class="card-tag tag-status ${plane.status}">${statusLabel}</span>`
    : '';

  // 4. Año
  const yearTag = `<span class="card-tag tag-year mono">${plane.year}</span>`;

  // 5. Generación — SOLO para cazas
  const genTag = plane.generation ? genBadgeHTML(plane) : '';

  // ── Barra de comparación seleccionada ────────────────────────
  const selectedBar = isSelected
    ? '<div class="card-selected-bar"></div>'
    : '';

  return `
    <div id="card-${plane.id}" class="card${isSelected ? ' selected-for-compare' : ''}">
      ${selectedBar}
      <div class="card-img-wrap">
        <img src="./public/${plane.wiki}.webp" alt="${plane.name}" loading="lazy" onerror="this.src='${FALLBACK_IMG}'">
        <span class="card-badge-type">${plane.type}</span>
      </div>

      <div class="card-body">
        <h2 class="card-name header-font">${plane.name}</h2>

        <div class="card-tags">
          ${countryTag}${statusTag}${yearTag}${genTag}
        </div>

        <div class="card-stats-clean">
          <div class="stat-clean">
            <span class="stat-clean-label">Velocidad</span>
            <span class="stat-clean-value mono">${plane.speed.toLocaleString('es-ES')} km/h</span>
            <div class="stat-bar-track"><div class="stat-bar-fill sp" style="width:${speedPct}%"></div></div>
          </div>
          <div class="stat-clean">
            <span class="stat-clean-label">Techo</span>
            <span class="stat-clean-value mono">${plane.ceiling.toLocaleString('es-ES')} m</span>
            <div class="stat-bar-track"><div class="stat-bar-fill ce" style="width:${ceilingPct}%"></div></div>
          </div>
          <div class="stat-clean">
            <span class="stat-clean-label">Alcance</span>
            <span class="stat-clean-value mono">${plane.range.toLocaleString('es-ES')} km</span>
            <div class="stat-bar-track"><div class="stat-bar-fill ra" style="width:${rangePct}%"></div></div>
          </div>
        </div>

        <div class="card-actions">
          <button class="btn-detail" onclick="openDetail('${plane.id}')">
            <i class="fas fa-file-invoice"></i> Ficha
          </button>
          <button id="favBtn-${plane.id}"
                  class="btn-icon fav-btn${favActive ? ' active' : ''}"
                  onclick="toggleFav('${plane.id}')"
                  title="${favActive ? 'Quitar de favoritos' : 'Guardar en favoritos'}">
            <i class="fas fa-star"></i>
          </button>
          <button id="cmpBtn-${plane.id}"
                  class="btn-icon cmp-btn${isSelected ? ' active' : ''}"
                  onclick="toggleCompare('${plane.id}')"
                  title="${isSelected ? 'Quitar de comparación' : 'Añadir a comparación'}">
            <i class="fas ${isSelected ? 'fa-check' : 'fa-plus'}"></i>
          </button>
        </div>
      </div>
    </div>`;
}

// ── GALERÍA ───────────────────────────────────────────────────
function renderGallery(planes) {
  const gallery = document.getElementById('gallery');
  if (!gallery) return;
  gallery.innerHTML = planes.length
    ? planes.map(createCard).join('')
    : buildEmptyState();
}

// ── RANKING ───────────────────────────────────────────────────
function renderRanking(planes) {
  const sorted = [...planes].sort((a, b) =>
    sortAsc ? a[sortStat] - b[sortStat] : b[sortStat] - a[sortStat]
  );
  const maxVal = sorted.length ? Math.max(...sorted.map(p => p[sortStat])) : 1;
  const COLORS = { speed:'#3b82f6', range:'#8b5cf6', ceiling:'#06b6d4', mtow:'#f59e0b', year:'#10b981' };
  const color  = COLORS[sortStat] || '#3b82f6';
  const medal  = ['🥇','🥈','🥉'];

  const rows = sorted.map((p, i) => {
    const pct = (p[sortStat] / maxVal) * 100;
    const val = formatStat(sortStat, p[sortStat]);
    return `
      <tr class="rank-row" onclick="openDetail('${p.id}')">
        <td class="rank-pos mono">${medal[i] || (i + 1)}</td>
        <td class="rank-plane">
          <div class="rank-thumb-wrap">
            <img src="./public/${p.wiki}.webp" class="rank-thumb" alt="${p.name}" onerror="this.src='${FALLBACK_IMG}'">
          </div>
          <div>
            <p class="rank-name header-font">${p.name}</p>
            <p class="rank-sub mono">${p.country} · ${p.year}</p>
          </div>
        </td>
        <td class="rank-stat-cell">
          <span class="mono rank-stat-val" style="color:${color}">${val}</span>
          <div class="rank-bar-track">
            <div class="rank-bar-fill" style="width:${pct}%;background:${color}"></div>
          </div>
        </td>
        <td class="rank-extra mono hidden-sm">${p.range.toLocaleString('es-ES')} km</td>
        <td class="rank-extra mono hidden-sm">${p.ceiling.toLocaleString('es-ES')} m</td>
        <td class="rank-extra mono hidden-md">${(p.mtow/1000).toFixed(1)} T</td>
        <td class="rank-extra mono hidden-md">${p.year}</td>
        <td><span class="rank-type-badge">${p.type}</span></td>
      </tr>`;
  }).join('');

  document.getElementById('rankingBody').innerHTML =
    rows || `<tr><td colspan="8" class="rank-empty">Sin resultados</td></tr>`;

  document.querySelectorAll('.sort-th').forEach(th => {
    const active = th.dataset.col === sortStat;
    th.classList.toggle('sorted', active);
    const icon = th.querySelector('.sort-icon');
    if (icon) icon.textContent = active ? (sortAsc ? '↑' : '↓') : '↕';
  });
}

// ── TOGGLE VISTA ──────────────────────────────────────────────
function setView(view) {
  currentView = view;
  const isGallery = view === 'gallery';
  document.getElementById('galleryView')?.classList.toggle('hidden', !isGallery);
  document.getElementById('rankingView')?.classList.toggle('hidden',  isGallery);
  document.getElementById('viewGalleryBtn')?.classList.toggle('active',  isGallery);
  document.getElementById('viewRankingBtn')?.classList.toggle('active', !isGallery);
  renderAll();
}

// ── LISTENERS ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.rank-stat-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      sortAsc  = btn.dataset.stat === sortStat ? !sortAsc : false;
      sortStat = btn.dataset.stat;
      document.querySelectorAll('.rank-stat-pill').forEach(b =>
        b.classList.toggle('active', b.dataset.stat === sortStat)
      );
      renderAll();
    });
  });
  document.querySelectorAll('.sort-th').forEach(th => {
    th.addEventListener('click', () => {
      sortAsc  = th.dataset.col === sortStat ? !sortAsc : false;
      sortStat = th.dataset.col;
      renderAll();
    });
  });
});
