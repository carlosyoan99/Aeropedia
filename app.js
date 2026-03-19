/**
 * AeroPedia — Lógica principal
 * Depende de: data/aircraft.js (aircraftDB)
 */

// ═══════════════════════════════════════════════════════════
// FAVORITOS — localStorage
// ═══════════════════════════════════════════════════════════
const FAV_KEY = 'aeropedia_favs';

function getFavs() {
    try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; }
    catch { return []; }
}
function saveFavs(favs) { localStorage.setItem(FAV_KEY, JSON.stringify(favs)); }
function isFav(id) { return getFavs().includes(id); }

function toggleFav(id) {
    let favs = getFavs();
    favs = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id];
    saveFavs(favs);
    const btn = document.getElementById(`favBtn-${id}`);
    if (btn) {
        btn.classList.toggle('active', favs.includes(id));
        btn.title = favs.includes(id) ? 'Quitar de favoritos' : 'Añadir a favoritos';
    }
    if (onlyFavs) renderAll();
}

// ═══════════════════════════════════════════════════════════
// ESTADO GLOBAL
// ═══════════════════════════════════════════════════════════
let compareList  = [];
let activeEra    = 'all';
let onlyFavs     = false;
let currentView  = 'gallery';
let sortStat     = 'speed';
let sortAsc      = false;
let currentDetailId = null;
const MAX_COMPARE   = 3;

// ── Estado de la línea de tiempo ──────────────────
const TIMELINE_MIN_YEAR = 1940;
const TIMELINE_MAX_YEAR = 2024;
const TIMELINE_STEP     = 10;
let timelineMin = TIMELINE_MIN_YEAR;
let timelineMax = TIMELINE_MAX_YEAR;
let timelineActive = false;     // true si el filtro está activo

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════
function getEraFromYear(year) {
    if (year < 1945)  return 'sgm';
    if (year < 1992)  return 'coldwar';
    if (year < 2010)  return 'postgf';
    return 'modern';
}

/**
 * Devuelve el HTML del badge de generación para cazas.
 * Para otros tipos devuelve cadena vacía.
 */
function genBadgeHTML(plane) {
    if (!plane.generation) return '';
    const map = {
        '3ª':   { cls: 'gen-3',  label: 'Gen 3ª' },
        '4ª':   { cls: 'gen-4',  label: 'Gen 4ª' },
        '4.5ª': { cls: 'gen-45', label: 'Gen 4.5ª' },
        '5ª':   { cls: 'gen-5',  label: '✦ Gen 5ª' },
    };
    const g = map[plane.generation];
    if (!g) return '';
    return `<span class="gen-badge ${g.cls}">${g.label}</span>`;
}

/** Velocidad del sonido en km/h según altitud (modelo ISA simplificado) */
function speedOfSound(altMeters) {
    if (altMeters <= 11000) {
        const T = 288.15 - 0.0065 * altMeters;
        return 331.3 * Math.sqrt(T / 273.15) * 3.6;
    }
    return 1062.5; // estratosfera inferior ~295 m/s
}

const STAT_META = {
    speed:   { label: 'Velocidad Máx',        unit: 'km/h', max: 8000,   color: '#3b82f6' },
    range:   { label: 'Rango Operativo',       unit: 'km',   max: 15000,  color: '#8b5cf6' },
    ceiling: { label: 'Techo de Servicio',     unit: 'm',    max: 30000,  color: '#06b6d4' },
    mtow:    { label: 'Peso Máx. Despegue',    unit: 'kg',   max: 420000, color: '#f59e0b' },
};

const FALLBACK_IMG = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/1200px-No-Image-Placeholder.svg.png';

function getFilters() {
    return {
        search: document.getElementById('mainSearch').value,
        cat:    document.getElementById('catFilter').value,
        era:    activeEra
    };
}

