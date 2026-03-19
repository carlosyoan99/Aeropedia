/**
 * detail.js — Ficha técnica completa con Wikipedia y Teatro de Operaciones
 */

const wikiCache = {};

// ── ABRIR DETALLE ─────────────────────────────────────────────
function openDetail(id) {
  const plane = aircraftDB.find(p => p.id === id);
  if (!plane) return;

  currentDetailId = id;
  history.replaceState(null, '', `#${id}`);

  // Construir chips de conflictos
  const conflictChips = (plane.conflicts || [])
    .filter(c => conflictsDB[c])
    .map(c => {
      const cf = conflictsDB[c];
      return `<button class="conflict-chip"
                      onclick="selectConflictAndClose('${c}')"
                      title="Filtrar por: ${cf.label} (${cf.years})"
                      style="--chip-color:${cf.color}">
                ${cf.flag} ${cf.label}
              </button>`;
    }).join('');

  // HTML de la sección Teatro en la ficha
  const theaterSection = conflictChips ? `
    <section class="detail-section detail-theater">
      <h3 class="detail-section-title">
        <i class="fas fa-crosshairs"></i> Teatro de Operaciones
      </h3>
      <p class="detail-section-sub">
        Conflictos en los que esta aeronave ha participado. Clic para filtrar la galería.
      </p>
      <div class="conflict-chips-wrap">${conflictChips}</div>
    </section>` : `
    <section class="detail-section detail-theater">
      <h3 class="detail-section-title">
        <i class="fas fa-crosshairs"></i> Teatro de Operaciones
      </h3>
      <p class="detail-section-sub no-conflicts">
        Sin despliegues operativos registrados.
      </p>
    </section>`;

  document.getElementById('detailContent').innerHTML = `
    <div class="detail-grid">

      <!-- Columna izquierda: info -->
      <div class="detail-info">
        <h1 class="detail-name header-font">${plane.name}</h1>
        <div class="detail-meta">
          <span class="detail-type-badge">${plane.type} // ${plane.country}</span>
          ${genBadgeHTML(plane)}
        </div>

        <p class="detail-desc">${plane.desc}</p>

        <!-- Wikipedia -->
        <section class="detail-section detail-wiki">
          <h3 class="detail-section-title">
            <i class="fab fa-wikipedia-w"></i> Wikipedia
            <span id="wikiSpinner-${id}" class="wiki-spinner"></span>
          </h3>
          <p id="wikiText-${id}" class="wiki-text loading">Cargando información...</p>
          <a id="wikiLink-${id}" href="#" target="_blank" rel="noopener"
             class="wiki-link hidden">
            Leer artículo completo <i class="fas fa-external-link-alt"></i>
          </a>
        </section>

        <!-- Stats técnicos -->
        <section class="detail-section">
          <div class="detail-specs">
            <div class="spec-item">
              <span class="spec-label">Armamento</span>
              <span class="spec-value mono">${plane.arm}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Año de entrada</span>
              <span class="spec-value mono">${plane.year}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Velocidad máxima</span>
              <span class="spec-value mono">${plane.speed} km/h — MACH ${(plane.speed / 1234.8).toFixed(2)}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Radio de acción</span>
              <span class="spec-value mono">${plane.range.toLocaleString('es-ES')} km</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Techo de servicio</span>
              <span class="spec-value mono">${plane.ceiling.toLocaleString('es-ES')} m</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Peso máx. despegue</span>
              <span class="spec-value mono">${(plane.mtow / 1000).toFixed(1)} T</span>
            </div>
          </div>
        </section>

        <!-- Teatro de Operaciones -->
        ${theaterSection}

        <!-- Dato de inteligencia -->
        <section class="detail-section detail-trivia">
          <h3 class="detail-section-title">
            <i class="fas fa-bolt"></i> Dato de Inteligencia
          </h3>
          <p class="trivia-text">"${plane.trivia}"</p>
        </section>
      </div>

      <!-- Columna derecha: imagen -->
      <div class="detail-visual">
        <div class="detail-img-glow"></div>
        <img src="./public/${plane.wiki}.webp"
             onerror="this.src='${FALLBACK_IMG}'"
             class="detail-img" alt="${plane.name}">
        <div class="detail-img-stats">
          <div class="img-stat">
            <span class="img-stat-label">Techo</span>
            <span class="img-stat-val header-font">${plane.ceiling.toLocaleString('es-ES')}m</span>
          </div>
          <div class="img-stat">
            <span class="img-stat-label">Masa Máx</span>
            <span class="img-stat-val header-font">${(plane.mtow / 1000).toFixed(0)}T</span>
          </div>
        </div>
      </div>
    </div>`;

  const overlay = document.getElementById('detailOverlay');
  overlay.classList.remove('hidden');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Cargar Wikipedia de forma no bloqueante
  if (plane.wiki) fetchWikipediaSummary(plane);
}

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

