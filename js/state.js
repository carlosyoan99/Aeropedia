/**
 * state.js — Estado global y constantes de AeroPedia
 * Debe cargarse antes que cualquier otro módulo JS.
 */

// ── Bases de datos (se rellenan al cargar los JSON) ───────────
let aircraftDB  = [];
let conflictsDB = {};

// ── Estado de filtros ─────────────────────────────────────────
let activeConflict = 'all';
let onlyFavs       = false;
let currentView    = 'gallery';   // 'gallery' | 'ranking'

// ── Estado de la línea de tiempo ──────────────────────────────
const TIMELINE_MIN_YEAR = 1940;
const TIMELINE_MAX_YEAR = 2024;
const TIMELINE_STEP     = 10;
let timelineMin    = TIMELINE_MIN_YEAR;
let timelineMax    = TIMELINE_MAX_YEAR;
let timelineActive = false;

// ── Estado del comparador ─────────────────────────────────────
let compareList     = [];
const MAX_COMPARE   = 3;
let radarChartInst  = null;

// ── Estado de la ficha técnica activa ─────────────────────────
let currentDetailId = null;

// ── Estado del ranking ───────────────────────────────────────
let sortStat = 'speed';
let sortAsc  = false;

// ── Configuración de estadísticas ────────────────────────────
const STAT_META = {
  speed:   { label: 'Velocidad Máx',      unit: 'km/h', max: 8000,   color: '#3b82f6' },
  range:   { label: 'Rango Operativo',    unit: 'km',   max: 15000,  color: '#8b5cf6' },
  ceiling: { label: 'Techo de Servicio',  unit: 'm',    max: 30000,  color: '#06b6d4' },
  mtow:    { label: 'Peso Máx. Despegue', unit: 'kg',   max: 420000, color: '#f59e0b' },
};

// ── Fallback de imagen ────────────────────────────────────────
const FALLBACK_IMG = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/1200px-No-Image-Placeholder.svg.png';

// ── Claves de localStorage ─────────────────────────────────────
const FAV_KEY   = 'aeropedia_favs';
const THEME_KEY = 'aeropedia_theme';
const PWA_DISMISSED_KEY = 'aeropedia_pwa_dismissed';
