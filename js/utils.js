/**
 * utils.js — Funciones auxiliares puras
 */

/** Velocidad del sonido en km/h según altitud (modelo ISA simplificado) */
function speedOfSound(altMeters) {
  if (altMeters <= 11000) {
    const T = 288.15 - 0.0065 * altMeters;
    return 331.3 * Math.sqrt(T / 273.15) * 3.6;
  }
  return 1062.5;
}

/** Badge HTML de generación para cazas */
function genBadgeHTML(plane) {
  if (!plane.generation) return '';
  const map = {
    '1ª':   { cls: 'gen-1',  label: 'Gen 1ª' },
    '2ª':   { cls: 'gen-2',  label: 'Gen 2ª' },
    '3ª':   { cls: 'gen-3',  label: 'Gen 3ª' },
    '4ª':   { cls: 'gen-4',  label: 'Gen 4ª' },
    '4.5ª': { cls: 'gen-45', label: 'Gen 4.5ª' },
    '5ª':   { cls: 'gen-5',  label: '✦ Gen 5ª' },
    '6ª':   { cls: 'gen-6',  label: '◈ Gen 6ª' },
  };
  const g = map[plane.generation];
  return g ? `<span class="gen-badge ${g.cls}">${g.label}</span>` : '';
}

/** Formatea un número con la unidad según la clave de stat */
function formatStat(key, value) {
  if (key === 'mtow') return `${(value / 1000).toFixed(1)} T`;
  const unit = STAT_META[key]?.unit || '';
  return `${value.toLocaleString('es-ES')}${unit ? ' ' + unit : ''}`;
}

/** Lee los filtros actuales del DOM */
function getFilters() {
  return {
    search: document.getElementById('mainSearch')?.value || '',
    cat:    document.getElementById('catFilter')?.value  || 'all',
  };
}

/** Obtiene los favoritos del localStorage */
function getFavs() {
  try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; }
  catch { return []; }
}

function saveFavs(favs) {
  localStorage.setItem(FAV_KEY, JSON.stringify(favs));
}

function isFav(id) {
  return getFavs().includes(id);
}

function debounce(fn, delay, inmediate = false) {
  const debounced = (...args) => {
    const context = this

    const later = () => {
      timeoutID - null
      if (!inmediate) fn.apply(context, args)
    }

    const callNow = inmediate && !timeoutID

    clearTimeout(timeoutID)

    timeoutID = setTimeout(later, delay)

    if (callNow) fn.apply(context, delay)
    
  }

  return debounced
}