// ═══════════════════════════════════════════════════════════
// RENDER DE CARDS
// ═══════════════════════════════════════════════════════════
function createCard(plane) {
    const speedPct   = Math.min((plane.speed / 3600) * 100, 100);
    const rangePct   = Math.min((plane.range / 15000) * 100, 100);
    const isSelected = compareList.includes(plane.id);
    const favActive  = isFav(plane.id);

    return `
        <div id="card-${plane.id}"
             class="glass-card rounded-3xl overflow-hidden flex flex-col h-full border-b-4 border-slate-900/10 hover:border-blue-600 transition-all ${isSelected ? 'selected-for-compare' : ''}">

            <div class="img-container">
                <img src="${plane.img}"
                     alt="${plane.name}"
                     loading="lazy"
                     onerror="this.src='${FALLBACK_IMG}'">
                <div class="absolute top-4 left-4 bg-blue-600 text-white text-[9px] px-3 py-1 rounded-full uppercase font-black tracking-widest">
                    ${plane.type}
                </div>
                <div class="absolute top-4 right-4 bg-black/50 text-white text-[9px] px-2 py-1 rounded mono">
                    ${plane.year}
                </div>
                <div class="absolute bottom-4 right-4 bg-black/50 text-white text-[10px] px-2 py-1 rounded mono">
                    MACH ${(plane.speed / 1234.8).toFixed(1)}
                </div>
            </div>

            <div class="p-6 flex-grow flex flex-col">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h2 class="header-font text-2xl font-black italic tracking-tighter uppercase leading-none mb-1">${plane.name}</h2>
                        <div class="flex items-center gap-2 flex-wrap">
                            <span class="mono text-[10px] font-bold text-slate-400 uppercase">${plane.country}</span>
                            ${genBadgeHTML(plane)}
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3 mb-6">
                    <div class="stat-badge">
                        <span class="text-[9px] uppercase text-slate-400 block font-bold">Techo Máx</span>
                        <span class="text-xs font-black">${plane.ceiling.toLocaleString()} m</span>
                    </div>
                    <div class="stat-badge">
                        <span class="text-[9px] uppercase text-slate-400 block font-bold">MTOW</span>
                        <span class="text-xs font-black">${(plane.mtow / 1000).toFixed(1)} T</span>
                    </div>
                </div>

                <div class="space-y-4 mb-6">
                    <div>
                        <div class="flex justify-between text-[9px] font-black uppercase mb-1">
                            <span>Velocidad</span>
                            <span class="mono text-blue-600">${plane.speed} km/h</span>
                        </div>
                        <div class="h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div class="h-full bg-blue-600 rounded-full" style="width:${speedPct}%"></div>
                        </div>
                    </div>
                    <div>
                        <div class="flex justify-between text-[9px] font-black uppercase mb-1">
                            <span>Rango Operativo</span>
                            <span class="mono text-indigo-600">${plane.range} km</span>
                        </div>
                        <div class="h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div class="h-full bg-indigo-500 rounded-full" style="width:${rangePct}%"></div>
                        </div>
                    </div>
                </div>

                <div class="mt-auto flex gap-2">
                    <button onclick="openDetail('${plane.id}')"
                            class="flex-1 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                        <i class="fas fa-file-invoice"></i> Ficha técnica
                    </button>
                    <button onclick="toggleFav('${plane.id}')"
                            id="favBtn-${plane.id}"
                            title="${favActive ? 'Quitar de favoritos' : 'Añadir a favoritos'}"
                            class="fav-btn px-3 py-3 rounded-xl border-2 border-slate-200 hover:border-yellow-400 transition-all text-[10px] ${favActive ? 'active text-yellow-400' : 'text-slate-300'}">
                        <i class="fas fa-star"></i>
                    </button>
                    <button onclick="toggleCompare('${plane.id}')"
                            id="cmpBtn-${plane.id}"
                            title="${isSelected ? 'Quitar de comparación' : 'Añadir a comparación'}"
                            class="px-3 py-3 rounded-xl border-2 transition-all text-[10px] font-black
                                   ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 text-slate-400 hover:border-blue-600 hover:text-blue-600'}">
                        <i class="fas ${isSelected ? 'fa-check' : 'fa-plus'}"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ═══════════════════════════════════════════════════════════
// RENDER PRINCIPAL
// ═══════════════════════════════════════════════════════════
function getFilteredPlanes(search = '', cat = 'all', era = 'all', favsOnly = false) {
    const s = search.toLowerCase();
    return aircraftDB.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(s) ||
                            p.country.toLowerCase().includes(s) ||
                            p.type.toLowerCase().includes(s);
        const matchCat      = cat === 'all' || p.type === cat;
        const matchEra      = era === 'all' || getEraFromYear(p.year) === era;
        const matchFav      = !favsOnly || isFav(p.id);
        const matchTimeline = !timelineActive || (p.year >= timelineMin && p.year <= timelineMax);
        return matchSearch && matchCat && matchEra && matchFav && matchTimeline;
    });
}

function renderAll() {
    const f = getFilters();
    const filtered = getFilteredPlanes(f.search, f.cat, f.era, onlyFavs);
    updateResultCounter(filtered.length, f);
    currentView === 'gallery' ? renderGallery(filtered) : renderRanking(filtered);
}

function renderGallery(planes) {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = planes.length ? planes.map(createCard).join('') : buildEmptyState();
}

function buildEmptyState() {
    const msg = onlyFavs
        ? 'No tienes aeronaves guardadas con este filtro. Usa <i class="fas fa-star text-yellow-400"></i> en las cards.'
        : 'No hay resultados. Ajusta la búsqueda o los filtros.';
    return `
        <div class="col-span-3 flex flex-col items-center justify-center py-24 select-none">
            <div class="w-48 mb-8 space-y-2">
                <div class="hud-scan-line h-0.5 bg-blue-400/40 rounded-full" style="animation-delay:0s"></div>
                <div class="hud-scan-line h-0.5 bg-blue-400/60 rounded-full" style="animation-delay:0.3s"></div>
                <div class="hud-scan-line h-0.5 bg-blue-400/40 rounded-full" style="animation-delay:0.6s"></div>
            </div>
            <i class="fas fa-satellite-dish text-slate-200 text-7xl mb-6"></i>
            <p class="header-font text-xl text-slate-400 uppercase tracking-widest mb-2">// 0 AERONAVES ENCONTRADAS</p>
            <p class="text-slate-400 text-sm text-center max-w-xs">${msg}</p>
            <div class="w-48 mt-8 space-y-2">
                <div class="hud-scan-line h-0.5 bg-blue-400/40 rounded-full" style="animation-delay:0.9s"></div>
                <div class="hud-scan-line h-0.5 bg-blue-400/60 rounded-full" style="animation-delay:1.2s"></div>
                <div class="hud-scan-line h-0.5 bg-blue-400/40 rounded-full" style="animation-delay:1.5s"></div>
            </div>
        </div>`;
}

function updateResultCounter(count, f) {
    document.getElementById('resultCount').textContent = count;
    const labels = [];
    if (f.cat !== 'all') labels.push(f.cat.toUpperCase());
    if (f.era !== 'all') labels.push({ sgm: 'SGM', coldwar: 'GUERRA FRÍA', postgf: 'POST-GF', modern: 'MODERNO' }[f.era] || f.era);
    if (onlyFavs) labels.push('⭐ FAVORITOS');
    if (timelineActive) labels.push(`${timelineMin}–${timelineMax}`);
    if (f.search) labels.push(`"${f.search}"`);
    document.getElementById('resultFilterLabel').textContent = labels.length ? labels.join(' · ') : 'TODOS LOS MODELOS';
}

// ═══════════════════════════════════════════════════════════
// VISTA RANKING
// ═══════════════════════════════════════════════════════════
function renderRanking(planes) {
    const sorted = [...planes].sort((a, b) => sortAsc ? a[sortStat] - b[sortStat] : b[sortStat] - a[sortStat]);
    const maxVal = Math.max(...sorted.map(p => p[sortStat]));
    const STAT_UNITS  = { speed: 'km/h', range: 'km', ceiling: 'm', mtow: 'T', year: '' };
    const STAT_COLORS = { speed: '#3b82f6', range: '#8b5cf6', ceiling: '#06b6d4', mtow: '#f59e0b', year: '#10b981' };

    const rows = sorted.map((p, idx) => {
        const val   = sortStat === 'mtow' ? `${(p[sortStat] / 1000).toFixed(1)} T` : `${p[sortStat].toLocaleString()}${STAT_UNITS[sortStat] ? ' ' + STAT_UNITS[sortStat] : ''}`;
        const pct   = (p[sortStat] / maxVal) * 100;
        const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`;
        return `
            <tr class="rank-row border-t border-slate-100 cursor-pointer" onclick="openDetail('${p.id}')">
                <td class="px-4 py-3 mono text-sm font-black text-slate-400">${medal}</td>
                <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg overflow-hidden bg-slate-900 flex-shrink-0">
                            <img src="${p.img}" class="w-full h-full object-cover" onerror="this.src='${FALLBACK_IMG}'">
                        </div>
                        <div>
                            <p class="header-font text-sm font-black uppercase leading-tight">${p.name}</p>
                            <p class="mono text-[9px] text-slate-400 uppercase">${p.country} · ${p.year}</p>
                        </div>
                    </div>
                </td>
                <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                        <span class="mono text-sm font-black" style="color:${STAT_COLORS[sortStat]}">${val}</span>
                        <div class="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-16">
                            <div class="h-full rounded-full" style="width:${pct}%;background:${STAT_COLORS[sortStat]}"></div>
                        </div>
                    </div>
                </td>
                <td class="px-4 py-3 mono text-xs text-slate-500 hidden md:table-cell">${p.range.toLocaleString()} km</td>
                <td class="px-4 py-3 mono text-xs text-slate-500 hidden md:table-cell">${p.ceiling.toLocaleString()} m</td>
                <td class="px-4 py-3 mono text-xs text-slate-500 hidden lg:table-cell">${(p.mtow / 1000).toFixed(1)} T</td>
                <td class="px-4 py-3 mono text-xs text-slate-500 hidden lg:table-cell">${p.year}</td>
                <td class="px-4 py-3">
                    <span class="px-2 py-1 bg-slate-100 rounded-full text-[8px] font-black uppercase text-slate-500">${p.type}</span>
                </td>
            </tr>`;
    }).join('');

    document.getElementById('rankingBody').innerHTML = rows || `<tr><td colspan="8" class="text-center py-16 text-slate-400">Sin resultados</td></tr>`;

    document.querySelectorAll('.sort-th').forEach(th => {
        const active = th.dataset.col === sortStat;
        th.classList.toggle('sorted', active);
        th.querySelector('.sort-icon').textContent = active ? (sortAsc ? '↑' : '↓') : '↕';
    });
}

