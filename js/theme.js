/**
 * theme.js — Dark / Light mode
 */

function applyTheme(theme) {
  document.body.classList.toggle('dark', theme === 'dark');
  document.documentElement.classList.remove('dark-preload');
  localStorage.setItem(THEME_KEY, theme);

  // Actualizar theme-color del meta tag
  const meta = document.getElementById('themeColorMeta');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#0a0f1e' : '#ffffff');

  // Si el radar está abierto, redibujarlo con nuevos colores de fondo
  if (radarChartInst) drawRadarChart();
}

function toggleTheme() {
  applyTheme(document.body.classList.contains('dark') ? 'light' : 'dark');
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || 'light';
  applyTheme(saved);
}
