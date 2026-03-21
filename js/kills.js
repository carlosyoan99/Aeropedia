'use strict';
let killsDB  = [];
let activeKillRow = null;

const ERA_MAP = {
  wwii:    ['wwii_europe','wwii_pacific','wwii_east','wwii_africa'],
  korea:   ['korea'],
  coldwar: ['vietnam','sixday','yom_kippur','iran_iraq','coldwar_patrols','falklands','gulf_war'],
  modern:  ['desert_storm','gwot','iraq','syria','ukraine','india_pakistan','mali','libya','chechnya','yugoslavia','kosovo']
};

async function loadKillsData() {
  const r = await fetch('./data/kills.json');
  if (!r.ok) throw new Error('No se pudo cargar kills.json');
  return r.json();
}

/* ── Renderizar tabla ────────────────────────────────── */
function renderKills() {
  const search = (document.getElementById('killsSearch').value || '').toLowerCase();
  const era    = document.getElementById('killsEra').value;
  const sort   = document.getElementById('killsSort').value;
  const body   = document.getElementById('killsBody');
  const count  = document.getElementById('killsCount');

  // Joinear con aircraftDB
  let rows = killsDB.map(k => {
    const plane = aircraftDB.find(p =>  p.id === k.id);
    return { ...k, plane };
  }).filter(r => r.plane);

  // Filtro de búsqueda
  if (search) {
      rows = rows.filter(r =>
          r.plane.name.toLowerCase().includes(search) || r.plane.country.toLowerCase().includes(search)
    );
  }

  // Filtro de era
  if (era !== 'all') {
    const eraConflicts = ERA_MAP[era] || [];
    rows = rows.filter(r => 
      (r.conflicts || []).some(c => eraConflicts.includes(c.id))
    );
  }

  // Ordenar
  rows.sort((a, b) => {
    switch(sort) {
      case 'kills_asc':  return a.kills_total - b.kills_total;
      case 'kills_desc': return b.kills_total - a.kills_total;
      case 'ratio_desc': return (b.kill_ratio || 0) - (a.kill_ratio || 0);
      case 'losses_asc': return (a.losses_combat || 0) - (b.losses_combat || 0);
      case 'year':       return a.plane.year - b.plane.year;
      default:           return b.kills_total - a.kills_total;
    }
  });

  if (count) count.textContent = rows.length + ' aeronaves';

  // Máximos para las barras
  const maxKills  = Math.max.apply(null, rows.map(r =>r.kills_total || 0)) || 1;
  const maxLosses = Math.max.apply(null, rows.map(r => r.losses_combat || 0)) || 1;

  if (!rows.length) {
    body.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--text-3)">Sin resultados para los filtros seleccionados.</td></tr>';
    return;
  }

  body.innerHTML = rows.map((r, i) => {
    const p         = r.plane;
    const kPct      = ((r.kills_total || 0)  / maxKills)  * 100;
    const lPct      = ((r.losses_combat || 0) / maxLosses) * 100;
    const ratio     = r.kill_ratio;
    const ratioCls  = !ratio ? 'nodata' : ratio >= 3 ? 'dominant' : ratio >= 1 ? 'positive' : 'negative';
    const ratioTxt  = ratio ? ratio.toFixed(2) : 'N/D';

    // Chips de conflictos
    const cfChips = (r.conflicts || []).slice(0, 3).map(c => {
      const cf = conflictsDB[c.id];
      return cf ? '<span class="kt-cf-chip">' + cf.flag + ' ' + cf.id?.toUpperCase().replace(/_/g,' ') + '</span>' : '';
    }).join('');

    return '<tr onclick="showConflictDetail(' + i + ')" data-idx="' + i + '">' +
      '<td class="col-plane">' +
        '<div class="kt-plane-cell">' +
          '<img src=".\/public\/min\/' + p.img + '.webp" class="kt-thumb" alt="' + p.name + '" onerror="this.src=\'' + FALLBACK_IMG + '\'">' +
          '<div>' +
            '<p class="kt-name">' + p.name + '</p>' +
            '<p class="kt-meta mono">' + p.country + ' · ' + p.year + (p.generation ? ' · Gen ' + p.generation : '') + '</p>' +
          '</div>' +
        '</div>' +
      '</td>' +
      '<td class="col-num">' + (r.kills_total ? '<span class="kt-kills">' + r.kills_total.toLocaleString('es-ES') + '</span>' : '<span class="kt-kills-nd">—</span>') + '</td>' +
      '<td class="col-num">' + (r.losses_combat !== null && r.losses_combat !== undefined ? '<span class="kt-losses">' + r.losses_combat.toLocaleString('es-ES') + '</span>' : '<span class="kt-losses-nd">—</span>') + '</td>' +
      '<td class="col-ratio"><span class="kt-ratio-badge ' + ratioCls + '">' + ratioTxt + '</span></td>' +
      '<td class="col-bar hidden-sm">' +
        '<div class="kt-bar-wrap">' +
          '<div class="kt-bar-row"><span class="kt-bar-label">Vict.</span><div class="kt-bar-track"><div class="kt-bar-fill k" style="width:' + kPct + '%"></div></div></div>' +
          '<div class="kt-bar-row"><span class="kt-bar-label">Derrb.</span><div class="kt-bar-track"><div class="kt-bar-fill l" style="width:' + lPct + '%"></div></div></div>' +
        '</div>' +
      '</td>' +
      '<td class="col-conflicts hidden-md"><div class="kt-conflict-chips">' + cfChips + '</div></td>' +
    '</tr>';
  }).join('');

  // Guardar los rows renderizados para el detalle
  body._rows = rows;
}

