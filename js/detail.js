/**
 * detail.js — Ficha técnica completa v2
 * Usa todos los campos del esquema enriquecido de aircraft.json
 */

const wikiCache = {};

// ── HELPERS ────────────────────────────────────────────────────
function _v(val, fallback) {
  if (val === null || val === undefined || val === '') return fallback || '—';
  return String(val);
}
function _n(val, decimals, suffix, fallback) {
  if (val === null || val === undefined) return fallback || '—';
  return Number(val).toLocaleString('es-ES', { maximumFractionDigits: decimals || 0 }) + (suffix || '');
}

function stealthBadge(level) {
  const map = {
    low:    '<span class="stealth-badge low">Sigilo bajo</span>',
    medium: '<span class="stealth-badge medium">Sigilo medio</span>',
    high:   '<span class="stealth-badge high">✦ Sigilo alto</span>',
  };
  return map[level] || '';
}

function radarTypeBadge(type) {
  const map = {
    AESA:       '<span class="radar-badge aesa">AESA</span>',
    PESA:       '<span class="radar-badge pesa">PESA</span>',
    mechanical: '<span class="radar-badge mech">Mecánico</span>',
    none:       '<span class="radar-badge none">Sin radar</span>',
  };
  return map[type] || '';
}

function statusBadge(s) {
  const map = {
    active:    '<span class="status-badge active"><i class="fas fa-circle"></i> Activo</span>',
    retired:   '<span class="status-badge retired"><i class="fas fa-circle"></i> Retirado</span>',
    prototype: '<span class="status-badge proto"><i class="fas fa-circle"></i> Prototipo</span>',
    limited:   '<span class="status-badge limited"><i class="fas fa-circle"></i> Limitado</span>',
  };
  return map[s] || '';
}

function capIcons(plane) {
  const caps = [];
  if (plane.carrier_capable) caps.push('<span class="cap-icon" title="Portaaviones"><i class="fas fa-ship"></i> Naval</span>');
  if (plane.vtol)            caps.push('<span class="cap-icon" title="Despegue/aterrizaje vertical"><i class="fas fa-arrows-alt-v"></i> VTOL</span>');
  else if (plane.stol)       caps.push('<span class="cap-icon" title="Despegue/aterrizaje corto"><i class="fas fa-compress-alt"></i> STOL</span>');
  if (plane.irst)            caps.push('<span class="cap-icon" title="Sensor infrarrojo pasivo"><i class="fas fa-eye"></i> IRST</span>');
  if (plane.stealth === 'high' || plane.stealth === 'medium')
    caps.push('<span class="cap-icon" title="Tecnología furtiva"><i class="fas fa-ghost"></i> Stealth</span>');
  if (plane.crew === 0)      caps.push('<span class="cap-icon" title="No tripulado"><i class="fas fa-robot"></i> UAV</span>');
  return caps.join('');
}

function armamentBlock(p) {
  const arm = p.armament;
  if (!arm || typeof arm !== 'object') return '<p class="spec-value mono">' + (p.arm || '—') + '</p>';
  const rows = [];
  if (arm.gun) rows.push('<div class="arm-row"><span class="arm-icon"><i class="fas fa-crosshairs"></i></span><span class="arm-label">Cañón</span><span class="arm-val mono">' + arm.gun + '</span></div>');
  if (arm.hardpoints) rows.push('<div class="arm-row"><span class="arm-icon"><i class="fas fa-layer-group"></i></span><span class="arm-label">Puntos de carga</span><span class="arm-val mono">' + arm.hardpoints + '</span></div>');
  if (arm.missiles && arm.missiles.length)
    rows.push('<div class="arm-row"><span class="arm-icon"><i class="fas fa-bolt"></i></span><span class="arm-label">Misiles</span><span class="arm-val mono">' + arm.missiles.join(' · ') + '</span></div>');
  if (arm.bombs && arm.bombs.length)
    rows.push('<div class="arm-row"><span class="arm-icon"><i class="fas fa-bomb"></i></span><span class="arm-label">Bombas / Armas</span><span class="arm-val mono">' + arm.bombs.join(' · ') + '</span></div>');
  return rows.join('') || '<p class="spec-value mono">' + (p.arm || '—') + '</p>';
}