// ═══════════════════════════════════════════════════════════
// TOGGLE VISTA
// ═══════════════════════════════════════════════════════════
function setView(view) {
    currentView = view;
    const isGallery = view === 'gallery';
    document.getElementById('galleryView').classList.toggle('hidden-view', !isGallery);
    document.getElementById('rankingView').classList.toggle('active', !isGallery);
    document.getElementById('viewGalleryBtn').classList.toggle('bg-slate-900', isGallery);
    document.getElementById('viewGalleryBtn').classList.toggle('text-white', isGallery);
    document.getElementById('viewGalleryBtn').classList.toggle('bg-white', !isGallery);
    document.getElementById('viewGalleryBtn').classList.toggle('text-slate-500', !isGallery);
    document.getElementById('viewRankingBtn').classList.toggle('bg-slate-900', !isGallery);
    document.getElementById('viewRankingBtn').classList.toggle('text-white', !isGallery);
    document.getElementById('viewRankingBtn').classList.toggle('bg-white', isGallery);
    document.getElementById('viewRankingBtn').classList.toggle('text-slate-500', isGallery);
    renderAll();
}

// ═══════════════════════════════════════════════════════════
// TOGGLE FAVORITOS
// ═══════════════════════════════════════════════════════════
function toggleFavFilter() {
    onlyFavs = !onlyFavs;
    const btn = document.getElementById('favFilterBtn');
    btn.classList.toggle('bg-yellow-400', onlyFavs);
    btn.classList.toggle('border-yellow-400', onlyFavs);
    btn.classList.toggle('text-slate-900', onlyFavs);
    btn.classList.toggle('border-slate-200', !onlyFavs);
    btn.classList.toggle('text-slate-500', !onlyFavs);
    renderAll();
}

// ═══════════════════════════════════════════════════════════
// CALCULADORA MACH
// ═══════════════════════════════════════════════════════════
function toggleMachCalc() {
    document.getElementById('machCalc').classList.toggle('open');
}

function updateAltLabel() {
    const alt = parseInt(document.getElementById('altSlider').value);
    document.getElementById('altLabel').textContent = alt === 0 ? '0 m (nivel del mar)' : `${alt.toLocaleString()} m`;
}

