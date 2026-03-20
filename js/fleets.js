'use strict';
let fleetsDB = [];

const ROLE_COLORS = {
  'Caza':           '#3b82f6',
  'Ataque':         '#f59e0b',
  'Bombardero':     '#ef4444',
  'Transporte':     '#8b5cf6',
  'AWACS':          '#06b6d4',
  'Reabastecimiento':'#10b981',
  'ISR':            '#f472b6',
  'default':        '#64748b'
};

async function loadFleetsData() {
  const r = await fetch('./data/fleets.json');
  if (!r.ok) throw new Error('No se pudo cargar fleets.json');
  return r.json();
}

/* ── Resumen global ──────────────────────────────────── */
function buildSummary() {
  const totalCountries = fleetsDB.length;
  const totalCombat    = fleetsDB.reduce(function(s, c) { return s + (c.total_combat || 0); }, 0);
  const gen5Count      = fleetsDB.reduce(function(s, c) {
    return s + c.aircraft.reduce(function(ss, a) {
      const p = aircraftDB.find(function(p) { return p.id === a.id; });
      return ss + (p && p.generation === '5' && a.qty > 0 ? a.qty : 0);
    }, 0);
  }, 0);
  const f35Total = fleetsDB.reduce(function(s, c) {
    return s + c.aircraft.reduce(function(ss, a) { return ss + (a.id === 'f35' ? a.qty : 0); }, 0);
  }, 0);

  document.getElementById('fleetsSummary').innerHTML = [
    { num: totalCountries,                 label: 'países analizados' },
    { num: totalCombat.toLocaleString('es-ES'), label: 'aviones de combate activos' },
    { num: gen5Count.toLocaleString('es-ES'),   label: 'cazas de 5ª gen activos' },
    { num: f35Total.toLocaleString('es-ES'),    label: 'F-35 en servicio mundial' },
  ].map(function(s) {
    return '<div class="flt-summary-card">' +
      '<p class="flt-summary-num header-font">' + s.num + '</p>' +
      '<p class="flt-summary-label">' + s.label + '</p>' +
    '</div>';
  }).join('');
}

/* ── Renderizar grid ─────────────────────────────────── */
function renderFleets() {
  const search = (document.getElementById('fleetsSearch').value || '').toLowerCase();
  const region = document.getElementById('fleetsRegion').value;
  const sort   = document.getElementById('fleetsSort').value;
  const grid   = document.getElementById('fleetsGrid');
  const countEl= document.getElementById('fleetsCount');

  let data = fleetsDB.filter(function(c) {
    const matchSearch = !search || c.country.toLowerCase().includes(search) ||
      c.aircraft.some(function(a) { return a.name.toLowerCase().includes(search); });
    const matchRegion = region === 'all' || c.region === region;
    return matchSearch && matchRegion;
  });

  data.sort(function(a, b) {
    if (sort === 'total_desc') return (b.total_combat || 0) - (a.total_combat || 0);
    if (sort === 'name')       return a.country.localeCompare(b.country);
    // rank
    const ra = a.strength_rank || 99;
    const rb = b.strength_rank || 99;
    return ra - rb;
  });

  if (countEl) countEl.textContent = data.length + ' países';

  if (!data.length) {
    grid.innerHTML = '<p style="color:var(--text-3);grid-column:1/-1">Sin resultados para los filtros seleccionados.</p>';
    return;
  }

  grid.innerHTML = data.map(function(country) {
    return buildFleetCard(country);
  }).join('');
}

