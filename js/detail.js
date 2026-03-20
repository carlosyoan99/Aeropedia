/**
 * detail.js — Ficha técnica completa v2
 * Usa todos los campos del esquema enriquecido de aircraft.json
 */

const wikiCache = {};

// ── HELPERS ────────────────────────────────────────────────────
function _v(val, suffix = '', fallback = '—') {
  if (val === null || val === undefined || val === '') return fallback;
  return `${val}${suffix}`;
}
function _n(val, decimals = 0, suffix = '', fallback = '—') {
  if (val === null || val === undefined) return fallback;
  return `${Number(val).toLocaleString('es-ES', { maximumFractionDigits: decimals })}${suffix}`;
}

function stealthBadge(level) {
  if (!level || level === 'none') return '<span class="stealth-badge none">Sin sigilo</span>';
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
    limited:   '<span class="status-badge limited"><i class="fas fa-circle"></i> Servicio limitado</span>',
  };
  return map[s] || '';
}

function capIcons(plane) {
  const caps = [];
  if (plane.carrier_capable) caps.push('<span class="cap-icon" title="Portaaviones"><i class="fas fa-ship"></i> Naval</span>');
  if (plane.vtol)            caps.push('<span class="cap-icon" title="Despegue/aterrizaje vertical"><i class="fas fa-arrows-alt-v"></i> VTOL</span>');
  else if (plane.stol)       caps.push('<span class="cap-icon" title="Despegue corto"><i class="fas fa-compress-alt"></i> STOL</span>');
  if (plane.irst)            caps.push('<span class="cap-icon" title="Sensor IRST pasivo"><i class="fas fa-eye"></i> IRST</span>');
  if (plane.stealth === 'high' || plane.stealth === 'medium')
    caps.push('<span class="cap-icon" title="Tecnología furtiva"><i class="fas fa-ghost"></i> Stealth</span>');
  if (plane.crew === 0)      caps.push('<span class="cap-icon" title="No tripulado"><i class="fas fa-robot"></i> UAV</span>');
  return caps.join('');
}

function armamentBlock(p) {
  const arm = p.armament;
  if (!arm || typeof arm !== 'object') return `<p class="spec-value mono">${p.arm || '—'}</p>`;
  const rows = [];
  if (arm.gun)                                   rows.push(`<div class="arm-row"><span class="arm-icon"><i class="fas fa-crosshairs"></i></span><span class="arm-label">Cañón</span><span class="arm-val mono">${arm.gun}</span></div>`);
  if (arm.hardpoints)                            rows.push(`<div class="arm-row"><span class="arm-icon"><i class="fas fa-layer-group"></i></span><span class="arm-label">Puntos de carga</span><span class="arm-val mono">${arm.hardpoints}</span></div>`);
  if (arm.missiles?.length)  rows.push(`<div class="arm-row"><span class="arm-icon"><i class="fas fa-bolt"></i></span><span class="arm-label">Misiles</span><span class="arm-val mono">${arm.missiles.join(' · ')}</span></div>`);
  if (arm.bombs?.length)     rows.push(`<div class="arm-row"><span class="arm-icon"><i class="fas fa-bomb"></i></span><span class="arm-label">Bombas / Armas</span><span class="arm-val mono">${arm.bombs.join(' · ')}</span></div>`);
  return rows.join('') || `<p class="spec-value mono">${p.arm || '—'}</p>`;
}

function combatHistoryBlock(history) {
  if (!history?.length) return '';
  return history.map(h => {
    const cf = conflictsDB[h.conflict];
    const label = cf ? `${cf.flag} ${cf.label} (${cf.years})` : h.conflict;
    return `<div class="combat-entry">
      <p class="combat-label">${label}</p>
      ${h.missions ? `<p class="combat-missions mono">${h.missions.toLocaleString('es-ES')} misiones</p>` : ''}
      <p class="combat-notes">${h.notes}</p>
    </div>`;
  }).join('');
}

function specRow(label, value, icon = '') {
  if (value === '—' || value === null || value === undefined) return '';
  return `<div class="spec-item">
    <span class="spec-label">${icon ? `<i class="fas ${icon}"></i> ` : ''}${label}</span>
    <span class="spec-value mono">${value}</span>
  </div>`;
}