// ── WIKIPEDIA API ─────────────────────────────────────────────
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
    // Intentar primero en español, luego en inglés como fallback
    let result = await queryWikiAPI('es', wikiKey);
    if (!result || result.extract.length < 100) {
      result = await queryWikiAPI('en', wikiKey);
    }

    if (result) {
      wikiCache[wikiKey] = result;
      renderWikiResult(result, textEl, linkEl, spinner);
    } else {
      textEl.textContent = 'Información de Wikipedia no disponible para esta aeronave.';
      textEl.classList.remove('loading');
      spinner?.classList.add('hidden');
    }
  } catch (err) {
    console.warn('[Wiki]', err);
    textEl.textContent = 'No se pudo conectar con Wikipedia.';
    textEl.classList.remove('loading');
    spinner?.classList.add('hidden');
  }
}

async function queryWikiAPI(lang, title) {
  const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const resp = await fetch(url, { signal: AbortSignal.timeout(6000) });

  if (!resp.ok) {
    // Búsqueda fuzzy como fallback
    const sURL  = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(title)}&srlimit=1&format=json&origin=*`;
    const sResp = await fetch(sURL, { signal: AbortSignal.timeout(6000) });
    if (!sResp.ok) return null;
    const sData = await sResp.json();
    const hit   = sData?.query?.search?.[0];
    if (!hit) return null;
    const r2 = await fetch(
      `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(hit.title)}`,
      { signal: AbortSignal.timeout(6000) }
    );
    if (!r2.ok) return null;
    const d2 = await r2.json();
    console.log(d2);
    return { extract: d2.extract || '', url: d2.content_urls?.desktop?.page || '', lang, title: d2.title };
  }

  const data = await resp.json();
  console.log(data);
  return { extract: data.extract || '', url: data.content_urls?.desktop?.page || '', lang, title: data.title };
}

function renderWikiResult(result, textEl, linkEl, spinner) {
  spinner?.classList.add('hidden');
  const sentences = result.extract.split(/(?<=[.!?])\s+/);
  const excerpt   = sentences.slice(0, 3).join(' ');
  
  textEl.textContent = excerpt || 'Sin extracto disponible.';
  textEl.classList.remove('loading');

  if (result.url && linkEl) {
    linkEl.href = result.url;
    linkEl.classList.remove('hidden');
    const lang = result.lang === 'es' ? '🇪🇸 ES' : '🇬🇧 EN';
    linkEl.innerHTML = `Leer en Wikipedia ${lang} <i class="fas fa-external-link-alt"></i>`;
  }
}

// ── COMPARTIR ─────────────────────────────────────────────────
function shareCurrentDetail() {
  if (!currentDetailId) return;
  const url = `${location.origin}${location.pathname}#${currentDetailId}`;
  navigator.clipboard.writeText(url)
    .then(showShareToast)
    .catch(() => prompt('Copia este enlace:', url));
}

function showShareToast() {
  const toast = document.getElementById('shareToast');
  if (!toast) return;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 2500);
}

function resolveHash() {
  const hash = location.hash.replace('#', '').trim();
  if (hash && aircraftDB.find(p => p.id === hash)) {
    setTimeout(() => openDetail(hash), 400);
  }
}
