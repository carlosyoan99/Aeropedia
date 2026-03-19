/**
 * timeline.js — Línea de tiempo interactiva con rango dual
 */

function toggleTimeline() {
  const section = document.getElementById('timelineSection');
  const willOpen = !section?.classList.contains('open');
  section?.classList.toggle('open', willOpen);
  if (willOpen) buildDecadeMarks();
}

function buildDecadeMarks() {
  const container = document.getElementById('decadeMarks');
  if (!container || container.dataset.built) return;
  container.dataset.built = 'true';

  container.innerHTML = '';
  for (let y = TIMELINE_MIN_YEAR; y <= TIMELINE_MAX_YEAR; y += TIMELINE_STEP) {
    const mark = document.createElement('button');
    mark.className    = 'decade-mark';
    mark.dataset.year = y;
    mark.type         = 'button';
    mark.innerHTML    = `
      <div class="decade-dot"></div>
      <span class="decade-label mono">'${String(y).slice(2)}</span>`;
    mark.addEventListener('click', () => jumpToDecade(y));
    container.appendChild(mark);
  }
  updateDecadeMarks();
  syncTimeline();
}

function updateDecadeMarks() {
  document.querySelectorAll('.decade-mark').forEach(m => {
    const y = parseInt(m.dataset.year);
    m.classList.toggle('active', y >= timelineMin && y <= timelineMax);
  });
}

function jumpToDecade(year) {
  const minEl = document.getElementById('timelineMin');
  const maxEl = document.getElementById('timelineMax');
  if (!minEl || !maxEl) return;

  if (year >= timelineMin && year <= timelineMax && timelineMin !== timelineMax) {
    timelineMin = year;
    timelineMax = year;
  } else {
    timelineMin = Math.min(timelineMin, year);
    timelineMax = Math.max(timelineMax, year);
  }
  minEl.value = timelineMin;
  maxEl.value = timelineMax;
  syncTimeline();
}

function onTimelineChange() { syncTimeline(); }

function syncTimeline() {
  const minEl = document.getElementById('timelineMin');
  const maxEl = document.getElementById('timelineMax');
  if (!minEl || !maxEl) return;

  let minVal = parseInt(minEl.value);
  let maxVal = parseInt(maxEl.value);
  if (minVal > maxVal) { minVal = maxVal; minEl.value = minVal; }

  timelineMin    = minVal;
  timelineMax    = maxVal;
  timelineActive = !(timelineMin === TIMELINE_MIN_YEAR && timelineMax === TIMELINE_MAX_YEAR);

  // Etiqueta del rango
  const label = document.getElementById('timelineRangeLabel');
  if (label) {
    label.textContent = timelineActive ? `${timelineMin}–${timelineMax}` : 'TODAS LAS ÉPOCAS';
  }

  // Fill visual entre los dos thumbs
  const total    = TIMELINE_MAX_YEAR - TIMELINE_MIN_YEAR;
  const leftPct  = ((timelineMin - TIMELINE_MIN_YEAR) / total) * 100;
  const rightPct = ((timelineMax - TIMELINE_MIN_YEAR) / total) * 100;

  const fill  = document.getElementById('timelineTrackFill');
  const tMin  = document.getElementById('thumbMin');
  const tMax  = document.getElementById('thumbMax');
  if (fill) { fill.style.left = `${leftPct}%`; fill.style.width = `${rightPct - leftPct}%`; }
  if (tMin) tMin.style.left = `${leftPct}%`;
  if (tMax) { tMax.style.left = `${rightPct}%`; }

  // Estado del botón TIMELINE
  const btn = document.getElementById('timelineBtn');
  btn?.classList.toggle('active', timelineActive);

  // Estado del botón reset
  const resetBtn = document.getElementById('timelineResetBtn');
  if (resetBtn) resetBtn.disabled = !timelineActive;

  updateDecadeMarks();
  renderAll();
}

function resetTimeline() {
  const minEl = document.getElementById('timelineMin');
  const maxEl = document.getElementById('timelineMax');
  if (minEl) minEl.value = TIMELINE_MIN_YEAR;
  if (maxEl) maxEl.value = TIMELINE_MAX_YEAR;
  syncTimeline();
}
