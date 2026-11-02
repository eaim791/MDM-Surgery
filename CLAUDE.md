# MDM Surgery — contexto del proyecto

Sitio web del Dr. Marcelo Di Maggio (cirugía plástica, estética y reconstructiva; sedes en Buenos Aires, Córdoba, Madrid y Nueva York). Sitio en producción: https://mdmsurgery.com (deploy en Netlify, ver `netlify.toml`). Landing de una sola página con equipo, procedimientos, antes/después, prensa, testimonios, sedes y formulario de contacto.

## Stack
React · Vite · framer-motion · lucide-react · fuentes Fontsource · `@netlify/blobs` / funciones en `netlify/`.

## Comandos
`npm install` · `npm run dev` · `npm run build` · `npm run preview`

## Estructura
`src/App.jsx`, `src/data.js` (contenido), `src/i18n.js` (ES/EN), `src/encuadre.json` (encuadre de fotos), `src/icons.jsx`, `src/assets/` · `netlify/` funciones · `public/` · `docs/`.
No se suben: `originales/` y `brand-assets/` (respaldos locales, ver `.gitignore`).

## Características a respetar
- Bilingüe ES/EN con un solo toggle (incluye nombres propios localizados).
- Modo claro/oscuro con persistencia y preferencia del sistema.
- Accesibilidad: `prefers-reduced-motion`, foco visible, contraste WCAG AA.
- Fotos sensibles difuminadas hasta que la visita decide verlas.
- Ver `SECURITY.md` y `THIRD_PARTY_LICENSES.md`.
