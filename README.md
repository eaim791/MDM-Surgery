# MDM Surgery

Sitio web del Dr. Marcelo Di Maggio — cirugía plástica, estética y reconstructiva, con sede en Buenos Aires, Córdoba, Madrid y Nueva York.

Landing institucional en una sola página: presenta al equipo médico, las áreas de trabajo (armonización, reafirmación de género, rejuvenecimiento facial y corporal), el listado completo de procedimientos con casos de antes/después, trayectoria y prensa, testimonios de pacientes, sedes y un formulario de contacto.

## Características

- **Bilingüe (ES/EN)** — todo el contenido, incluida la localización de nombres propios (sedes, ciudades), cambia con un solo toggle.
- **Modo claro / oscuro** — con persistencia en `localStorage` y detección de preferencia del sistema.
- **Accesibilidad** — respeta `prefers-reduced-motion` en toda animación (incluidas las más elaboradas, como el riel de procedimientos), foco de teclado visible en todo el sitio, contraste de color verificado contra WCAG AA.
- **Galería de resultados** con filtro por procedimiento, casos con múltiples ángulos y comparación antes/después.
- **Riel de procedimientos con scroll-jacking**: la sección queda fija en pantalla mientras el scroll vertical recorre horizontalmente las tarjetas de cada procedimiento.
- **Formulario de contacto** funcional vía [Formspree](https://formspree.io/), con estado de carga y confirmación de envío.
- **Diseño responsive** de punta a punta — sidebar fijo en escritorio, menú lateral deslizable en mobile.

## Stack técnico

| | |
|---|---|
| **Framework** | [React 18](https://react.dev/) + [Vite 5](https://vitejs.dev/) |
| **Estilos** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Animación** | [Framer Motion](https://www.framer.com/motion/) |
| **Íconos** | [lucide-react](https://lucide.dev/) + un set de íconos SVG propios (`src/icons.jsx`) |
| **Tipografía** | Playfair Display + Inter, self-hosted vía [Fontsource](https://fontsource.org/) |
| **Envío de formularios** | [Formspree](https://formspree.io/) |
| **Imágenes** | Formato WebP en todo el sitio (fotos, texturas, certificados) |

Sin backend propio: es un sitio estático (React + Vite build) que se puede servir desde cualquier hosting estático (Vercel, Netlify, GitHub Pages, etc.).

## Estructura del proyecto

```
src/
├── App.jsx           # Componente principal — todas las secciones del sitio
├── data.js           # Contenido: procedimientos, equipo, sedes, testimonios, etc.
├── i18n.js           # Textos de interfaz en español e inglés
├── icons.jsx         # Set de íconos SVG propios (sedes, servicios, tema/idioma)
├── index.css         # Tokens de diseño (variables CSS) y estilos globales
├── encuadre.json      # Recorte/encuadre calculado para cada foto de caso
└── assets/            # Fotos, video del hero, certificados, papers, texturas
```

## Desarrollo

```bash
npm install       # instalar dependencias
npm run dev        # servidor de desarrollo
npm run build      # build de producción (carpeta dist/)
npm run preview    # previsualizar el build de producción
```

## Créditos

Página hecha por [Emma A.](https://aimettaemma.vercel.app/)
