# Vega Clinic

Sitio web para equipo de cirugía plástica. React + Vite + Tailwind CSS v4 + Framer Motion.

## Cómo abrirlo en VS Code

1. Descomprimí el `.zip`.
2. Abrí la carpeta `vega-clinic` en VS Code (`Archivo → Abrir carpeta`).
3. Abrí una terminal integrada (`Terminal → Nueva terminal` o `Ctrl + Ñ`).
4. Instalá las dependencias:

   ```bash
   npm install
   ```

5. Levantá el servidor de desarrollo:

   ```bash
   npm run dev
   ```

6. Abrí `http://localhost:5173` en el navegador. Cada cambio que guardes se refleja al instante (hot reload).

## Comandos

| Comando           | Qué hace                                    |
|-------------------|---------------------------------------------|
| `npm run dev`     | Servidor de desarrollo con recarga en vivo  |
| `npm run build`   | Genera la versión de producción en `dist/`  |
| `npm run preview` | Previsualiza el build de producción         |

## Dónde editar

| Archivo | Contenido |
|---------|-----------|
| `src/i18n.js` | Todos los textos de interfaz en ES y EN (`UI.es` / `UI.en`) |
| `src/data.js` | Contenido bilingüe: procedimientos, áreas, equipo, sedes, testimonios, casos |
| `src/index.css` | Paletas de tema claro (`:root`) y oscuro (`.dark`) |
| `src/App.jsx` | Estructura y secciones |
| `src/assets/proc/` | Los 14 iconos de línea, uno por procedimiento (`<slug>.png`) |

### Slogan

El texto bajo "Qué hacemos" está en `UI.<idioma>.areas.slogan`. El efecto es el componente `Slogan`: dos filetes que se abren desde el centro y las palabras entrando de a una (stagger 55ms).

### Idioma y tema

- El idioma se guarda en `localStorage` (`mdm-lang`) y arranca en español. Para agregar un texto nuevo hay que sumarlo en **ambos** idiomas de `i18n.js`.
- El tema se guarda en `mdm-theme` y aplica la clase `dark` en `<html>`. Todos los colores salen de variables CSS (`var(--ink)`, `var(--bg)`, etc.), así que para retocar la paleta alcanza con `index.css`.

### Resultados

Los casos se generan en `casesFor(index, count)` en `data.js` — 3 por procedimiento por defecto. Cambiá `count` para tener más. Las imágenes son placeholders con iniciales; los pacientes se muestran **solo con iniciales**, nunca con nombre completo.

### Testimonios

El formulario **no está conectado a un servidor**: los testimonios enviados se agregan solo a la vista del navegador y se pierden al recargar. Para que funcione de verdad hay que conectarlo a un backend o a un servicio de formularios.

### Hero

- La foto de fondo (`src/assets/hero.jpg`) está **solo** en la sección Home. Vive dentro de `<main class="lg:pl-60">`, así que su caja arranca donde termina el nav lateral y nunca lo tapa. Para cambiarla, reemplazá el archivo.
- Encima de la foto va un velo (`--scrim`) definido por tema en `index.css`: 88% en claro, 90% en oscuro. Si la foto nueva es más clara u oscura, ajustá esos valores para mantener el contraste del texto.
- La flecha se oculta al pasar el 55% del alto de ventana (`pastHero`) y reaparece al volver arriba.

- El wrapper del monograma es `inline-block`, así que su ancho es el del texto `MDM`. Los SVG del nombre usan `textLength` + `lengthAdjust="spacing"` para calzar de borde a borde.
- El rectángulo semitransparente detrás del nombre se centra sobre las mayúsculas con `paddingTop: "5.02%"` (relativo al ancho, escala solo). Si cambiás la tipografía o el `leading` del `<h1>`, recalculalo.

### Tipografías

Playfair Display e Inter van dentro del bundle (`@fontsource/*`), no desde Google Fonts.

## ⚠️ Contenido médico — requiere revisión clínica

Las descripciones, duraciones y tiempos de recuperación de la sección **Procedimientos** (`PROCEDURES` en `src/data.js`) fueron redactados como punto de partida a partir de conocimiento médico general. **No provienen de los protocolos reales de la clínica.** Antes de publicar tienen que ser revisados y aprobados por el Dr. Di Maggio.

Además, en Argentina la publicidad de servicios médicos está regulada: hay restricciones sobre promesas de resultados y sobre el uso de imágenes de antes/después.

### Video del hero

Hay **dos videos**, elegidos según el ancho de pantalla:

| Pantalla | Archivos |
|----------|----------|
| ≥ 1024px | `hero.webm` / `hero.mp4` (apaisado 1280×720) + `hero-poster.jpg` |
| < 1024px | `hero-mobile.webm` / `hero-mobile.mp4` (vertical 720×1280) + `hero-mobile-poster.jpg` |

De cada uno hay WebM y MP4: el navegador baja solo el formato que soporta, y solo el par que corresponde a su pantalla. La elección se hace con `matchMedia` en React (el atributo `media` en `<source>` no funciona dentro de `<video>`). El `key` del `<video>` fuerza la recarga al cruzar el breakpoint.

Van en mute, en loop y con `playsInline`, que es obligatorio para que reproduzcan solos en iOS.

Con `prefers-reduced-motion` no se monta el video: se muestra `hero-poster.jpg` fijo.

Para cambiarlo, reemplazá los archivos manteniendo los nombres. Conviene mantener las dos versiones y regenerar el póster con el primer fotograma.

### Iconos de procedimientos

Se cargan solos con `import.meta.glob` en `data.js`: el archivo tiene que llamarse igual que el `slug` del procedimiento. Son PNG negros con fondo transparente; en modo oscuro se invierten con `.dark .proc-art { filter: invert(1) }`.

En cada tarjeta el arte aparece dos veces: chico arriba, y grande al 9% de opacidad como fondo al pasar el cursor.

## Pendiente para producción

- Todos los `href="#"` son placeholders: falta email, WhatsApp y las URLs de las redes.
- Las fotos son placeholders con iniciales (doctor, especialistas, testimonios, antes/después). Reemplazar por `<img>`.
- Conectar a un backend **los dos formularios**: el de testimonios y el de consultas.