function combatHistoryBlock(history) {
  if (!history || !history.length) return '';
  return history.map(function(h) {
    var cf    = conflictsDB[h.conflict];
    var label = cf ? (cf.flag + ' ' + cf.label + ' (' + cf.years + ')') : h.conflict;
    return '<div class="combat-entry">' +
      '<p class="combat-label">' + label + '</p>' +
      (h.missions ? '<p class="combat-missions mono">' + h.missions.toLocaleString('es-ES') + ' misiones</p>' : '') +
      '<p class="combat-notes">' + h.notes + '</p>' +
      '</div>';
  }).join('');
}

function specRow(label, value) {
  if (!value || value === '—') return '';
  return '<div class="spec-item"><span class="spec-label">' + label + '</span><span class="spec-value mono">' + value + '</span></div>';
}

// ── ABRIR DETALLE ──────────────────────────────────────────────
function openDetail(id) {
  var plane = aircraftDB.find(function(p) { return p.id === id; });
  if (!plane) return;

  currentDetailId = id;
  history.pushState({ detailId: id }, '', '#' + id);

  var conflictChips = (plane.conflicts || [])
    .filter(function(c) { return conflictsDB[c]; })
    .map(function(c) {
      var cf = conflictsDB[c];
      return '<a class="conflict-chip" href="theater.html#' + c + '" title="Ver en Teatro: ' + cf.label + '" style="--chip-color:' + cf.color + ';text-decoration:none">' + cf.flag + ' ' + cf.label + '</a>';
    }).join('');

  var roleTags    = (plane.roles    || []).map(function(r) { return '<span class="role-tag">' + r + '</span>'; }).join('');
  var variantTags = (plane.variants || []).map(function(v) { return '<span class="variant-tag mono">' + v + '</span>'; }).join('');
  var tagsHtml    = (plane.tags     || []).map(function(t) { return '<span class="tech-tag">#' + t + '</span>'; }).join('');

  var ops     = (plane.operators || []).slice(0, 8).join(' · ');
  var moreOps = (plane.operators && plane.operators.length > 8) ? ' <span style="color:var(--text-3)">+' + (plane.operators.length - 8) + ' más</span>' : '';

  var twVal = plane.thrust_to_weight;
  var twBlock = '';
  if (twVal) {
    var twPct = Math.min(twVal * 80, 100);
    twBlock = '<div class="detail-tw-bar">' +
      '<div class="tw-bar-label"><span class="mono">Empuje/Peso</span><span class="mono tw-bar-val">' + twVal.toFixed(2) + '</span></div>' +
      '<div class="tw-bar-track"><div class="tw-bar-fill' + (twVal >= 1 ? ' over-unity' : '') + '" style="width:' + twPct + '%"></div></div>' +
      (twVal >= 1 ? '<p class="tw-note mono">≥ 1.0 — Superioridad de empuje</p>' : '<p class="tw-note mono">< 1.0 — Empuje subunidad</p>') +
      '</div>';
  }

  var relatedHtml = '';
  if (plane.related_aircraft && plane.related_aircraft.length) {
    relatedHtml = '<div class="related-aircraft"><span class="related-label mono">Ver también:</span>' +
      plane.related_aircraft.slice(0, 4).map(function(rid) {
        var rel = aircraftDB.find(function(p) { return p.id === rid; });
        return rel ? '<button class="related-btn" onclick="openDetail(\'' + rid + '\')">' + rel.name + '</button>' : '';
      }).join('') + '</div>';
  }

  var crewLabel = plane.crew === 0 ? 'No tripulado (UAV)' :
    (plane.crew + (plane.crew_roles && plane.crew_roles.length ? ' — ' + plane.crew_roles.join(', ') : ''));

  var html = '<div class="detail-grid">' +

    '<div class="detail-info">' +

      // Cabecera
      '<div class="detail-header-block">' +
        '<h1 class="detail-name header-font">' + plane.name + '</h1>' +
        '<div class="detail-badges-row">' +
          '<span class="detail-type-badge">' + plane.type + '</span>' +
          '<span class="detail-country mono">' + plane.country + ' · ' + plane.year + '</span>' +
          genBadgeHTML(plane) + statusBadge(plane.status) + stealthBadge(plane.stealth) +
        '</div>' +
        '<div class="detail-caps-row">' + capIcons(plane) + '</div>' +
      '</div>' +

      // Descripción
      '<p class="detail-desc">' + plane.desc + '</p>' +

      // Wikipedia
      '<section class="detail-section detail-wiki">' +
        '<h3 class="detail-section-title"><i class="fab fa-wikipedia-w"></i> Wikipedia <span id="wikiSpinner-' + id + '" class="wiki-spinner"></span></h3>' +
        '<p id="wikiText-' + id + '" class="wiki-text loading">Cargando...</p>' +
        '<a id="wikiLink-' + id + '" href="#" target="_blank" rel="noopener" class="wiki-link hidden">Leer artículo completo <i class="fas fa-external-link-alt"></i></a>' +
      '</section>' +

      // Rendimiento
      '<section class="detail-section">' +
        '<h3 class="detail-section-title"><i class="fas fa-tachometer-alt"></i> Rendimiento de vuelo</h3>' +
        '<div class="detail-specs">' +
          specRow('Velocidad máxima', _n(plane.speed) + ' km/h — Mach ' + (plane.speed / 1234.8).toFixed(2)) +
          specRow('Alcance operativo', _n(plane.range, 0, ' km')) +
          specRow('Radio de combate', _n(plane.combat_radius, 0, ' km')) +
          specRow('Techo de servicio', _n(plane.ceiling, 0, ' m')) +
          specRow('Relación empuje/peso', twVal ? twVal.toFixed(2) : null) +
          specRow('Carga alar', _n(plane.wing_loading, 0, ' kg/m²')) +
          (plane.endurance_h ? specRow('Autonomía', plane.endurance_h + ' h') : '') +
        '</div>' +
      '</section>' +

      // Motor
      '<section class="detail-section">' +
        '<h3 class="detail-section-title"><i class="fas fa-fire"></i> Planta motriz</h3>' +
        '<div class="detail-specs">' +
          specRow('Motor', _v(plane.engine)) +
          (plane.thrust_kn ? specRow('Empuje total', _n(plane.thrust_kn, 1, ' kN')) : '') +
          (plane.fuel_capacity ? specRow('Combustible interno', _n(plane.fuel_capacity, 0, ' L')) : '') +
        '</div>' +
      '</section>' +

      // Dimensiones
      '<section class="detail-section">' +
        '<h3 class="detail-section-title"><i class="fas fa-ruler-combined"></i> Dimensiones y Masa</h3>' +
        '<div class="detail-specs detail-specs-grid4">' +
          '<div class="spec-item"><span class="spec-label">Envergadura</span><span class="spec-value mono">' + _n(plane.wing_span, 2, ' m') + '</span></div>' +
          '<div class="spec-item"><span class="spec-label">Longitud</span><span class="spec-value mono">' + _n(plane.length, 2, ' m') + '</span></div>' +
          '<div class="spec-item"><span class="spec-label">Altura</span><span class="spec-value mono">' + _n(plane.height, 2, ' m') + '</span></div>' +
          (plane.wing_area ? '<div class="spec-item"><span class="spec-label">Sup. alar</span><span class="spec-value mono">' + _n(plane.wing_area, 1, ' m²') + '</span></div>' : '') +
          '<div class="spec-item"><span class="spec-label">MTOW</span><span class="spec-value mono">' + _n(plane.mtow / 1000, 1, ' T') + '</span></div>' +
          '<div class="spec-item"><span class="spec-label">Tripulación</span><span class="spec-value mono">' + crewLabel + '</span></div>' +
        '</div>' +
      '</section>' +

      // Aviónica
      '<section class="detail-section">' +
        '<h3 class="detail-section-title"><i class="fas fa-satellite-dish"></i> Aviónica y Sensores</h3>' +
        '<div class="detail-specs">' +
          (plane.radar ? '<div class="spec-item spec-avionics"><span class="spec-label">Radar</span><span class="spec-value mono">' + plane.radar + ' ' + radarTypeBadge(plane.radar_type) + '</span></div>' : radarTypeBadge(plane.radar_type) ? '<div class="spec-item"><span class="spec-label">Radar</span><span class="spec-value mono">' + radarTypeBadge(plane.radar_type) + '</span></div>' : '') +
          specRow('IRST', plane.irst ? '✔ Sí — Sensor infrarrojo pasivo' : '✘ No') +
          (plane.ew_system && plane.ew_system !== 'Ninguno' ? specRow('Guerra electrónica', plane.ew_system) : '') +
          (plane.data_link && plane.data_link !== 'Radio' ? specRow('Enlace de datos', plane.data_link) : '') +
          (plane.helmet_system ? specRow('Sistema de casco HMD', plane.helmet_system) : '') +
        '</div>' +
      '</section>' +

      // Armamento
      '<section class="detail-section">' +
        '<h3 class="detail-section-title"><i class="fas fa-bomb"></i> Armamento</h3>' +
        '<div class="armament-block">' + armamentBlock(plane) + '</div>' +
      '</section>' +

      // Roles
      (roleTags ? '<section class="detail-section"><h3 class="detail-section-title"><i class="fas fa-tasks"></i> Roles operativos</h3><div class="roles-row">' + roleTags + '</div></section>' : '') +

      // Producción
      '<section class="detail-section">' +
        '<h3 class="detail-section-title"><i class="fas fa-industry"></i> Producción y Estado</h3>' +
        '<div class="detail-specs">' +
          specRow('Fabricante', _v(plane.manufacturer)) +
          (plane.units_built ? specRow('Unidades fabricadas', _n(plane.units_built)) : '') +
          (plane.unit_cost_m ? specRow('Coste unitario', plane.unit_cost_m + ' M$ (aprox.)') : '') +
          (plane.retired_year ? specRow('Año de retiro', String(plane.retired_year)) : '') +
          (ops ? '<div class="spec-item spec-full"><span class="spec-label">Operadores</span><span class="spec-value mono" style="font-size:.72rem">' + ops + moreOps + '</span></div>' : '') +
        '</div>' +
      '</section>' +

      // Variantes
      (variantTags ? '<section class="detail-section"><h3 class="detail-section-title"><i class="fas fa-code-branch"></i> Variantes</h3><div class="variants-row">' + variantTags + '</div></section>' : '') +

      // Teatro de Operaciones + Historial (sección unificada)
      '<section class="detail-section detail-theater">' +
        '<h3 class="detail-section-title"><i class="fas fa-crosshairs"></i> Teatro de Operaciones</h3>' +
        (conflictChips
          ? '<div class="conflict-chips-wrap">' + conflictChips + '</div>'
          : '<p class="detail-section-sub no-conflicts">Sin despliegues registrados.</p>') +
        (plane.combat_history && plane.combat_history.length
          ? '<div style="margin-top:1rem"><h4 class="detail-section-title" style="font-size:.75rem"><i class="fas fa-scroll"></i> Historial Operacional</h4><div class="combat-history">' + combatHistoryBlock(plane.combat_history) + '</div></div>'
          : '') +
      '</section>' +

      // RCS
      (plane.radar_cross_section ? '<section class="detail-section"><h3 class="detail-section-title"><i class="fas fa-broadcast-tower"></i> Firma de Radar (RCS)</h3><p class="spec-value mono rcs-value">' + plane.radar_cross_section + '</p></section>' : '') +

      // Trivia
      '<section class="detail-section detail-trivia"><h3 class="detail-section-title"><i class="fas fa-bolt"></i> Dato de Inteligencia</h3><p class="trivia-text">"' + plane.trivia + '"</p></section>' +

      // Tags
      (tagsHtml ? '<div class="detail-tags">' + tagsHtml + '</div>' : '') +

      // Acciones
      '<div class="detail-actions">' +
        '<button class="detail-action-btn compare-action" onclick="addToCompareAndGo(\'' + plane.id + '\')"><i class="fas fa-balance-scale"></i> Comparar</button>' +
        '<button class="detail-action-btn share-action" onclick="shareCurrentDetail()"><i class="fas fa-share-alt"></i> Compartir</button>' +
        relatedHtml +
      '</div>' +

    '</div>' + // /detail-info

    // Columna visual
    '<div class="detail-visual">' +
      '<div class="detail-img-glow"></div>' +
      '<img src=".\/public\/max\/' + plane.img + '.webp" onerror="this.src=\'' + FALLBACK_IMG + '\'" class="detail-img" alt="' + plane.name + '">' +
      '<div class="detail-img-stats">' +
        '<div class="img-stat"><span class="img-stat-label">Vel. máx.</span><span class="img-stat-val header-font">' + _n(plane.speed) + ' km/h</span></div>' +
        '<div class="img-stat"><span class="img-stat-label">Techo</span><span class="img-stat-val header-font">' + _n(plane.ceiling / 1000, 1, 'km') + '</span></div>' +
        '<div class="img-stat"><span class="img-stat-label">Alcance</span><span class="img-stat-val header-font">' + _n(plane.range) + ' km</span></div>' +
        '<div class="img-stat"><span class="img-stat-label">MTOW</span><span class="img-stat-val header-font">' + _n(plane.mtow / 1000, 0, 'T') + '</span></div>' +
      '</div>' +
      twBlock +
    '</div>' +

  '</div>';

  document.getElementById('detailContent').innerHTML = html;

  var overlay = document.getElementById('detailOverlay');
  overlay.classList.remove('hidden');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';

  if (plane.wiki) fetchWikipediaSummary(plane);
}

