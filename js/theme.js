/**
 * theme.js — Dark / Light mode
 */

function applyTheme(theme) {
  document.body.classList.toggle('dark', theme === 'dark');
  document.documentElement.classList.remove('dark-preload');
  localStorage.setItem(THEME_KEY, theme);

  const meta = document.getElementById('themeColorMeta');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#0a0f1e' : '#ffffff');

  // Redibujar radar solo si la función existe (compare.js puede no estar cargado)
  if (typeof radarChartInst !== 'undefined' && radarChartInst &&
      typeof drawRadarChart === 'function') {
    drawRadarChart();
  }
  // Redibujar radar de compare.html si está activo
  if (typeof radarInst !== 'undefined' && radarInst &&
      typeof buildRadarPanel === 'function') {
    buildRadarPanel();
  }
}

function toggleTheme() {
  applyTheme(document.body.classList.contains('dark') ? 'light' : 'dark');
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || 'light';
  applyTheme(saved);
}