function calcMach() {
    const rawVal = parseFloat(document.getElementById('machSpeedInput').value);
    const unit   = document.getElementById('machUnit').value;
    const alt    = parseInt(document.getElementById('altSlider').value) || 0;
    const resEl  = document.getElementById('machResult');
    const catEl  = document.getElementById('machCategory');

    if (!rawVal || rawVal <= 0) {
        resEl.textContent = '—';
        catEl.textContent = 'Introduce una velocidad';
        resEl.className = 'header-font text-4xl font-black text-white';
        return;
    }

    let kmh = rawVal;
    if (unit === 'knots') kmh = rawVal * 1.852;
    if (unit === 'mph')   kmh = rawVal * 1.60934;

    const mach = kmh / speedOfSound(alt);
    resEl.textContent = `M ${mach.toFixed(3)}`;

    let cat = '', color = '';
    if (mach < 0.8)      { cat = 'SUBSÓNICO';      color = 'text-green-400'; }
    else if (mach < 1.2) { cat = 'TRANSSÓNICO';    color = 'text-yellow-400'; }
    else if (mach < 5)   { cat = 'SUPERSÓNICO';     color = 'text-orange-400'; }
    else if (mach < 10)  { cat = 'HIPERSÓNICO';     color = 'text-red-400'; }
    else                 { cat = 'ALTA HIPERSONÍA'; color = 'text-pink-400'; }

    catEl.textContent = cat;
    catEl.className   = `text-[9px] font-black uppercase mt-2 ${color}`;
    resEl.className   = `header-font text-4xl font-black ${color}`;
}

