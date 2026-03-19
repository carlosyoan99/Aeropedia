/**
 * shortcuts.js — Atajos de teclado globales
 */

function toggleShortcutPanel() {
  const panel = document.getElementById('shortcutPanel');
  if (!panel) return;
  const hidden = panel.classList.contains('hidden');
  if (hidden) {
    panel.classList.remove('hidden');
    requestAnimationFrame(() => panel.classList.add('visible'));
  } else {
    panel.classList.remove('visible');
    setTimeout(() => panel.classList.add('hidden'), 250);
  }
}

// Cerrar el panel al hacer clic fuera de él
document.addEventListener('click', e => {
  const panel = document.getElementById('shortcutPanel');
  const btn   = document.getElementById('shortcutBtn');
  if (panel && !panel.classList.contains('hidden')
      && !panel.contains(e.target) && !btn?.contains(e.target)) {
    panel.classList.remove('visible');
    setTimeout(() => panel.classList.add('hidden'), 250);
  }
});

document.addEventListener('keydown', e => {
  const tag         = document.activeElement?.tagName.toLowerCase();
  const typing      = ['input', 'select', 'textarea'].includes(tag);
  const detailOpen  = !document.getElementById('detailOverlay')?.classList.contains('hidden');
  const compareOpen = !document.getElementById('compareOverlay')?.classList.contains('hidden');

  // ESC — cierra overlays en cascada
  if (e.key === 'Escape') {
    if (detailOpen)  { closeDetail();  return; }
    if (compareOpen) { closeCompare(); return; }
    const calc = document.getElementById('machCalc');
    if (calc?.classList.contains('open')) { calc.classList.remove('open'); return; }
    return;
  }

  if (typing || detailOpen || compareOpen) return;

  const map = {
    '/': () => { e.preventDefault(); document.getElementById('mainSearch')?.focus(); },
    'g': () => setView('gallery'),
    'r': () => setView('ranking'),
    'f': toggleFavFilter,
    'm': toggleMachCalc,
    't': toggleTimeline,
    'w': toggleTheater,
    'd': toggleTheme,
    'i': () => { if (typeof triggerInstall === 'function' && deferredInstallPrompt) triggerInstall(); },
    's': () => { if (currentDetailId) shareCurrentDetail(); },
  };

  map[e.key.toLowerCase()]?.();
});