// ── ABRIR DETALLE ──────────────────────────────────────────────
function openDetail(id) {
  const plane = aircraftDB.find(p => p.id === id);
  if (!plane) return;

  currentDetailId = id;
  history.replaceState(null, '', `#${id}`);

  // Chips de conflictos
  const conflictChips = (plane.conflicts || [])
    .filter(c => conflictsDB[c])
    .map(c => {
      const cf = conflictsDB[c];
      return `<button class="conflict-chip"
                      onclick="selectConflictAndClose('${c}')"
                      title="Filtrar por: ${cf.label}"
                      style="--chip-color:${cf.color}">
                ${cf.flag} ${cf.label}
              </button>`;
    }).join('');

  // Roles como tags
  const roleTags = (plane.roles || [])
    .map(r => `<span class="role-tag">${r}</span>`).join('');

  // Variantes
  const variantTags = (plane.variants || [])
    .map(v => `<span class="variant-tag mono">${v}</span>`).join('');

  // Operadores
  const operatorsList = (plane.operators || []).slice(0, 8).join(' · ');
  const moreOps = (plane.operators?.length || 0) > 8 ? ` <span style="color:var(--text-3)">+${plane.operators.length - 8} más</span>` : '';

  // tags
  const tagsHtml = (plane.tags || []).map(t => `<span class="tech-tag">#${t}</span>`).join('');

  document.getElementById('detailContent').innerHTML = `
    <div class="detail-grid">

      <!-- COLUMNA IZQUIERDA -->
      <div class="detail-info">

        <!-- Cabecera -->
        <div class="detail-header-block">
          <h1 class="detail-name header-font">${plane.name}</h1>
          <div class="detail-badges-row">
            <span class="detail-type-badge">${plane.type}</span>
            <span class="detail-country mono">${plane.country} · ${plane.year}</span>
            ${genBadgeHTML(plane)}
            ${statusBadge(plane.status)}
            ${stealthBadge(plane.stealth)}
          </div>
          <div class="detail-caps-row">${capIcons(plane)}</div>
        </div>

        <!-- Descripción -->
        <p class="detail-desc">${plane.desc}</p>

        <!-- Wikipedia -->
        <section class="detail-section detail-wiki">
          <h3 class="detail-section-title">
            <i class="fab fa-wikipedia-w"></i> Wikipedia
            <span id="wikiSpinner-${id}" class="wiki-spinner"></span>
          </h3>
          <p id="wikiText-${id}" class="wiki-text loading">Cargando...</p>
          <a id="wikiLink-${id}" href="#" target="_blank" rel="noopener" class="wiki-link hidden">
            Leer artículo completo <i class="fas fa-external-link-alt"></i>
          </a>
        </section>

        <!-- ══ RENDIMIENTO DE VUELO ══ -->
        <section class="detail-section">
          <h3 class="detail-section-title"><i class="fas fa-tachometer-alt"></i> Rendimiento de vuelo</h3>
          <div class="detail-specs">
            ${specRow('Velocidad máxima', `${_n(plane.speed)} km/h — Mach ${(plane.speed/1234.8).toFixed(2)}`)}
            ${specRow('Alcance operativo', _n(plane.range, 0, ' km'))}
            ${specRow('Radio de combate', _n(plane.combat_radius, 0, ' km'))}
            ${specRow('Techo de servicio', _n(plane.ceiling, 0, ' m'))}
            ${specRow('Relación empuje/peso', _v(plane.thrust_to_weight?.toFixed(2)))}
            ${specRow('Carga alar', _n(plane.wing_loading, 0, ' kg/m²'))}
            ${plane.endurance_h ? specRow('Autonomía', `${plane.endurance_h} h`) : ''}
          </div>
        </section>

        <!-- ══ PLANTA MOTRIZ ══ -->
        <section class="detail-section">
          <h3 class="detail-section-title"><i class="fas fa-fire"></i> Planta motriz</h3>
          <div class="detail-specs">
            ${specRow('Motor', _v(plane.engine))}
            ${plane.thrust_kn ? specRow('Empuje total', `${_n(plane.thrust_kn, 1)} kN`) : ''}
            ${plane.fuel_capacity ? specRow('Combustible interno', `${_n(plane.fuel_capacity, 0)} L`) : ''}
          </div>
        </section>

        <!-- ══ DIMENSIONES ══ -->
        <section class="detail-section">
          <h3 class="detail-section-title"><i class="fas fa-ruler-combined"></i> Dimensiones</h3>
          <div class="detail-specs detail-specs-grid4">
            <div class="spec-item spec-dim"><span class="spec-label">Envergadura</span><span class="spec-value mono">${_n(plane.wing_span, 2)} m</span></div>
            <div class="spec-item spec-dim"><span class="spec-label">Longitud</span><span class="spec-value mono">${_n(plane.length, 2)} m</span></div>
            <div class="spec-item spec-dim"><span class="spec-label">Altura</span><span class="spec-value mono">${_n(plane.height, 2)} m</span></div>
            <div class="spec-item spec-dim"><span class="spec-label">Sup. alar</span><span class="spec-value mono">${_n(plane.wing_area, 1)} m²</span></div>
            <div class="spec-item spec-dim"><span class="spec-label">MTOW</span><span class="spec-value mono">${_n(plane.mtow/1000, 1)} T</span></div>
            <div class="spec-item spec-dim"><span class="spec-label">Año servicio</span><span class="spec-value mono">${plane.year}</span></div>
            <div class="spec-item spec-dim"><span class="spec-label">Tripulación</span><span class="spec-value mono">${plane.crew === 0 ? 'No tripulado (UAV)' : `${plane.crew} (${(plane.crew_roles||[]).join(', ')})`}</span></div>
          </div>
        </section>

        <!-- ══ AVIÓNICA Y SENSORES ══ -->
        <section class="detail-section">
          <h3 class="detail-section-title"><i class="fas fa-satellite-dish"></i> Aviónica y Sensores</h3>
          <div class="detail-specs">
            <div class="spec-item spec-avionics">
              <span class="spec-label">Radar</span>
              <span class="spec-value mono">${_v(plane.radar)} ${radarTypeBadge(plane.radar_type)}</span>
            </div>
            ${specRow('IRST', plane.irst ? '✔ Sí — Sensor infrarrojo pasivo' : '✘ No')}
            ${plane.ew_system && plane.ew_system !== 'Ninguno' ? specRow('Guerra electrónica', _v(plane.ew_system)) : ''}
            ${plane.data_link && plane.data_link !== 'Radio' ? specRow('Enlace de datos', _v(plane.data_link)) : ''}
            ${plane.helmet_system ? specRow('Sistema de casco HMD', _v(plane.helmet_system)) : ''}
          </div>
        </section>

        <!-- ══ ARMAMENTO ══ -->
        <section class="detail-section">
          <h3 class="detail-section-title"><i class="fas fa-bomb"></i> Armamento</h3>
          <div class="armament-block">${armamentBlock(plane)}</div>
        </section>

        <!-- ══ CAPACIDADES OPERATIVAS ══ -->
        ${roleTags ? `<section class="detail-section">
          <h3 class="detail-section-title"><i class="fas fa-tasks"></i> Roles operativos</h3>
          <div class="roles-row">${roleTags}</div>
        </section>` : ''}

        <!-- ══ PRODUCCIÓN Y ESTADO ══ -->
        <section class="detail-section">
          <h3 class="detail-section-title"><i class="fas fa-industry"></i> Producción y Estado</h3>
          <div class="detail-specs">
            ${specRow('Fabricante', _v(plane.manufacturer))}
            ${plane.units_built ? specRow('Unidades fabricadas', _n(plane.units_built)) : ''}
            ${plane.unit_cost_m ? specRow('Coste unitario', `${plane.unit_cost_m} M$ (año aprox.)`) : ''}
            ${plane.retired_year ? specRow('Año de retiro', String(plane.retired_year)) : ''}
            ${plane.derived_from ? specRow('Basado en', _v(plane.derived_from)) : ''}
            ${operatorsList ? `<div class="spec-item spec-full">
              <span class="spec-label">Operadores</span>
              <span class="spec-value mono" style="font-size:.72rem">${operatorsList}${moreOps}</span>
            </div>` : ''}
          </div>
        </section>

        <!-- ══ VARIANTES ══ -->
        ${variantTags ? `<section class="detail-section">
          <h3 class="detail-section-title"><i class="fas fa-code-branch"></i> Variantes</h3>
          <div class="variants-row">${variantTags}</div>
        </section>` : ''}

        <!-- ══ TEATRO DE OPERACIONES ══ -->
        <section class="detail-section detail-theater">
          <h3 class="detail-section-title"><i class="fas fa-crosshairs"></i> Teatro de Operaciones
            <a href="theater.html" class="theater-ext-link" title="Ver página de Teatro">
              <i class="fas fa-external-link-alt"></i>
            </a>
          </h3>
          ${conflictChips
            ? `<div class="conflict-chips-wrap">${conflictChips}</div>`
            : `<p class="detail-section-sub no-conflicts">Sin despliegues operativos registrados.</p>`}
        </section>

        <!-- ══ HISTORIAL OPERACIONAL ══ -->
        ${plane.combat_history?.length ? `
        <section class="detail-section">
          <h3 class="detail-section-title"><i class="fas fa-scroll"></i> Historial Operacional</h3>
          <div class="combat-history">${combatHistoryBlock(plane.combat_history)}</div>
        </section>` : ''}

        <!-- ══ FIRMA RADAR ══ -->
        ${plane.radar_cross_section ? `
        <section class="detail-section">
          <h3 class="detail-section-title"><i class="fas fa-broadcast-tower"></i> Firma de Radar (RCS)</h3>
          <p class="spec-value mono rcs-value">${plane.radar_cross_section}</p>
        </section>` : ''}

        <!-- ══ DATO DE INTELIGENCIA ══ -->
        <section class="detail-section detail-trivia">
          <h3 class="detail-section-title"><i class="fas fa-bolt"></i> Dato de Inteligencia</h3>
          <p class="trivia-text">"${plane.trivia}"</p>
        </section>

        <!-- Tags -->
        ${tagsHtml ? `<div class="detail-tags">${tagsHtml}</div>` : ''}

        <!-- Acciones finales -->
        <div class="detail-actions">
          <button class="detail-action-btn compare-action"
                  onclick="addToCompareAndGo('${plane.id}')"
                  title="Abrir comparador con esta aeronave">
            <i class="fas fa-balance-scale"></i> Comparar
          </button>
          <button class="detail-action-btn share-action" onclick="shareCurrentDetail()">
            <i class="fas fa-share-alt"></i> Compartir
          </button>
          ${plane.related_aircraft?.length ? `
          <div class="related-aircraft">
            <span class="related-label mono">Ver también:</span>
            ${plane.related_aircraft.slice(0, 4).map(rid => {
              const rel = aircraftDB.find(p => p.id === rid);
              return rel
                ? `<button class="related-btn" onclick="closeDetail(); setTimeout(()=>openDetail('${rid}'),300)">
                    ${rel.name}
                   </button>`
                : '';
            }).join('')}
          </div>` : ''}
        </div>

      </div><!-- /detail-info -->

      <!-- COLUMNA DERECHA: imagen + stats rápidos -->
      <div class="detail-visual">
        <div class="detail-img-glow"></div>
        <img src="${plane.img}"
             onerror="this.src='${FALLBACK_IMG}'"
             class="detail-img" alt="${plane.name}">
        <div class="detail-img-stats">
          <div class="img-stat">
            <span class="img-stat-label">Vel. máx.</span>
            <span class="img-stat-val header-font">${_n(plane.speed)} km/h</span>
          </div>
          <div class="img-stat">
            <span class="img-stat-label">Techo</span>
            <span class="img-stat-val header-font">${_n(plane.ceiling/1000, 1)}km</span>
          </div>
          <div class="img-stat">
            <span class="img-stat-label">Alcance</span>
            <span class="img-stat-val header-font">${_n(plane.range)} km</span>
          </div>
          <div class="img-stat">
            <span class="img-stat-label">MTOW</span>
            <span class="img-stat-val header-font">${_n(plane.mtow/1000, 0)}T</span>
          </div>
        </div>

        <!-- Mini barra de empuje/peso -->
        ${plane.thrust_to_weight ? `
        <div class="detail-tw-bar">
          <div class="tw-bar-label">
            <span class="mono">Empuje/Peso</span>
            <span class="mono tw-bar-val">${plane.thrust_to_weight.toFixed(2)}</span>
          </div>
          <div class="tw-bar-track">
            <div class="tw-bar-fill ${plane.thrust_to_weight >= 1 ? 'over-unity' : ''}"
                 style="width:${Math.min(plane.thrust_to_weight * 80, 100)}%"></div>
          </div>
          ${plane.thrust_to_weight >= 1
            ? '<p class="tw-note mono">≥ 1.0 — Superioridad de empuje</p>'
            : '<p class="tw-note mono">&lt; 1.0 — Empuje subunidad</p>'}
        </div>` : ''}
      </div>
    </div>`;

  const overlay = document.getElementById('detailOverlay');
  overlay.classList.remove('hidden');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';

  if (plane.wiki) fetchWikipediaSummary(plane);
}