// ═══════════════════════════════════════════════════════════
// OVERLAY: FICHA TÉCNICA
// ═══════════════════════════════════════════════════════════
function openDetail(id) {
    const plane = aircraftDB.find(p => p.id === id);
    if (!plane) return;

    currentDetailId = id;
    history.replaceState(null, '', `#${id}`);

    document.getElementById('detailContent').innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
                <h1 class="header-font text-5xl font-black italic uppercase leading-none mb-2">${plane.name}</h1>
                <div class="flex items-center gap-3 flex-wrap mb-6">
                    <p class="text-blue-400 mono text-lg uppercase tracking-widest">${plane.type} // ${plane.country}</p>
                    ${genBadgeHTML(plane)}
                </div>
                <div class="space-y-6 text-slate-300">
                    <p class="text-xl leading-relaxed">${plane.desc}</p>
                    <div class="grid grid-cols-2 gap-8 border-y border-slate-700 py-8">
                        <div><h4 class="text-blue-400 font-black uppercase text-xs mb-2">Armamento</h4><p class="text-sm mono">${plane.arm}</p></div>
                        <div><h4 class="text-blue-400 font-black uppercase text-xs mb-2">Año de Entrada</h4><p class="text-sm mono">${plane.year}</p></div>
                        <div><h4 class="text-blue-400 font-black uppercase text-xs mb-2">Velocidad Máxima</h4><p class="text-sm mono">${plane.speed} KM/H (MACH ${(plane.speed / 1234.8).toFixed(2)})</p></div>
                        <div><h4 class="text-blue-400 font-black uppercase text-xs mb-2">Radio de Acción</h4><p class="text-sm mono">${plane.range} KM</p></div>
                        <div><h4 class="text-blue-400 font-black uppercase text-xs mb-2">Techo de Servicio</h4><p class="text-sm mono">${plane.ceiling.toLocaleString()} M</p></div>
                        <div><h4 class="text-blue-400 font-black uppercase text-xs mb-2">MTOW</h4><p class="text-sm mono">${(plane.mtow / 1000).toFixed(1)} T</p></div>
                    </div>
                    <div class="bg-slate-800 p-6 rounded-2xl border-l-4 border-blue-500">
                        <h4 class="font-black uppercase text-sm mb-2 italic">Dato de Inteligencia:</h4>
                        <p class="text-slate-400 italic">${plane.trivia}</p>
                    </div>
                </div>
            </div>
            <div class="relative group">
                <div class="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <img src="${plane.img}" onerror="this.src='${FALLBACK_IMG}'"
                     class="relative rounded-3xl shadow-2xl w-full h-[500px] object-cover" alt="${plane.name}">
                <div class="absolute bottom-6 right-6 flex gap-4">
                    <div class="p-4 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10">
                        <p class="text-[10px] text-slate-400 uppercase font-black mb-1">Techo</p>
                        <p class="header-font text-xl">${plane.ceiling.toLocaleString()}m</p>
                    </div>
                    <div class="p-4 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10">
                        <p class="text-[10px] text-slate-400 uppercase font-black mb-1">Masa Máx</p>
                        <p class="header-font text-xl">${(plane.mtow / 1000).toFixed(0)}T</p>
                    </div>
                </div>
            </div>
        </div>`;

    const overlay = document.getElementById('detailOverlay');
    overlay.classList.remove('hidden');
    setTimeout(() => overlay.classList.add('active'), 10);
    document.body.style.overflow = 'hidden';
}

function closeDetail() {
    currentDetailId = null;
    history.replaceState(null, '', window.location.pathname + window.location.search);
    const overlay = document.getElementById('detailOverlay');
    overlay.classList.remove('active');
    setTimeout(() => { overlay.classList.add('hidden'); document.body.style.overflow = 'auto'; }, 500);
}

// ═══════════════════════════════════════════════════════════
// COMPARADOR
// ═══════════════════════════════════════════════════════════
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
    btn.className = `px-3 py-3 rounded-xl border-2 transition-all text-[10px] font-black ${sel ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 text-slate-400 hover:border-blue-600 hover:text-blue-600'}`;
    btn.innerHTML = `<i class="fas ${sel ? 'fa-check' : 'fa-plus'}"></i>`;
}

function updateCompareBar() {
    const bar   = document.getElementById('compareBar');
    const slots = document.getElementById('compareSlots');
    const btn   = document.getElementById('compareBtn');
    const hint  = document.getElementById('compareHint');

    if (compareList.length === 0) { bar.classList.remove('visible'); return; }
    bar.classList.add('visible');
    btn.disabled = compareList.length < 2;

    slots.innerHTML = compareList.map(id => {
        const p = aircraftDB.find(x => x.id === id);
        return `<div class="flex items-center gap-1 bg-slate-700 rounded-full px-3 py-1">
            <span class="text-[9px] font-black text-white uppercase">${p.name}</span>
            <button onclick="toggleCompare('${id}')" class="ml-1 text-slate-400 hover:text-white text-[10px]"><i class="fas fa-times"></i></button>
        </div>`;
    }).join('');

    const rem = MAX_COMPARE - compareList.length;
    hint.textContent = compareList.length < 2 ? `Selecciona ${2 - compareList.length} más`
        : rem > 0 ? `Listo (puedes añadir ${rem} más)` : 'Máximo alcanzado';
}

function clearCompare() {
    const prev = [...compareList];
    compareList = [];
    updateCompareBar();
    prev.forEach(id => refreshCardCompareState(id));
}

// Instancia activa del gráfico para poder destruirla antes de redibujar
let radarChartInstance = null;

function openCompare() {
    if (compareList.length < 2) return;
    const planes  = compareList.map(id => aircraftDB.find(p => p.id === id));
    const COLORS  = ['#3b82f6', '#f59e0b', '#10b981'];
    const statKeys = Object.keys(STAT_META);
    const maxVals  = {};
    statKeys.forEach(k => { maxVals[k] = Math.max(...planes.map(p => p[k])); });

    // ── Cabecera con imágenes ──────────────────────────
    const headerCols = planes.map((p, i) => `
        <div class="text-center">
            <div class="w-full h-36 rounded-2xl overflow-hidden mb-3 border-2" style="border-color:${COLORS[i]}">
                <img src="${p.img}" class="w-full h-full object-cover" onerror="this.src='${FALLBACK_IMG}'">
            </div>
            <p class="header-font text-lg font-black uppercase leading-tight" style="color:${COLORS[i]}">${p.name}</p>
            <p class="mono text-[9px] text-slate-400 uppercase">${p.country} · ${p.year}</p>
            <div class="flex justify-center gap-2 mt-1 flex-wrap">
                <span class="inline-block px-2 py-0.5 rounded-full text-[8px] font-black uppercase text-white" style="background:${COLORS[i]}">${p.type}</span>
                ${genBadgeHTML(p)}
            </div>
        </div>`).join('');

    // ── Filas de stats ─────────────────────────────────
    const statRows = statKeys.map(k => {
        const meta    = STAT_META[k];
        const barCols = planes.map((p, i) => {
            const pct      = (p[k] / meta.max) * 100;
            const isWinner = p[k] === maxVals[k] && planes.filter(x => x[k] === maxVals[k]).length === 1;
            const val      = k === 'mtow' ? `${(p[k] / 1000).toFixed(1)} T` : `${p[k].toLocaleString()} ${meta.unit}`;
            return `<td class="px-4 py-4">
                <div class="flex items-center justify-between mb-1">
                    <span class="mono text-sm font-black text-white">${val}</span>
                    ${isWinner ? '<span class="text-[8px] font-black text-yellow-400">▲ LÍDER</span>' : ''}
                </div>
                <div class="compare-bar-stat">
                    <div class="compare-bar-fill" style="width:${pct}%;background:${COLORS[i]}"></div>
                </div>
            </td>`;
        }).join('');
        return `<tr class="border-t border-slate-800">
            <td class="px-4 py-4"><p class="text-[9px] font-black uppercase text-slate-400">${meta.label}</p></td>
            ${barCols}
        </tr>`;
    }).join('');

    document.getElementById('compareContent').innerHTML = `
        <!-- Cabecera -->
        <div class="grid gap-6 mb-6" style="grid-template-columns:180px repeat(${planes.length},1fr)">
            <div></div>${headerCols}
        </div>

        <!-- Tabs de vista: Tabla / Radar -->
        <div class="flex gap-2 mb-6">
            <button class="compare-tab active" id="tabTable" onclick="switchCompareTab('table')">
                <i class="fas fa-table mr-1"></i> Tabla de stats
            </button>
            <button class="compare-tab" id="tabRadar" onclick="switchCompareTab('radar')">
                <i class="fas fa-spider mr-1"></i> Gráfico radar
            </button>
        </div>

        <!-- Panel: Tabla -->
        <div id="compareTablePanel" class="overflow-x-auto">
            <table class="w-full border-collapse">
                <thead>
                    <tr>
                        <th class="px-4 py-3 text-left text-[9px] font-black uppercase text-slate-500 w-44">Parámetro</th>
                        ${planes.map((p, i) => `<th class="px-4 py-3 text-left text-[9px] font-black uppercase" style="color:${COLORS[i]}">${p.name}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${statRows}
                    <tr class="border-t border-slate-700 bg-slate-900/50">
                        <td class="px-4 py-4"><p class="text-[9px] font-black uppercase text-slate-400">Armamento</p></td>
                        ${planes.map(p => `<td class="px-4 py-4 mono text-xs text-slate-300">${p.arm}</td>`).join('')}
                    </tr>
                    <tr class="border-t border-slate-700">
                        <td class="px-4 py-4"><p class="text-[9px] font-black uppercase text-slate-400">Dato Clave</p></td>
                        ${planes.map(p => `<td class="px-4 py-4 text-xs text-slate-400 italic">"${p.trivia}"</td>`).join('')}
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Panel: Radar (oculto por defecto) -->
        <div id="compareRadarPanel" class="hidden">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <!-- Canvas del radar -->
                <div class="radar-wrapper bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                    <p class="header-font text-xs text-slate-400 uppercase tracking-widest mb-4 text-center">
                        Perfil de capacidades comparado
                    </p>
                    <canvas id="radarCanvas"></canvas>
                </div>
                <!-- Leyenda y análisis -->
                <div class="space-y-4">
                    <p class="header-font text-xs font-black uppercase text-slate-400 tracking-widest mb-2">
                        // Análisis de dominio
                    </p>
                    ${planes.map((p, i) => {
                        // Calcular qué stat lidera este avión
                        const dominated = statKeys.filter(k => p[k] === maxVals[k] && planes.filter(x => x[k] === maxVals[k]).length === 1);
                        const dominated_labels = dominated.map(k => STAT_META[k].label);
                        return `
                        <div class="bg-slate-800 rounded-xl p-4 border-l-4" style="border-color:${COLORS[i]}">
                            <p class="header-font text-sm font-black uppercase mb-1" style="color:${COLORS[i]}">${p.name}</p>
                            <p class="text-xs text-slate-400 mono">${p.country} · ${p.year}</p>
                            ${dominated.length > 0
                                ? `<p class="text-[9px] text-yellow-400 font-black uppercase mt-2">▲ Líder en: ${dominated_labels.join(', ')}</p>`
                                : `<p class="text-[9px] text-slate-500 uppercase mt-2">Sin liderazgo absoluto</p>`
                            }
                        </div>`;
                    }).join('')}
                    <p class="text-[9px] text-slate-600 italic mt-2">
                        * Los valores del radar están normalizados al máximo global de cada categoría para permitir la comparación visual.
                    </p>
                </div>
            </div>
        </div>
    `;

    const overlay = document.getElementById('compareOverlay');
    overlay.classList.remove('hidden');
    requestAnimationFrame(() => overlay.classList.add('active'));
    document.body.style.overflow = 'hidden';

    // Guardar los datos para dibujar el radar cuando se active el tab
    overlay._planes = planes;
    overlay._colors = COLORS;
}

/**
 * Alterna entre el panel de tabla y el panel de radar.
 * Dibuja el chart solo cuando se activa el tab de radar.
 */
function switchCompareTab(tab) {
    const tablePanel = document.getElementById('compareTablePanel');
    const radarPanel = document.getElementById('compareRadarPanel');
    const tabTable   = document.getElementById('tabTable');
    const tabRadar   = document.getElementById('tabRadar');

    if (tab === 'table') {
        tablePanel.classList.remove('hidden');
        radarPanel.classList.add('hidden');
        tabTable.classList.add('active');
        tabRadar.classList.remove('active');
    } else {
        tablePanel.classList.add('hidden');
        radarPanel.classList.remove('hidden');
        tabTable.classList.remove('active');
        tabRadar.classList.add('active');
        // Dibujar el radar (destruir el anterior si existe)
        drawRadarChart();
    }
}

/**
 * Construye y renderiza el gráfico de radar con Chart.js.
 * Normaliza cada eje al máximo global de la DB para ser coherente.
 */
function drawRadarChart() {
    const overlay = document.getElementById('compareOverlay');
    const planes  = overlay._planes;
    const COLORS  = overlay._colors;

    // Ejes del radar: speed, range, ceiling, mtow + stealth si aplica
    const RADAR_AXES = [
        { key: 'speed',   label: 'Velocidad', max: 8000 },
        { key: 'range',   label: 'Alcance',   max: 15000 },
        { key: 'ceiling', label: 'Techo',     max: 30000 },
        { key: 'mtow',    label: 'Masa',      max: 420000 },
    ];

    // Normalizar valores a escala 0-100
    const datasets = planes.map((p, i) => {
        const data = RADAR_AXES.map(ax => Math.round((p[ax.key] / ax.max) * 100));
        const hex  = COLORS[i];
        return {
            label: p.name,
            data,
            backgroundColor: hex + '26',      // 15% opacidad
            borderColor:     hex,
            pointBackgroundColor: hex,
            pointBorderColor: '#0f172a',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: hex,
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
        };
    });

    // Destruir instancia previa si existe
    if (radarChartInstance) {
        radarChartInstance.destroy();
        radarChartInstance = null;
    }

    const ctx = document.getElementById('radarCanvas').getContext('2d');
    radarChartInstance = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: RADAR_AXES.map(ax => ax.label),
            datasets,
        },
        options: {
            responsive: true,
            animation: { duration: 700, easing: 'easeInOutQuart' },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#94a3b8',
                        font: { family: 'JetBrains Mono', size: 11, weight: 'bold' },
                        padding: 16,
                        boxWidth: 12,
                    }
                },
                tooltip: {
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderWidth: 1,
                    titleColor: '#fff',
                    bodyColor: '#94a3b8',
                    callbacks: {
                        label: ctx => {
                            const ax   = RADAR_AXES[ctx.dataIndex];
                            const raw  = planes[ctx.datasetIndex][ax.key];
                            const unit = ax.key === 'mtow' ? `${(raw/1000).toFixed(1)} T` : `${raw.toLocaleString()} ${ax.key === 'speed' ? 'km/h' : ax.key === 'range' ? 'km' : ax.key === 'ceiling' ? 'm' : ''}`;
                            return ` ${ctx.dataset.label}: ${unit}`;
                        }
                    }
                }
            },
            scales: {
                r: {
                    min: 0,
                    max: 100,
                    ticks: {
                        display: false,
                        stepSize: 20,
                    },
                    grid:        { color: 'rgba(51,65,85,0.7)' },
                    angleLines:  { color: 'rgba(51,65,85,0.7)' },
                    pointLabels: {
                        color: '#94a3b8',
                        font: { family: 'Orbitron', size: 10, weight: '700' },
                    }
                }
            }
        }
    });
}

function closeCompare() {
    // Destruir instancia del gráfico si existe para evitar memory leaks
    if (radarChartInstance) {
        radarChartInstance.destroy();
        radarChartInstance = null;
    }
    const overlay = document.getElementById('compareOverlay');
    overlay.classList.remove('active');
    setTimeout(() => { overlay.classList.add('hidden'); document.body.style.overflow = 'auto'; }, 400);
}

// ═══════════════════════════════════════════════════════════
// SKELETON LOADING
// ═══════════════════════════════════════════════════════════
function showSkeletons(count = 6) {
    document.getElementById('gallery').innerHTML = Array.from({ length: count }).map(() => `
        <div class="skeleton-card flex flex-col h-full">
            <div class="skeleton" style="height:200px;border-radius:0"></div>
            <div class="p-6 flex flex-col gap-4 flex-grow">
                <div class="skeleton h-6 w-3/4"></div>
                <div class="skeleton h-3 w-1/3"></div>
                <div class="grid grid-cols-2 gap-3 mt-2">
                    <div class="skeleton h-10"></div><div class="skeleton h-10"></div>
                </div>
                <div class="space-y-3 mt-2">
                    <div class="skeleton h-2 w-full"></div><div class="skeleton h-2 w-full"></div>
                </div>
                <div class="skeleton h-10 mt-auto rounded-xl"></div>
            </div>
        </div>`).join('');
}

// ═══════════════════════════════════════════════════════════
// HASH ROUTING
// ═══════════════════════════════════════════════════════════
function shareCurrentDetail() {
    if (!currentDetailId) return;
    const url = `${window.location.origin}${window.location.pathname}#${currentDetailId}`;
    navigator.clipboard.writeText(url).then(showToast).catch(() => prompt('Copia este enlace:', url));
}

function showToast() {
    const toast = document.getElementById('shareToast');
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 2500);
}

