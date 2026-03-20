/**
 * main.js — Bootstrap de AeroPedia
 * Carga los JSON de datos y luego inicializa todos los módulos.
 */

async function loadData() {
  const [aircraftRes, conflictsRes] = await Promise.all([
    fetch('./data/aircraft.json'),
    fetch('./data/conflicts.json'),
  ]);

  if (!aircraftRes.ok || !conflictsRes.ok) {
    throw new Error('Error al cargar los datos. Comprueba que los archivos JSON existen.');
  }

  aircraftDB  = await aircraftRes.json();
  conflictsDB = await conflictsRes.json();
}

async function init() {
  // 1. Aplicar tema guardado inmediatamente (antes de cualquier render)
  initTheme();

  // 2. Mostrar skeletons mientras cargamos datos
  showSkeletons(6);

  try {
    await loadData();
  } catch (err) {
    console.error('[AeroPedia] Error de carga:', err);
    const gallery = document.getElementById('gallery');
    if (gallery) {
      gallery.innerHTML = `
        <div class="load-error">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Error al cargar la base de datos.</p>
          <p class="load-error-detail">${err.message}</p>
          <p class="load-error-note">
            Asegúrate de servir el proyecto desde un servidor local
            (e.g. <code>npx serve .</code>) y no abrirlo como archivo file://.
          </p>
        </div>`;
    }
    return;
  }

  // 3. Renderizar la galería
  renderAll();

  // 4. Resolver hash de la URL (abrir detalle directo si hay #id)
  resolveHash();

  // 5. Inicializar estado visual del timeline sin abrir el panel
  syncTimeline();

  // 6. PWA
  registerServiceWorker();
  initInstallBanner();

  // 7. Leer parámetros de URL para shortcuts del manifest
  const params = new URLSearchParams(location.search);
  const catParam  = params.get('cat');
  const viewParam = params.get('view');
  if (catParam) {
    const sel = document.getElementById('catFilter');
    if (sel) { sel.value = catParam; renderAll(); }
  }
  if (viewParam === 'ranking') setView('ranking');

  // 8. Filtro de conflicto desde URL (viene de theater.html)
  resolveConflictFromURL();
  if (activeConflict !== 'all') renderAll();

  // 9. Navegación con botón Atrás del navegador
  window.addEventListener('popstate', () => {
    const overlay = document.getElementById('detailOverlay');
    if (overlay && !overlay.classList.contains('hidden')) {
      overlay.classList.remove('active');
      setTimeout(() => { overlay.classList.add('hidden'); document.body.style.overflow = ''; }, 500);
      currentDetailId = null;
    }
  });
}

// Arrancar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);