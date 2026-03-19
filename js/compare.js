/**
 * compare.js — Comparador de aeronaves con gráfico de radar (Chart.js)
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
      <span>${p.name}</span>
      <button onclick="toggleCompare('${id}')" title="Quitar">×</button>
    </div>`;
  }).join('');

  const rem = MAX_COMPARE - compareList.length;
  hint.textContent = compareList.length < 2
    ? `Selecciona ${2 - compareList.length} más`
    : rem > 0 ? `Puedes añadir ${rem} más` : 'Máximo alcanzado';
}

// ── ABRIR COMPARADOR ──────────────────────────────────────────
function openCompare() {
  if (compareList.length < 2) return;
  const planes = compareList.map(id => aircraftDB.find(p => p.id === id));
  const keys   = Object.keys(STAT_META);
  const maxV   = {};
  keys.forEach(k => { maxV[k] = Math.max(...planes.map(p => p[k])); });

  // Cabecera
  const headerCols = planes.map((p, i) => `
    <div class="cmp-header-col">
      <div class="cmp-img-wrap" style="border-color:${COMPARE_COLORS[i]}">
        <img src="${p.img}" alt="${p.name}" onerror="this.src='${FALLBACK_IMG}'">
      </div>
      <p class="cmp-plane-name header-font" style="color:${COMPARE_COLORS[i]}">${p.name}</p>
      <p class="cmp-plane-meta mono">${p.country} · ${p.year}</p>
      <div class="cmp-plane-badges">
        <span class="cmp-type-badge" style="background:${COMPARE_COLORS[i]}">${p.type}</span>
        ${genBadgeHTML(p)}
      </div>
    </div>`).join('');

  // Filas de stats
  const statRows = keys.map(k => {
    const meta = STAT_META[k];
    const cells = planes.map((p, i) => {
      const pct  = (p[k] / meta.max) * 100;
      const lead = p[k] === maxV[k] && planes.filter(x => x[k] === maxV[k]).length === 1;
      return `<td class="cmp-stat-cell">
        <div class="cmp-stat-row">
          <span class="mono cmp-stat-val">${formatStat(k, p[k])}</span>
          ${lead ? '<span class="cmp-leader">▲ LÍDER</span>' : ''}
        </div>
        <div class="cmp-bar-track">
          <div class="cmp-bar-fill" style="width:${pct}%;background:${COMPARE_COLORS[i]}"></div>
        </div>
      </td>`;
    }).join('');
    return `<tr class="cmp-row">
      <td class="cmp-param">${meta.label}</td>${cells}
    </tr>`;
  }).join('');

  // Análisis de dominio
  const domAnalysis = planes.map((p, i) => {
    const led = keys.filter(k => p[k] === maxV[k] && planes.filter(x => x[k] === maxV[k]).length === 1);
    return `<div class="cmp-domain-card" style="border-color:${COMPARE_COLORS[i]}">
      <p class="cmp-domain-name header-font" style="color:${COMPARE_COLORS[i]}">${p.name}</p>
      <p class="cmp-domain-meta mono">${p.country} · ${p.year}</p>
      ${led.length
        ? `<p class="cmp-domain-lead">▲ Líder en: ${led.map(k => STAT_META[k].label).join(', ')}</p>`
        : `<p class="cmp-domain-none">Sin liderazgo absoluto</p>`}
    </div>`;
  }).join('');

  document.getElementById('compareContent').innerHTML = `
    <div class="cmp-header-row" style="grid-template-columns: 160px repeat(${planes.length},1fr)">
      <div></div>${headerCols}
    </div>

    <!-- Tabs -->
    <div class="cmp-tabs">
      <button class="cmp-tab active" id="tabTable" onclick="switchCmpTab('table')">
        <i class="fas fa-table"></i> Tabla
      </button>
      <button class="cmp-tab" id="tabRadar" onclick="switchCmpTab('radar')">
        <i class="fas fa-chart-radar"></i> Radar
      </button>
    </div>

    <!-- Panel tabla -->
    <div id="cmpTablePanel" class="cmp-panel">
      <div class="cmp-table-wrap">
        <table class="cmp-table">
          <thead>
            <tr>
              <th>Parámetro</th>
              ${planes.map((p, i) => `<th style="color:${COMPARE_COLORS[i]}">${p.name}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${statRows}
            <tr class="cmp-row cmp-arm-row">
              <td class="cmp-param">Armamento</td>
              ${planes.map(p => `<td class="cmp-stat-cell mono cmp-arm-val">${p.arm}</td>`).join('')}
            </tr>
            <tr class="cmp-row">
              <td class="cmp-param">Dato clave</td>
              ${planes.map(p => `<td class="cmp-stat-cell cmp-trivia">"${p.trivia}"</td>`).join('')}
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Panel radar -->
    <div id="cmpRadarPanel" class="cmp-panel hidden">
      <div class="cmp-radar-grid">
        <div class="radar-canvas-wrap">
          <canvas id="radarCanvas"></canvas>
        </div>
        <div class="cmp-domain-list">
          <p class="cmp-domain-title mono">// Análisis de dominio</p>
          ${domAnalysis}
          <p class="cmp-radar-note">* Valores normalizados al máximo global de cada eje.</p>
        </div>
      </div>
    </div>`;

  // Guardar planes en el overlay para el radar
  document.getElementById('compareOverlay')._planes = planes;

  const overlay = document.getElementById('compareOverlay');
  overlay.classList.remove('hidden');
  requestAnimationFrame(() => overlay.classList.add('active'));
  document.body.style.overflow = 'hidden';
}

function closeCompare() {
  if (radarChartInst) { radarChartInst.destroy(); radarChartInst = null; }
  const overlay = document.getElementById('compareOverlay');
  overlay.classList.remove('active');
  setTimeout(() => { overlay.classList.add('hidden'); document.body.style.overflow = ''; }, 400);
}

function switchCmpTab(tab) {
  const isTable = tab === 'table';
  document.getElementById('cmpTablePanel')?.classList.toggle('hidden', !isTable);
  document.getElementById('cmpRadarPanel')?.classList.toggle('hidden',  isTable);
  document.getElementById('tabTable')?.classList.toggle('active',  isTable);
  document.getElementById('tabRadar')?.classList.toggle('active', !isTable);
  if (!isTable) drawRadarChart();
}

// ── RADAR CHART ───────────────────────────────────────────────
function drawRadarChart() {
  const overlay = document.getElementById('compareOverlay');
  const planes  = overlay?._planes;
  if (!planes) return;

  const AXES = [
    { key: 'speed',   label: 'Velocidad', max: 8000   },
    { key: 'range',   label: 'Alcance',   max: 15000  },
    { key: 'ceiling', label: 'Techo',     max: 30000  },
    { key: 'mtow',    label: 'Masa',      max: 420000 },
  ];

  const datasets = planes.map((p, i) => ({
    label: p.name,
    data: AXES.map(ax => Math.round((p[ax.key] / ax.max) * 100)),
    backgroundColor: COMPARE_COLORS[i] + '26',
    borderColor: COMPARE_COLORS[i],
    pointBackgroundColor: COMPARE_COLORS[i],
    pointBorderColor: '#0f172a',
    borderWidth: 2,
    pointRadius: 4,
  }));

  if (radarChartInst) { radarChartInst.destroy(); radarChartInst = null; }

  const ctx = document.getElementById('radarCanvas')?.getContext('2d');
  if (!ctx) return;

  radarChartInst = new Chart(ctx, {
    type: 'radar',
    data: { labels: AXES.map(a => a.label), datasets },
    options: {
      responsive: true,
      animation: { duration: 600 },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 11, weight: 'bold' }, padding: 16, boxWidth: 12 }
        },
        tooltip: {
          backgroundColor: '#0f172a',
          borderColor: '#334155',
          borderWidth: 1,
          callbacks: {
            label: ctx => {
              const ax  = AXES[ctx.dataIndex];
              const raw = planes[ctx.datasetIndex][ax.key];
              return ` ${ctx.dataset.label}: ${formatStat(ax.key, raw)}`;
            }
          }
        }
      },
      scales: {
        r: {
          min: 0, max: 100,
          ticks: { display: false },
          grid:        { color: 'rgba(51,65,85,.6)' },
          angleLines:  { color: 'rgba(51,65,85,.6)' },
          pointLabels: { color: '#94a3b8', font: { family: 'Orbitron', size: 10, weight: '700' } }
        }
      }
    }
  });
}
