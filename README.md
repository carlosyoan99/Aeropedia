# ✈️ AeroPedia — Archivo Global de Aviación Militar

Enciclopedia interactiva de aviación militar con estética **Military HUD / Glassmorphism**, construida en HTML, CSS y JavaScript vanilla. Sin frameworks, sin dependencias de build.

## 🚀 Demo

Abre `index.html` directamente en el navegador — no requiere servidor.

Para compartir fichas por URL (`#f22`, `#sr71`...) necesitas servirlo desde un servidor local o GitHub Pages (el clipboard API requiere `https://` o `localhost`).

## 📁 Estructura del proyecto

```
aeropedia/
├── index.html          # Estructura HTML completa
├── styles.css          # Todos los estilos (sin librerías CSS)
├── app.js              # Lógica JavaScript principal
├── data/
│   └── aircraft.js     # Base de datos de aeronaves (aircraftDB[])
└── README.md
```

## ✨ Características

| Funcionalidad | Descripción |
|---|---|
| 🔍 Búsqueda en tiempo real | Por nombre, país o tipo |
| 🗂️ Filtro por categoría | Caza, Bombardero, Ataque, Especial, Transporte, Experimental |
| 🕰️ Filtro por época | SGM, Guerra Fría, Post-GF, Moderno |
| ⚖️ Comparador | Selecciona 2-3 aeronaves y compara stats con barras visuales |
| 📊 Vista ranking | Tabla ordenable por cualquier stat con medallas |
| ⭐ Favoritos | Guardado persistente con `localStorage` |
| 🔢 Calculadora Mach | Convierte km/h, knots o mph con modelo ISA por altitud |
| 🔗 Compartir por URL | Abre una ficha directamente con `#id` en la URL |
| ⌨️ Atajos de teclado | `/` buscar, `G` galería, `R` ranking, `F` favoritos, `M` mach, `S` compartir, `ESC` cerrar |
| 💀 Skeleton loading | Tarjetas fantasma animadas mientras carga |

## ➕ Añadir un avión

Edita `data/aircraft.js` y añade una entrada al array `aircraftDB` siguiendo el esquema:

```js
{
    id: "id_unico",          // snake_case, sin espacios
    name: "Nombre Oficial",
    type: "Caza",            // Caza | Bombardero | Ataque | Especial | Transporte | Experimental
    country: "País",
    year: 2000,              // Año de entrada en servicio
    speed: 2000,             // km/h
    range: 3000,             // km
    ceiling: 18000,          // metros
    mtow: 25000,             // kg
    arm: "Armamento principal",
    trivia: "Dato curioso impactante.",
    img: "https://upload.wikimedia.org/...",  // Preferir Wikimedia Commons
    desc: "Descripción del rol estratégico."
}
```

## 🛠️ Tecnologías

- **HTML5** — estructura semántica
- **CSS3 nativo** — animaciones, variables, scrollbar personalizado
- **Tailwind CSS** (CDN) — utilidades de layout y spacing
- **Font Awesome** (CDN) — iconografía
- **JavaScript ES6+ Vanilla** — sin frameworks
- **localStorage** — persistencia de favoritos

## 🌐 Publicar en GitHub Pages

1. Sube el repositorio a GitHub
2. Ve a **Settings → Pages**
3. En *Source* selecciona `main` branch, carpeta `/ (root)`
4. Tu sitio estará en `https://tuusuario.github.io/aeropedia/`

## 📸 Fuentes de imágenes

Las imágenes provienen de **Wikimedia Commons** (dominio público o licencias libres). Todas incluyen atributo `onerror` con imagen de fallback.

## 📄 Licencia

MIT — libre para uso personal y educativo.

