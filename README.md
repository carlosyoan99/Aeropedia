# AeroPedia

AeroPedia es una aplicación web para la exploración y consulta de aeronaves militares y civiles. Está diseñada bajo principios de simplicidad, rendimiento y control total, evitando dependencias innecesarias.

---

## Características actuales

### Exploración de aeronaves
- Listado dinámico de aeronaves
- Visualización de información técnica
- Imágenes representativas

### Búsqueda en tiempo real
- Filtrado instantáneo por nombre
- Sin recarga de página

### Sistema de filtros
- Filtrado por:
  - País
  - Tipo
  - Año
  - Conflictos 

### Favoritos
- Persistencia mediante `localStorage`
- Acceso rápido a aeronaves guardadas

### Comparador de aeronaves
- Selección múltiple
- Comparación de características clave

### Interfaz de usuario
- Diseño moderno tipo HUD / glassmorphism
- Enfoque en legibilidad y experiencia

### Progressive Web App (PWA)
- Soporte offline básico
- Instalable en dispositivos
- `manifest.json` y `service worker`

---

## Arquitectura actual

- HTML + CSS + JavaScript (Vanilla)
- Manipulación directa del DOM
- Estado manejado de forma global
- Datos locales (JSON)

---

## Futuras características

| Característica | Estado | Descripción |
|---------------|--------|------------|
| Migración a JSON externo | Completado | Separación de datos y lógica |
| Capa de servicios (API mock) | Parcial | Abstracción del acceso a datos |
| Integración con Wikipedia | Casi total | Información extendida en fichas técnicas |
| Modularización (arquitectura por capas) | Completado | Separación en `services`, `ui`, `state`, `features` |
| Cache de datos | Planificado | Reducción de llamadas repetidas |
| Optimización de búsqueda (debounce) | Planificado | Mejora de rendimiento |
| Renderizado parcial | Planificado | Evitar re-render innecesario |
| Backend real | Exploración | API propia o integración externa |

---

## Objetivo del proyecto

Evolucionar de un catálogo estático a una aplicación informativa completa, manteniendo:

- Simplicidad estructural  
- Alto rendimiento  
- Escalabilidad progresiva  

---

## Instalación y uso

1. Clonar el repositorio:

```bash
git clone https://github.com/carlosyoan99/Aeropedia.git