function resolveHash() {
    const hash = window.location.hash.replace('#', '').trim();
    if (hash && aircraftDB.find(p => p.id === hash)) {
        setTimeout(() => openDetail(hash), 400);
    }
}

// ═══════════════════════════════════════════════════════════
// PANEL DE ATAJOS
// ═══════════════════════════════════════════════════════════
function toggleShortcutPanel() {
    const panel = document.getElementById('shortcutPanel');
    const hidden = panel.classList.contains('hidden');
    if (hidden) {
        panel.classList.remove('hidden');
        requestAnimationFrame(() => panel.classList.add('visible'));
    } else {
        panel.classList.remove('visible');
        setTimeout(() => panel.classList.add('hidden'), 250);
    }
}

// ═══════════════════════════════════════════════════════════
// DARK / LIGHT MODE
// ═══════════════════════════════════════════════════════════
const THEME_KEY = 'aeropedia_theme';

function applyTheme(theme) {
    document.body.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.remove('dark-preload');
    localStorage.setItem(THEME_KEY, theme);
}

function toggleTheme() {
    const isDark = document.body.classList.contains('dark');
    applyTheme(isDark ? 'light' : 'dark');
    // Si el radar está abierto, hay que redibujarlo con los colores actualizados
    if (radarChartInstance) drawRadarChart();
}

