/**
 * theater.js — Teatro de Operaciones
 */

function toggleTheater() {
  const section = document.getElementById('theaterSection');
  if (!section) return;
  const willOpen = !section.classList.contains('open');
  section.classList.toggle('open', willOpen);
  if (willOpen) {
    buildTheaterPanel();
    highlightConflictCard(activeConflict);
    updateTheaterResetBtn();
  }
}

function buildTheaterPanel() {
  const container = document.getElementById('theaterGrid');
  if (!container || container.dataset.built) return;
  container.dataset.built = 'true';

  container.innerHTML = Object.entries(conflictsDB).map(([id, cf]) => {
    const count = aircraftDB.filter(p => (p.conflicts || []).includes(id)).length;
    return `
      <button class="conflict-card" data-conflict="${id}"
              onclick="filterByConflict('${id}')"
              style="--cf-color:${cf.color}">
        <div class="cf-card-head">
          <span class="cf-flag">${cf.flag}</span>
          <span class="cf-years mono">${cf.years}</span>
        </div>
        <p class="cf-label header-font">${cf.label}</p>
        <p class="cf-desc">${cf.desc}</p>
        <div class="cf-count">
          <span class="cf-count-num mono">${count}</span>
          <span class="cf-count-txt">aeronave${count !== 1 ? 's' : ''}</span>
        </div>
      </button>`;
  }).join('');
}

function filterByConflict(id) {
  activeConflict = activeConflict === id ? 'all' : id;
  highlightConflictCard(activeConflict);
  updateTheaterResetBtn();
  renderAll();
  document.getElementById('galleryView')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetConflictFilter() {
  activeConflict = 'all';
  highlightConflictCard('all');
  updateTheaterResetBtn();
  renderAll();
}

function highlightConflictCard(conflictId) {
  document.querySelectorAll('.conflict-card').forEach(c => {
    c.classList.toggle('active', c.dataset.conflict === conflictId);
  });

  // Actualizar etiqueta en el header del panel
  const lbl = document.getElementById('theaterConflictLabel');
  if (lbl) {
    const cf = conflictsDB[conflictId];
    lbl.textContent = cf ? `${cf.flag} ${cf.label}` : '';
  }
}

function updateTheaterResetBtn() {
  const btn = document.getElementById('theaterResetBtn');
  if (!btn) return;
  btn.disabled = activeConflict === 'all';
}

/** Llamado desde la ficha técnica: cierra el detalle y activa el filtro */
function selectConflictAndClose(conflictId) {
  closeDetail();
  setTimeout(() => {
    activeConflict = conflictId;
    // Abrir el panel de teatro si estaba cerrado
    const panel = document.getElementById('theaterSection');
    if (panel && !panel.classList.contains('open')) {
      panel.classList.add('open');
      buildTheaterPanel();
    }
    highlightConflictCard(conflictId);
    updateTheaterResetBtn();
    renderAll();
  }, 550);
}