/* ── Tarjeta de un país ──────────────────────────────── */
function buildFleetCard(country) {
  // Quick stats
  const totalAircraft = country.aircraft.reduce(function(s, a) { return s + (a.qty || 0); }, 0);
  const fighterCount  = country.aircraft.reduce(function(s, a) {
    const p = aircraftDB.find(function(p) { return p.id === a.id; });
    return s + (p && p.type === 'Caza' ? (a.qty || 0) : 0);
  }, 0);
  const gen5Count = country.aircraft.reduce(function(s, a) {
    const p = aircraftDB.find(function(p) { return p.id === a.id; });
    return s + (p && p.generation === '5ª' ? (a.qty || 0) : 0);
  }, 0);

  const rankBadge = country.strength_rank
    ? '<span class="fleet-rank-badge"># ' + country.strength_rank + ' mundial</span>'
    : '';

  // Tabla de aeronaves
  const rows = country.aircraft.map(function(a) {
    const p = aircraftDB.find(function(x) { return x.id === a.id; });
    const img  = p ? '.\/public\/min\/' + p.img + '.webp' : FALLBACK_IMG;
    const gen5badge = (p && p.generation === '5ª') ? ' <span style="color:#f472b6;font-size:.55rem">◈5ª</span>' : '';
    const qtyColor = a.qty === 0 ? 'var(--text-3)' : 'var(--primary)';
    return '<tr onclick="viewPlaneFromFleet(\'' + a.id + '\')" title="Ver ficha de ' + a.name + '">' +
      '<td style="width:50px"><img src="' + img + '" class="fat-img" onerror="this.src=\'' + FALLBACK_IMG + '\'"></td>' +
      '<td><p class="fat-name">' + a.name + gen5badge + '</p><p class="fat-role">' + a.role + '</p></td>' +
      '<td style="text-align:right;padding-left:.3rem"><span class="fat-qty" style="color:' + qtyColor + '">' + (a.qty || '—') + '</span></td>' +
      '<td class="fat-note hidden-sm">' + a.notes + '</td>' +
    '</tr>';
  }).join('');

  // Barra de tipos
  const typeGroups = {};
  country.aircraft.forEach(function(a) {
    const p = aircraftDB.find(function(x) { return x.id === a.id; });
    const type = p ? p.type : 'default';
    typeGroups[type] = (typeGroups[type] || 0) + (a.qty || 0);
  });
  const totalForBar = Object.values(typeGroups).reduce(function(s,v) { return s+v; }, 0) || 1;
  const typeBarSegs = Object.entries(typeGroups).map(function(entry) {
    const type = entry[0], qty = entry[1];
    const color = ROLE_COLORS[type] || ROLE_COLORS.default;
    const pct   = (qty / totalForBar) * 100;
    return '<div class="fleet-type-segment" style="width:' + pct + '%;background:' + color + '" title="' + type + ': ' + qty + '"></div>';
  }).join('');

  return '<div class="fleet-card">' +
    // Header
    '<div class="fleet-card-header">' +
      '<span class="fleet-flag">' + country.flag + '</span>' +
      '<div>' +
        '<p class="fleet-name">' + country.country + '</p>' +
        '<p class="fleet-af">' + country.air_force + '</p>' +
      '</div>' +
      rankBadge +
    '</div>' +
    // Quick stats
    '<div class="fleet-quick-stats">' +
      '<div class="fleet-qs"><p class="fleet-qs-num header-font">' + (country.total_combat || '?') + '</p><p class="fleet-qs-label">Combate</p></div>' +
      '<div class="fleet-qs"><p class="fleet-qs-num header-font">' + fighterCount + '</p><p class="fleet-qs-label">Cazas</p></div>' +
      '<div class="fleet-qs"><p class="fleet-qs-num header-font" style="color:' + (gen5Count > 0 ? '#f472b6' : 'var(--text-3)') + '">' + gen5Count + '</p><p class="fleet-qs-label">Gen 5ª</p></div>' +
      (country.budget_bn_usd ? '<div class="fleet-qs"><p class="fleet-qs-num header-font" style="font-size:.8rem">' + country.budget_bn_usd + ' B$</p><p class="fleet-qs-label">Presupuesto</p></div>' : '') +
    '</div>' +
    // Tabla
    '<table class="fleet-aircraft-table"><tbody>' + rows + '</tbody></table>' +
    // Barra de tipos
    '<div class="fleet-type-bar">' +
      '<span class="fleet-type-bar-label">Mix</span>' +
      '<div class="fleet-type-bar-track">' + typeBarSegs + '</div>' +
    '</div>' +
    // Notas
    (country.notes ? '<p class="fleet-notes">' + country.notes + '</p>' : '') +
  '</div>';
}

/* ── Ver ficha del avión ─────────────────────────────── */
function viewPlaneFromFleet(id) {
  if (id && id !== 'undefined') {
    location.href = './index.html#' + id;
  }
}

/* ── Init ────────────────────────────────────────────── */
async function initFleetsPage() {
  initTheme();
  document.getElementById('navContainer').innerHTML = buildNavBar('fleets');
  try {
    await loadData();
    fleetsDB = await loadFleetsData();
    buildSummary();
    renderFleets();
  } catch(e) {
    showLoadError('fleetsGrid', e);
  }
}

document.addEventListener('DOMContentLoaded', initFleetsPage);