// ── COMPARAR DESDE FICHA ───────────────────────────────────────
function addToCompareAndGo(id) {
  if (!compareList.includes(id)) {
    if (compareList.length < MAX_COMPARE) compareList.push(id);
  }
  // Guardar en sessionStorage para que compare.html lo recoja
  try { sessionStorage.setItem('aeropedia_compare', JSON.stringify(compareList)); } catch(e) {}
  location.href = 'compare.html';
}

// ── CERRAR DETALLE ─────────────────────────────────────────────
function closeDetail() {
  currentDetailId = null;
  history.replaceState(null, '', window.location.pathname + window.location.search);
  const overlay = document.getElementById('detailOverlay');
  overlay.classList.remove('active');
  setTimeout(() => {
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
  }, 500);
}

// ── WIKIPEDIA ──────────────────────────────────────────────────
async function fetchWikipediaSummary(plane) {
  const id      = plane.id;
  const wikiKey = plane.wiki;
  const textEl  = document.getElementById(`wikiText-${id}`);
  const linkEl  = document.getElementById(`wikiLink-${id}`);
  const spinner = document.getElementById(`wikiSpinner-${id}`);
  if (!textEl || !wikiKey) return;

  if (wikiCache[wikiKey]) {
    renderWikiResult(wikiCache[wikiKey], textEl, linkEl, spinner);
    return;
  }
  try {
    let result = await queryWikiAPI('es', wikiKey);
    if (!result || result.extract.length < 80) result = await queryWikiAPI('en', wikiKey);
    if (result) { wikiCache[wikiKey] = result; renderWikiResult(result, textEl, linkEl, spinner); }
    else {
      textEl.textContent = 'Información no disponible.';
      textEl.classList.remove('loading');
      spinner?.classList.add('hidden');
    }
  } catch {
    textEl.textContent = 'No se pudo conectar con Wikipedia.';
    textEl.classList.remove('loading');
    spinner?.classList.add('hidden');
  }
}

