/**
 * compare.js — Comparador: gestiona la selección desde index.html
 * y redirige a compare.html para mostrar el resultado.
 * openCompare() y drawRadarChart() siguen existiendo para el overlay
 * interno de index.html (barra flotante).
 */

const COMPARE_COLORS = ['#3b82f6', '#f59e0b', '#10b981'];

// ── GESTIÓN DE LISTA ──────────────────────────────────────────
function toggleCompare(id) {
  if (compareList.includes(id)) {
    compareList = compareList.filter(x => x !== id);
  } else {
    if (compareList.length >= MAX_COMPARE) return;
    compareList.push(id);
  }
  updateCompareBar();
  refreshCardCompareState(id);
}

function refreshCardCompareState(id) {
  const card = document.getElementById(`card-${id}`);
  const btn  = document.getElementById(`cmpBtn-${id}`);
  if (!card || !btn) return;
  const sel = compareList.includes(id);
  card.classList.toggle('selected-for-compare', sel);
  btn.classList.toggle('active', sel);
  btn.innerHTML = `<i class="fas ${sel ? 'fa-check' : 'fa-plus'}"></i>`;
}

function clearCompare() {
  const prev = [...compareList];
  compareList = [];
  updateCompareBar();
  prev.forEach(id => refreshCardCompareState(id));
}

function updateCompareBar() {
  const bar   = document.getElementById('compareBar');
  const slots = document.getElementById('compareSlots');
  const btn   = document.getElementById('compareBtn');
  const hint  = document.getElementById('compareHint');
  if (!bar) return;

  if (compareList.length === 0) { bar.classList.remove('visible'); return; }
  bar.classList.add('visible');
  btn.disabled = compareList.length < 2;

  slots.innerHTML = compareList.map(id => {
    const p = aircraftDB.find(x => x.id === id);
    return `<div class="compare-slot">
      <span>${p ? p.name : id}</span>
      <button onclick="toggleCompare('${id}')" title="Quitar">×</button>
    </div>`;
  }).join('');

  const rem = MAX_COMPARE - compareList.length;
  if (compareList.length < 2) {
    hint.textContent = `Selecciona ${2 - compareList.length} más para comparar`;
  } else if (rem > 0) {
    hint.textContent = `Puedes añadir ${rem} más`;
  } else {
    hint.textContent = 'Máximo alcanzado (3)';
  }
}

// ── ABRIR COMPARADOR → redirige a compare.html ────────────────
function openCompare() {
  if (compareList.length < 2) return;
  try {
    sessionStorage.setItem('aeropedia_compare', JSON.stringify(compareList));
  } catch (e) {}
  location.href = 'compare.html';
}

function closeCompare() {
  // Compatibilidad: si el overlay antiguo existe, cerrarlo
  if (radarChartInst) { radarChartInst.destroy(); radarChartInst = null; }
  const overlay = document.getElementById('compareOverlay');
  if (overlay) {
    overlay.classList.remove('active');
    setTimeout(() => { overlay.classList.add('hidden'); document.body.style.overflow = ''; }, 400);
  }
}

// Stub vacío para compatibilidad con shortcuts.js y theme.js
function drawRadarChart() {}