/* ── Panel de detalle de conflictos ──────────────────── */
function showConflictDetail(idx) {
  const body  = document.getElementById('killsBody');
  const rows  = body._rows;
  if (!rows || !rows[idx]) return;

  const r = rows[idx];
  const p = r.plane;

  // Marcar fila activa
  document.querySelectorAll('#killsBody tr').forEach((tr, i) => {
    tr.classList.toggle('active-row', i === idx);
  });

  document.getElementById('cdPlane').textContent = p.name;
  document.getElementById('cdMeta').textContent  = p.country + ' · ' + p.year + ' · ' + p.type;

  // Conflictos detallados
  const cfHtml = (r.conflicts || []).map(c => {
    const cf = conflictsDB[c.id];
    const label = cf ? cf.flag + ' ' + cf.label + ' (' + cf.years + ')' : c.id;
    return '<div class="cd-conflict-entry">' +
      '<p class="cd-cf-title">' + label + '</p>' +
      '<div class="cd-cf-stats">' +
        '<div class="cd-cf-stat">Victorias A-A: <span class="green">' + (c.kills || 0).toLocaleString('es-ES') + '</span></div>' +
        '<div class="cd-cf-stat">Derribados A-A: <span class="red">' + (c.losses_aa || 0).toLocaleString('es-ES') + '</span></div>' +
        (c.losses_other ? '<div class="cd-cf-stat">Otras pérdidas: <span class="red">' + c.losses_other.toLocaleString('es-ES') + '</span></div>' : '') +
      '</div>' +
      '<p class="cd-cf-notes">' + (c.notes || '') + '</p>' +
    '</div>';
  }).join('');

  document.getElementById('cdConflicts').innerHTML = cfHtml || '<p style="color:var(--text-3);font-size:.8rem">Sin detalle por conflicto disponible.</p>';
  document.getElementById('cdNotes').textContent   = r.notes || '';
  document.getElementById('cdSource').textContent  = 'Fuente: ' + (r.source_note || 'Datos históricos generales.');

  const panel = document.getElementById('conflictDetail');
  panel.classList.remove('hidden');
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeConflictDetail() {
  document.getElementById('conflictDetail').classList.add('hidden');
  document.querySelectorAll('#killsBody tr').forEach(tr => tr.classList.remove('active-row'));
}

/* ── Init ────────────────────────────────────────────── */
async function initKillsPage() {
  initTheme();
  document.getElementById('navContainer').innerHTML = buildNavBar('kills');
  try {
    await loadData();
    killsDB = await loadKillsData();
    renderKills();
  } catch(e) {
    showLoadError('killsBody', e);
  }
}

document.addEventListener('DOMContentLoaded', initKillsPage);