// ── COMPARAR DESDE FICHA ───────────────────────────────────────
function addToCompareAndGo(id) {
  if (!compareList.includes(id) && compareList.length < MAX_COMPARE) compareList.push(id);
  try { sessionStorage.setItem('aeropedia_compare', JSON.stringify(compareList)); } catch(e) {}
  location.href = 'compare.html';
}

// ── CERRAR ─────────────────────────────────────────────────────
function closeDetail() {
  currentDetailId = null;
  // Limpiar el hash de la URL sin añadir entrada al historial
  var cleanUrl = window.location.pathname + window.location.search;
  history.replaceState(null, '', cleanUrl);
  _hideDetailOverlay();
}

function _hideDetailOverlay() {
  var overlay = document.getElementById('detailOverlay');
  if (!overlay) return;
  overlay.classList.remove('active');
  setTimeout(function() {
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
  }, 500);
}

// ── WIKIPEDIA ──────────────────────────────────────────────────
async function fetchWikipediaSummary(plane) {
  var id      = plane.id;
  var wikiKey = plane.wiki;
  var textEl  = document.getElementById('wikiText-' + id);
  var linkEl  = document.getElementById('wikiLink-' + id);
  var spinner = document.getElementById('wikiSpinner-' + id);
  if (!textEl || !wikiKey) return;
  if (wikiCache[wikiKey]) { renderWikiResult(wikiCache[wikiKey], textEl, linkEl, spinner); return; }
  try {
    var result = await queryWikiAPI('es', wikiKey);
    if (!result || result.extract.length < 80) result = await queryWikiAPI('en', wikiKey);
    if (result) { wikiCache[wikiKey] = result; renderWikiResult(result, textEl, linkEl, spinner); }
    else { textEl.textContent = 'Información no disponible.'; textEl.classList.remove('loading'); if(spinner) spinner.classList.add('hidden'); }
  } catch(e) {
    textEl.textContent = 'No se pudo conectar con Wikipedia.'; textEl.classList.remove('loading'); if(spinner) spinner.classList.add('hidden');
  }
}
async function queryWikiAPI(lang, title) {
  var url  = 'https://' + lang + '.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(title);
  var resp = await fetch(url, { signal: AbortSignal.timeout(6000) });
  if (!resp.ok) {
    var s   = await fetch('https://' + lang + '.wikipedia.org/w/api.php?action=query&list=search&srsearch=' + encodeURIComponent(title) + '&srlimit=1&format=json&origin=*', { signal: AbortSignal.timeout(6000) });
    if (!s.ok) return null;
    var sd  = await s.json();
    var hit = sd && sd.query && sd.query.search && sd.query.search[0];
    if (!hit) return null;
    var r2  = await fetch('https://' + lang + '.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(hit.title), { signal: AbortSignal.timeout(6000) });
    if (!r2.ok) return null;
    var d2  = await r2.json();
    return { extract: d2.extract || '', url: (d2.content_urls && d2.content_urls.desktop && d2.content_urls.desktop.page) || '', lang: lang, title: d2.title };
  }
  var data = await resp.json();
  return { extract: data.extract || '', url: (data.content_urls && data.content_urls.desktop && data.content_urls.desktop.page) || '', lang: lang, title: data.title };
}
function renderWikiResult(result, textEl, linkEl, spinner) {
  if (spinner) spinner.classList.add('hidden');
  var sentences = result.extract.split(/(?<=[.!?])\s+/);
  textEl.textContent = sentences.slice(0, 3).join(' ') || 'Sin extracto.';
  textEl.classList.remove('loading');
  if (result.url && linkEl) {
    linkEl.href = result.url;
    linkEl.classList.remove('hidden');
    linkEl.innerHTML = 'Leer en Wikipedia ' + (result.lang === 'es' ? '🇪🇸 ES' : '🇬🇧 EN') + ' <i class="fas fa-external-link-alt"></i>';
  }
}

// ── COMPARTIR ──────────────────────────────────────────────────
function shareCurrentDetail() {
  if (!currentDetailId) return;
  var plane = aircraftDB.find(function(p) { return p.id === currentDetailId; });
  var url   = location.origin + location.pathname + '#' + currentDetailId;
  var shareData = {
    title: plane ? 'AeroPedia — ' + plane.name : 'AeroPedia',
    text:  plane ? plane.desc.slice(0, 120) + '…' : 'Enciclopedia interactiva de aviación militar.',
    url:   url,
  };
  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    navigator.share(shareData).catch(function(err) {
      // El usuario canceló o hubo error — silencioso
      if (err.name !== 'AbortError') copyFallback(url);
    });
  } else {
    copyFallback(url);
  }
}
function copyFallback(url) {
  navigator.clipboard.writeText(url).then(showShareToast).catch(function() { prompt('Copia este enlace:', url); });
}
function showShareToast() {
  var t = document.getElementById('shareToast');
  if (!t) return;
  t.classList.add('visible');
  setTimeout(function() { t.classList.remove('visible'); }, 2500);
}
function resolveHash() {
  var hash = location.hash.replace('#', '').trim();
  if (hash && aircraftDB.find(function(p) { return p.id === hash; }))
    setTimeout(function() { openDetail(hash); }, 400);
}