function initTheme() {
    const saved = localStorage.getItem(THEME_KEY) || 'light';
    applyTheme(saved);
}

// ═══════════════════════════════════════════════════════════
// LÍNEA DE TIEMPO INTERACTIVA
// ═══════════════════════════════════════════════════════════

/** Construye los ticks de décadas en el DOM */
function buildDecadeMarks() {
    const container = document.getElementById('decadeMarks');
    if (!container) return;
    container.innerHTML = '';
    for (let y = TIMELINE_MIN_YEAR; y <= TIMELINE_MAX_YEAR; y += TIMELINE_STEP) {
        const mark = document.createElement('div');
        mark.className = 'decade-mark';
        mark.dataset.year = y;
        mark.innerHTML = `
            <div class="decade-dot"></div>
            <span class="decade-label">'${String(y).slice(2)}</span>`;
        mark.addEventListener('click', () => jumpToDecade(y));
        container.appendChild(mark);
    }
    updateDecadeMarks();
}

/** Resalta las marcas de década dentro del rango activo */
function updateDecadeMarks() {
    document.querySelectorAll('.decade-mark').forEach(m => {
        const y = parseInt(m.dataset.year);
        m.classList.toggle('active', y >= timelineMin && y <= timelineMax);
    });
}

/** Click en una marca: si está en rango, lo reduce a ese punto; si no, lo expande */
function jumpToDecade(year) {
    const minEl = document.getElementById('timelineMin');
    const maxEl = document.getElementById('timelineMax');
    if (!minEl || !maxEl) return;

    if (year >= timelineMin && year <= timelineMax && timelineMin !== timelineMax) {
        // Reducir al punto exacto
        timelineMin = year;
        timelineMax = year;
    } else {
        // Expandir al incluir esa década
        timelineMin = Math.min(timelineMin, year);
        timelineMax = Math.max(timelineMax, year);
    }

    minEl.value = timelineMin;
    maxEl.value = timelineMax;
    syncTimeline();
}

