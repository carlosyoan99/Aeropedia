/**
 * theater.js — Teatro de Operaciones
 * El panel del index fue eliminado; teatro ahora es theater.html.
 * Esta función se mantiene solo para:
 *  - selectConflictAndClose() → desde la ficha técnica
 *  - filterByConflict() → filtro por URL hash al volver al index
 *  - Compatibilidad con filters.js (activeConflict)
 */

/** Desde la ficha técnica: cierra el detalle y va a theater.html con el conflicto seleccionado */
function selectConflictAndClose(conflictId) {
  closeDetail();
  setTimeout(() => {
    location.href = 'theater.html#' + conflictId;
  }, 300);
}

/** Activar filtro de conflicto directamente (usado cuando index recibe ?conflict=xxx en URL) */
function filterByConflict(id) {
  activeConflict = id;
  renderAll();
}

function resetConflictFilter() {
  activeConflict = 'all';
  renderAll();
}

/** Leer parámetro conflict de la URL al cargar index */
function resolveConflictFromURL() {
  const params = new URLSearchParams(location.search);
  const conflict = params.get('conflict');
  if (conflict && conflictsDB[conflict]) {
    activeConflict = conflict;
  }
}