async function queryWikiAPI(lang, title) {
  const url  = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const resp = await fetch(url, { signal: AbortSignal.timeout(6000) });
  if (!resp.ok) {
    const s    = await fetch(`https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(title)}&srlimit=1&format=json&origin=*`, { signal: AbortSignal.timeout(6000) });
    if (!s.ok) return null;
    const sd   = await s.json();
    const hit  = sd?.query?.search?.[0];
    if (!hit) return null;
    const r2   = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(hit.title)}`, { signal: AbortSignal.timeout(6000) });
    if (!r2.ok) return null;
    const d2   = await r2.json();
    return { extract: d2.extract || '', url: d2.content_urls?.desktop?.page || '', lang, title: d2.title };
  }
  const data = await resp.json();
  return { extract: data.extract || '', url: data.content_urls?.desktop?.page || '', lang, title: data.title };
}

function renderWikiResult(result, textEl, linkEl, spinner) {
  spinner?.classList.add('hidden');
  const sentences = result.extract.split(/(?<=[.!?])\s+/);
  textEl.textContent = sentences.slice(0, 3).join(' ') || 'Sin extracto disponible.';
  textEl.classList.remove('loading');
  if (result.url && linkEl) {
    linkEl.href = result.url;
    linkEl.classList.remove('hidden');
    linkEl.innerHTML = `Leer en Wikipedia ${result.lang === 'es' ? '🇪🇸 ES' : '🇬🇧 EN'} <i class="fas fa-external-link-alt"></i>`;
  }
}

// ── COMPARTIR ──────────────────────────────────────────────────
function shareCurrentDetail() {
  if (!currentDetailId) return;
  const url = `${location.origin}${location.pathname}#${currentDetailId}`;
  navigator.clipboard.writeText(url).then(showShareToast).catch(() => prompt('Copia este enlace:', url));
}
function showShareToast() {
  const t = document.getElementById('shareToast');
  if (!t) return;
  t.classList.add('visible');
  setTimeout(() => t.classList.remove('visible'), 2500);
}

function resolveHash() {
  const hash = location.hash.replace('#', '').trim();
  if (hash && aircraftDB.find(p => p.id === hash)) setTimeout(() => openDetail(hash), 400);
}