/** Sincroniza estado interno, UI visual y filtro */
function syncTimeline() {
    const minEl = document.getElementById('timelineMin');
    const maxEl = document.getElementById('timelineMax');
    if (!minEl || !maxEl) return;

    let minVal = parseInt(minEl.value);
    let maxVal = parseInt(maxEl.value);

    // Evitar cruce
    if (minVal > maxVal) { minVal = maxVal; minEl.value = minVal; }

    timelineMin = minVal;
    timelineMax = maxVal;
    timelineActive = !(timelineMin === TIMELINE_MIN_YEAR && timelineMax === TIMELINE_MAX_YEAR);

    // Actualizar etiqueta
    const label = document.getElementById('timelineRangeLabel');
    if (label) {
        label.textContent = timelineActive
            ? `${timelineMin} – ${timelineMax}`
            : 'TODAS LAS ÉPOCAS';
    }

    // Actualizar fill visual del track entre los dos thumbs
    const total = TIMELINE_MAX_YEAR - TIMELINE_MIN_YEAR;
    const leftPct  = ((timelineMin - TIMELINE_MIN_YEAR) / total) * 100;
    const rightPct = ((timelineMax - TIMELINE_MIN_YEAR) / total) * 100;
    const fill = document.getElementById('timelineTrackFill');
    const tMin = document.getElementById('thumbMin');
    const tMax = document.getElementById('thumbMax');
    if (fill) {
        fill.style.left  = `${leftPct}%`;
        fill.style.width = `${rightPct - leftPct}%`;
    }
    if (tMin) tMin.style.left = `${leftPct}%`;
    if (tMax) tMax.style.left = `${rightPct}%`;

    updateDecadeMarks();

    // Actualizar botón de timeline en el header
    const btn = document.getElementById('timelineBtn');
    if (btn) {
        btn.classList.toggle('border-blue-500', timelineActive);
        btn.classList.toggle('text-blue-500', timelineActive);
        btn.classList.toggle('border-slate-200', !timelineActive);
        btn.classList.toggle('text-slate-500', !timelineActive);
    }

    renderAll();
}

function onTimelineChange() { syncTimeline(); }

function toggleTimeline() {
    const section = document.getElementById('timelineSection');
    const isOpen  = section.classList.contains('open');
    section.classList.toggle('open', !isOpen);
    if (!isOpen) buildDecadeMarks(); // construir marcas la primera vez
}

function resetTimeline() {
    const minEl = document.getElementById('timelineMin');
    const maxEl = document.getElementById('timelineMax');
    if (minEl) minEl.value = TIMELINE_MIN_YEAR;
    if (maxEl) maxEl.value = TIMELINE_MAX_YEAR;
    syncTimeline();
}

// ═══════════════════════════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════════════════════════
document.getElementById('mainSearch').addEventListener('input', renderAll);
document.getElementById('catFilter').addEventListener('change', renderAll);

document.getElementById('eraFilters').addEventListener('click', e => {
    const btn = e.target.closest('.era-pill');
    if (!btn) return;
    document.querySelectorAll('.era-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeEra = btn.dataset.era;
    renderAll();
});

document.querySelectorAll('.rank-stat-pill').forEach(btn => {
    btn.addEventListener('click', () => {
        sortStat = btn.dataset.stat === sortStat ? sortStat : btn.dataset.stat;
        sortAsc  = btn.dataset.stat === sortStat ? !sortAsc : false;
        sortStat = btn.dataset.stat;
        document.querySelectorAll('.rank-stat-pill').forEach(b => {
            b.classList.toggle('bg-slate-900',   b.dataset.stat === sortStat);
            b.classList.toggle('text-white',      b.dataset.stat === sortStat);
            b.classList.toggle('bg-slate-200',    b.dataset.stat !== sortStat);
            b.classList.toggle('text-slate-600',  b.dataset.stat !== sortStat);
        });
        renderAll();
    });
});

document.querySelectorAll('.sort-th').forEach(th => {
    th.addEventListener('click', () => {
        sortAsc  = th.dataset.col === sortStat ? !sortAsc : false;
        sortStat = th.dataset.col;
        renderAll();
    });
});

document.addEventListener('click', e => {
    const panel = document.getElementById('shortcutPanel');
    const btn   = document.getElementById('shortcutBtn');
    if (!panel.classList.contains('hidden') && !panel.contains(e.target) && !btn.contains(e.target)) {
        panel.classList.remove('visible');
        setTimeout(() => panel.classList.add('hidden'), 250);
    }
});

document.addEventListener('keydown', e => {
    const tag         = document.activeElement.tagName.toLowerCase();
    const typing      = ['input', 'select', 'textarea'].includes(tag);
    const detailOpen  = !document.getElementById('detailOverlay').classList.contains('hidden');
    const compareOpen = !document.getElementById('compareOverlay').classList.contains('hidden');

    if (e.key === 'Escape') {
        if (detailOpen)  { closeDetail();  return; }
        if (compareOpen) { closeCompare(); return; }
        const calc = document.getElementById('machCalc');
        if (calc.classList.contains('open')) { calc.classList.remove('open'); return; }
    }
    if (typing || detailOpen || compareOpen) return;

    const shortcuts = { '/': () => { e.preventDefault(); document.getElementById('mainSearch').focus(); },
        g: () => setView('gallery'), r: () => setView('ranking'),
        f: toggleFavFilter, m: toggleMachCalc,
        t: toggleTimeline,
        d: toggleTheme,
        s: () => { if (currentDetailId) shareCurrentDetail(); }
    };
    shortcuts[e.key.toLowerCase()]?.();
});

// ═══════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════
window.onload = () => {
    initTheme();
    showSkeletons(6);
    setTimeout(() => {
        renderAll();
        resolveHash();
        syncTimeline(); // inicializar fill visual del timeline
    }, 600);
};
