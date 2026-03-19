/**
 * render.js — Renderizado de tarjetas, galería y tabla de ranking
 */

// ── SKELETON LOADING ──────────────────────────────────────────
function showSkeletons(count = 6) {
  const gallery = document.getElementById('gallery');
  if (!gallery) return;
  gallery.innerHTML = Array.from({ length: count }).map(() => `
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
    </div>`).join('');
}

// ── ESTADO VACÍO ──────────────────────────────────────────────
function buildEmptyState() {
  const msg = onlyFavs
    ? 'No tienes aeronaves guardadas con este filtro. Usa ★ en las tarjetas para guardarlas.'
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
      <div class="hud-lines">
        <div class="hud-scan-line" style="animation-delay:.9s"></div>
        <div class="hud-scan-line" style="animation-delay:1.2s"></div>
      </div>
    </div>`;
}

// ── CARD ──────────────────────────────────────────────────────
function createCard(plane) {
  const speedPct   = Math.min((plane.speed / 3600) * 100, 100);
  const rangePct   = Math.min((plane.range / 15000) * 100, 100);
  const isSelected = compareList.includes(plane.id);
  const favActive  = isFav(plane.id);

  return `
    <div id="card-${plane.id}" class="card${isSelected ? ' selected-for-compare' : ''}">
      <div class="card-img-wrap">
        <img src="./public/${plane.wiki}.webp" alt="${plane.name}" loading="lazy"
             onerror="this.src='${FALLBACK_IMG}'">
        <span class="card-badge-type">${plane.type}</span>
        <span class="card-badge-year mono">${plane.year}</span>
        <span class="card-badge-mach mono">MACH ${(plane.speed / 1234.8).toFixed(1)}</span>
      </div>

      <div class="card-body">
        <div class="card-header">
          <h2 class="card-name header-font">${plane.name}</h2>
          <div class="card-meta">
            <span class="card-country mono">${plane.country}</span>
            ${genBadgeHTML(plane)}
          </div>
        </div>

        <div class="card-stats">
          <div class="stat-badge">
            <span class="stat-label">Techo Máx</span>
            <span class="stat-value mono">${plane.ceiling.toLocaleString('es-ES')} m</span>
          </div>
          <div class="stat-badge">
            <span class="stat-label">MTOW</span>
            <span class="stat-value mono">${(plane.mtow / 1000).toFixed(1)} T</span>
          </div>
        </div>

        <div class="card-bars">
          <div class="bar-row">
            <div class="bar-labels">
              <span>Velocidad</span>
              <span class="mono bar-val" style="color:var(--primary)">${plane.speed} km/h</span>
            </div>
            <div class="bar-track"><div class="bar-fill" style="width:${speedPct}%;background:var(--primary)"></div></div>
          </div>
          <div class="bar-row">
            <div class="bar-labels">
              <span>Alcance</span>
              <span class="mono bar-val" style="color:#8b5cf6">${plane.range} km</span>
            </div>
            <div class="bar-track"><div class="bar-fill" style="width:${rangePct}%;background:#8b5cf6"></div></div>
          </div>
        </div>

        <div class="card-actions">
          <button class="btn-detail" onclick="openDetail('${plane.id}')">
            <i class="fas fa-file-invoice"></i> Ficha técnica
          </button>
          <button id="favBtn-${plane.id}"
                  class="btn-icon fav-btn${favActive ? ' active' : ''}"
                  onclick="toggleFav('${plane.id}')"
                  title="${favActive ? 'Quitar de favoritos' : 'Añadir a favoritos'}">
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
  const sorted  = [...planes].sort((a, b) =>
    sortAsc ? a[sortStat] - b[sortStat] : b[sortStat] - a[sortStat]
  );
  const maxVal  = sorted.length ? Math.max(...sorted.map(p => p[sortStat])) : 1;
  const meta    = STAT_META[sortStat];

  const COLORS  = { speed:'#3b82f6', range:'#8b5cf6', ceiling:'#06b6d4', mtow:'#f59e0b', year:'#10b981' };
  const color   = COLORS[sortStat] || '#3b82f6';
  const medal   = ['🥇','🥈','🥉'];

  const rows = sorted.map((p, i) => {
    const pct = (p[sortStat] / maxVal) * 100;
    const val = formatStat(sortStat, p[sortStat]);
    return `
      <tr class="rank-row" onclick="openDetail('${p.id}')">
        <td class="rank-pos mono">${medal[i] || (i + 1)}</td>
        <td class="rank-plane">
          <div class="rank-thumb-wrap">
            <img src="${p.img}" class="rank-thumb" alt="${p.name}"
                 onerror="this.src='${FALLBACK_IMG}'">
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

  // Actualizar indicadores de ordenación
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

// ── LISTENERS RANKING ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Pills de stat
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

  // Cabeceras de columna
  document.querySelectorAll('.sort-th').forEach(th => {
    th.addEventListener('click', () => {
      sortAsc  = th.dataset.col === sortStat ? !sortAsc : false;
      sortStat = th.dataset.col;
      renderAll();
    });
  });
});
