---
title: MDM Surgery — Master Context
tags: [mdm-surgery, contexto, handoff]
updated: 2026-09-22
---

# MDM SURGERY — MASTER CONTEXT

> Documento maestro de traspaso. Leerlo entero antes de tocar el proyecto.
> Etiquetas de confianza: **[V]** verificado en repo/git/producción · **[D]** decidido · **[P]** pendiente · **[?]** inferido o sin confirmar.

## 1. Project Identity

| | |
|---|---|
| Nombre | MDM Surgery |
| Producto | Landing institucional de una sola página (SPA estática) **[V]** |
| Repo | `https://github.com/eaim791/MDM-Surgery.git`, rama `main` **[V]** |
| Sitio | `https://mdmsurgery.com` **[V]** |
| Ruta local | `C:\Users\erae7\OneDrive\Documentos\Projects\mdm-surgery` **[V]** |
| Autoría | Emma A. — crédito en el pie con link a `https://portfolio-emma-aimetta.vercel.app` **[V]** (`src/App.jsx:79`) |

`mdmsurgery.com` y `mdmsurgery.netlify.app` sirven **el mismo deploy**: no hay entorno de staging. Verificado comparando el hash del bundle servido por ambos. **[V]**

## 2. Current Status

- Sitio en producción. El 2026-09-22 se agrupó y pusheó a `main` una tanda grande: auditoría integral + hardening (privacidad/legal, seguridad, SEO, a11y, UX, frontend — ver `docs/MDM_SURGERY_MASTER_AUDIT.md`), la implementación de 5 hallazgos de UX (UX-01/02/03/04/06 — ver `docs/audits/UX_UI_DEEP_AUDIT.md`), y el rediseño de slogan (Mrs Saint Delafield) + loading (monograma con foco). Un solo deploy para todo. **[V]**
- `git status` limpio tras el push, `main` sincronizado con `origin/main`. **[V]**
- Editor de fotos remoto operativo: login, borrador en la nube y publicación a GitHub probados en producción. **[V]**
- Sección **Resultados** marcada en la UI como "construyendo" (aviso deliberado al lado del selector de procedimientos). **[D]**
- Testimonios: un solo testimonio real (Instagram `@maeru.jpg`) + bloque "próximamente". **[D]**

## 3. Source of Truth

1. El repositorio y este documento.
2. `src/data.js` — todo el contenido estructurado (procedimientos, equipo, sedes, certificados, papers, testimonios).
3. `src/encuadre.json` — encuadre, censura y orden de los casos. Lo escribe el editor; no se edita a mano salvo emergencia.
4. Netlify (UI web) — variables de entorno y créditos. No hay archivo en el repo que las documente. **[V]**

No existe documentación de DNS, dominio ni Google Workspace dentro del repo. **[V]** Lo que se sepa de eso vive fuera. **[P]**

## 4. Client / Business Context

- Cliente: **Dr. Marcelo Di Maggio**, cirugía plástica, estética y reconstructiva. **[V]** (`README.md`)
- Sedes declaradas: Buenos Aires y Córdoba (Argentina), Madrid (España), New York (USA). **[V]** (`src/data.js:488`)
- Buenos Aires: consultorio en Belgrano; cirugías en Trinidad Medical Center (Palermo y San Isidro), Clínica Bazterrica, Sanatorio Güemes. Córdoba: trabaja con el Dr. Roberto Martínez Rinaldi. **[V]** (`src/data.js:464`)
- Equipo operativo del sitio: **Emma A.** (desarrollo y mantenimiento) y **el Dr. Di Maggio**, que vive en otra provincia, usa Chrome y no tiene perfil técnico. **[V]**
- Consecuencia de diseño clave: **nada puede fallar en silencio**. Cada error del editor debe mostrar en pantalla qué pasó y cómo resolverlo. Tres incidentes reales se diagnosticaron mal por falta de mensajes visibles. **[D]**

## 5. Brand & Visual Direction

- Tipografías self-hosted vía Fontsource: Playfair Display (display), Inter (texto), Cormorant Garamond, Sacramento (cursiva del loader/hero). **[V]** (`package.json`)
- Tokens de color en `src/index.css` como variables CSS (`--bg`, `--ink`, `--surface`, `--accent`, `--line`, `--muted`, `--faint`, `--photo`, `--shadow`).
- Modo claro/oscuro con persistencia en `localStorage` (`mdm-theme`) y detección del sistema. **[V]**
- Bilingüe ES/EN con toggle; idioma en `localStorage` (`mdm-lang`). Textos de interfaz en `src/i18n.js`. **[V]**
- Marca de agua MDM sobre las fotos de casos, salvo casos con logo propio. **[V]**
- Animación con Framer Motion; todo respeta `prefers-reduced-motion`. **[V]**
- `brand-assets/` (exports del logo para Google/redes) está **fuera del repo** por `.gitignore`. **[V]**

## 6. Tech Stack

| Capa | Elección |
|---|---|
| Framework | React 18.3 + Vite 5.4 **[V]** |
| Estilos | Tailwind CSS v4 (`@tailwindcss/vite`) **[V]** |
| Animación | framer-motion 11 **[V]** |
| Íconos | lucide-react 0.400 + set propio `src/icons.jsx` **[V]** |
| Imágenes | WebP en todo el sitio **[V]** |
| Formularios | Formspree **[V]** |
| Backend | Netlify Functions v2 (solo para el editor) **[V]** |
| Almacenamiento | `@netlify/blobs` 11 (borrador del editor) **[V]** |
| Decodificador HEIC | `heic2any@0.0.4` cargado **bajo demanda** desde jsDelivr, no empaquetado **[V]** (`src/App.jsx`, `LECTOR_HEIC`) |

## 7. Architecture

Sitio estático + tres funciones serverless usadas **solo** por el editor.

```
src/App.jsx (~3550 líneas)   Todas las secciones + el editor de Resultados
src/data.js (~623)           Contenido y capa de encuadre/orden/censura
src/i18n.js (180)            Textos ES/EN
src/icons.jsx                Íconos propios
src/index.css (274)          Tokens y estilos globales
src/encuadre.json            { fotos, marcos, aparte, censura, orden }
src/assets/ (~60 MB)         Fotos, videos del hero, certificados, papers
netlify/functions/           login.mjs, borrador.mjs, publicar.mjs, _sesion.mjs
vite.config.js               Plugin editorApi() — endpoints SOLO en dev
```

Las fotos se descubren con `import.meta.glob("./assets/procedimientos/*/*/*.webp", {eager:true})`: **solo `.webp` se publica**, y la ruta es siempre `<slug>/<caseId>/<archivo>.webp` (tres niveles exactos). **[V]**

### Flujo del editor (producción)

1. Candadito en el menú lateral (arriba de las sedes) → `POST /api/login` con la contraseña compartida → devuelve un pase HMAC-SHA256 firmado, válido 12 h, guardado en `localStorage` (`mdm-editor`). **[V]**
2. Los cambios se acumulan en memoria y se guardan solos **5 s después del último retoque** en Netlify Blobs (`POST /api/borrador`). No tocan el sitio público. **[V]**
3. Al reabrir con la contraseña, el borrador se recupera entero con vista previa. **[V]**
4. Botón flotante de nube → `POST /api/publicar` → un único commit a GitHub vía Git Data API (blobs → tree → commit → update ref) → Netlify reconstruye. Devuelve el hash del commit como comprobante. **[V]**

## 8. Frontend

Secciones (ids): `home`, `areas`, `procedures`, `resultados`, `team`, `press`, `testimonios`, `locations`, `contact`. **[V]**

Puntos delicados ya resueltos, **no tocar sin releer el comentario del código**:

- **Loader / cursiva**: `waitForHandwriting()` espera la fuente Sacramento (tope 2,5 s) antes de medir; la máscara SVG lleva región explícita (`x/y/width/height`) porque la default recortaba las mayúsculas. **[V]**
- **Riel de procedimientos**: el inset se toma de `getComputedStyle(viewport).paddingLeft`, **no** de `getBoundingClientRect()` — ese era el bug que colapsaba el riel al redimensionar. **[V]**
- **Hero**: el borde del video se difumina con `mask-image`, no con un gradiente al color de fondo (chocaba con el glow radial fijo). **[V]**
- **Encuadre**: `fitStyle()` / `fitRender()` recortan el marco a la intersección con la foto, sin hueco gris; `items-end` mantiene pareja la línea inferior del antes/después. **[V]**
- **Scroll durante el arrastre**: se bloquea el scroll y se apaga `overflow-anchor` del `<html>` mientras se arrastra. El *scroll anchoring* de Chrome era la causa de que la página se moviera sola. Medido: 0 px de desvío. **[V]**

### Editor (solo con sesión o en `npm run dev`)

`puedeEditar = import.meta.env.DEV || !!sesion`. Capacidades: mover, zoom (+/−/rango/Centrar), estirar el marco por el borde derecho e inferior, **recortar** (corta el archivo de verdad), **tapar/destapar** por foto, reemplazar, quitar par, quitar caso entero, agregar par, agregar foto social, crear caso, y **reordenar casos arrastrando la manijita** (renumera solo). **[V]**

## 9. Backend / Services

| Endpoint | Método | Función |
|---|---|---|
| `/api/login` | POST | Valida contra `EDITOR_PASSWORD`; 1,2 s de espera si falla. |
| `/api/borrador` | GET/POST/DELETE | Borrador en Netlify Blobs (store `editor-borrador`, clave `indice`; cada foto en `archivo/<ruta>`). |
| `/api/publicar` | POST | Commit único a GitHub y borrado del borrador. |

Detalles que importan:

- **Un solo borrador compartido**: las dos personas usan la misma contraseña, así que ven y pisan el mismo borrador. Hay detección de conflicto por marca de tiempo (`visto` / `forzar`), con opción "Ver lo suyo" o "Guardar igual". **[V]**
- Una pestaña vieja que no manda `visto` puede guardar igual — compatibilidad deliberada. **[V]**
- `publicar.mjs` **valida cada borrado contra el árbol real del repo** (comparando rutas normalizadas NFC) antes de armar el commit. Sin eso GitHub responde `GitRPC::BadObjectState` y rechaza el commit entero sin decir cuál es el archivo. **[V]**
- El guardado del índice viaja con `keepalive: true` para sobrevivir al cierre de la pestaña. **[V]**
- Endpoints de desarrollo (`/__editor/encuadre`, `/__editor/archivos`, `/__editor/publicar`) viven en `vite.config.js` y **no existen en producción**. **[V]**

## 10. Hosting / Netlify / Domain / DNS

- Hosting: **Netlify**, plan gratuito. `netlify.toml`: build `npm run build`, publish `dist`, functions `netlify/functions`, redirect `/api/* → /.netlify/functions/:splat` (200). **[V]**
- **Créditos: 300/mes, ~15,4 por deploy de producción** (~19 deploys/mes). Cada push a `main` dispara un deploy. **[V]**
- **Regla operativa: nunca `git push` sin OK explícito del usuario en ese momento.** Agrupar cambios en un solo push. **[D]**
- Dominio `mdmsurgery.com` apuntando a Netlify. Configuración de DNS/registrador **no documentada en el repo**. **[P]**

## 11. Google Workspace / Email

- Mail de contacto: `info@mdmsurgery.com`, compuesto en runtime desde `EMAIL_USER` + `EMAIL_DOMAIN` para que no aparezca como cadena continua en el bundle ni en el DOM (anti-scraping). **[V]** (`src/App.jsx:74-76`)
- Si hay Google Workspace detrás, **no está documentado en el repo**. **[P]**

## 12. Forms / Formspree

- Endpoint: `https://formspree.io/f/xnpaaroa` **[V]** (`src/App.jsx:80`)
- Anti-bot: honeypot `_gotcha` (fuera de pantalla, `tabIndex={-1}`, `aria-hidden`, sin `display:none` a propósito) + tiempo mínimo de llenado `MIN_FILL_MS = 3000`. **[V]**
- Modal de verificación de email antes de enviar, con copia reescrita: si el email está mal escrito, la consulta llega pero no se puede responder. **[V]** (`src/i18n.js`, claves `contact.checkEmail*`)

## 13. SEO / Google Search

Presente en `index.html`: `<title>`, `description`, `theme-color` por esquema, Open Graph completo (`og:image` 1200×630 en `public/og-image.jpg`), Twitter card, `og:locale` es_AR + alternate en_US. **[V]**

**Faltante** (verificado por ausencia): **[P]**

- `public/robots.txt`
- `public/sitemap.xml`
- `<link rel="canonical">` y `og:url`
- JSON-LD (`Physician` / `MedicalBusiness` / `LocalBusiness`) — muy relevante para un sitio médico multi-sede
- `hreflang` (el sitio es bilingüe pero sirve una sola URL; el idioma es estado de cliente, no ruta)

## 14. Social Media Strategy

Links en el sitio (`SOCIAL_LINKS`, `src/App.jsx:100`): Facebook `mdm.marcelodimaggio`, X `@DiMaggioM`, YouTube (canal `UCQARmZLuKwdXnl_DW5AGLOA`), Instagram `@mdmsurgery`, LinkedIn `marcelo-di-maggio-72712323`. Playlist de entrevistas embebida como `INTERVIEWS_PLAYLIST`. **[V]**

No hay estrategia de redes documentada en el repo. **[P]**

## 15. Completed Work

- Loader sin doble flash ni FOUT; cursiva legible y sin recorte; slogan móvil en dos renglones.
- Riel de procedimientos: arreglado el colapso tras redimensionar.
- Hero: quitado el reflejo, borde del video difuminado con máscara.
- Foto del doctor rediseñada (4:5, fondo radial, marco desplazado).
- Testimonios rediseñados a solo texto; **eliminados los testimonios inventados** que estaban en producción.
- Siluetas de fondo (`SilkRibbon`) mandadas detrás del texto (`-z-10` + `isolate`).
- Resultados en móvil: flechas fuera, aviso de deslizar (`SwipeRow`).
- Cards de Resultados más chicas en notebooks (`@media (max-height: 850px)`).
- `.claude/` sacado del repo y agregado a `.gitignore`.
- Editor local completo → editor remoto con candadito y contraseña.
- Borrador en la nube + guardado automático + aviso de conflicto.
- Recorte real de fotos, censura por foto, reordenamiento de casos arrastrando.
- Soporte HEIC bajo demanda; mensajes de error para archivo ilegible (OneDrive/iCloud sin bajar) y para navegador sin webp.
- Scroll clavado durante el arrastre.
- Vista de la foto entera atenuada mientras se mueve, con borde marcando el corte.
- Auditoría integral (legal/privacidad, ciberseguridad, SEO, a11y, UX, frontend) + hardening seguro: `robots.txt`, `sitemap.xml`, canonical, `og:url`, JSON-LD `Physician`, headers de seguridad (CSP incluida) en `netlify.toml`, nota anti-datos-sensibles en el formulario de contacto, fix de la dependencia `nanoid` (HIGH) vía `npm audit fix`. Detalle en `docs/MDM_SURGERY_MASTER_AUDIT.md` y `docs/audits/`.
- Auditoría profunda de UX/UI (`docs/audits/UX_UI_DEEP_AUDIT.md`) + implementación de 5 hallazgos aprobados por Emma: el FAB de contacto ya no tapa texto en "Qué hacemos" ni en los tabs de casos de Resultados (mobile, `pb-20 sm:pb-0` / `pr-14 sm:pr-0` en `src/App.jsx`); los bordes de los campos del formulario usan un nuevo token `--field-line` (`src/index.css`) con contraste WCAG 1.4.11 correcto; Sedes pasó de 3 tarjetas por país a 4 tarjetas por ciudad, cada una titulada "Ciudad, País" (decisión de Emma, para no confundir "Córdoba, Argentina" con "Córdoba, España"); el copy de "Hilos Tensores"/"Tensor Threads" se acortó en `src/data.js` para no cortarse a mitad de frase. Único pendiente de UX: UX-05 (detalle del wordmark del hero), dejado como polish opcional sin tocar.
- Slogan y loading rediseñados a pedido de Emma, tras mostrarle variantes en un Artifact comparativo: el slogan ("La ciencia de la belleza...") pasó de Sacramento a **Mrs Saint Delafield** (`--handwritten-fill` en `src/index.css`, paquete `@fontsource/mrs-saint-delafield`); el loading dejó de escribir "MDM Surgery & Team" a mano alzada y ahora es el monograma "MDM" haciendo foco (`blur→0` + `scale`, ~0.8s, clase `.loader-mark`) — más corto de percibir y ya no depende de que cargue ninguna fuente cursiva para arrancar. `@fontsource/sacramento` se desinstaló (quedó sin uso). **Dato para el handoff**: un comentario viejo en el código (ya removido) advertía que Mrs Saint Delafield se había descartado antes por leerse peor letra por letra que Sacramento — se implementó igual porque Emma la vio en el comparativo y la eligió a propósito; si en producción se ve poco legible, ese es el motivo histórico a tener en cuenta antes de volver a cambiarla.

## 16. Important Decisions

- **Solo `.webp` se publica.** El glob ignora cualquier otro formato. La conversión ocurre en el navegador (lado mayor 1800 px, bucle de calidad hasta ≤200 KB).
- **Una sola contraseña compartida** para Emma y el doctor, en vez de usuarios separados. Simplicidad sobre trazabilidad.
- **Secretos solo en variables de entorno de Netlify**, marcadas "Contains secret values". Nunca en el chat ni en el repo.
- **El editor viaja en el bundle de producción** pero está detrás de la sesión; los endpoints de escritura de dev no existen en producción.
- **Publicar = un commit + un deploy.** Por eso la publicación pide confirmación y los cambios se agrupan.
- **Manijita para arrastrar casos** en vez de arrastrar la pastilla entera, para no romper el deslizamiento con el dedo en móvil.
- **El antes y el después se quitan juntos**: la página muestra los casos de a pares, una foto sola no se puede mostrar.
- **Censura por foto** (`encuadre.json → censura`) que **pisa** las listas fijas de `data.js`; permite tapar una foto puntual o destapar una de un procedimiento tapado por defecto.

## 17. Rejected / Deprecated Decisions

- **Sistema automático de encuadre** — reemplazado por el editor manual.
- **Testimonios inventados** — estaban marcados en el código como placeholder y vivían en un sitio médico real. Eliminados.
- **Chequeo temporal `GET /api/publicar`** — existió solo para diagnosticar el token de GitHub; ya removido (responde 405).
- **Compensación de scroll posterior al cambio** (`anclarPar` + `useLayoutEffect`) — insuficiente, dejaba saltos. Sigue en el código para cambios que no son arrastre, pero se desactiva durante el arrastre.
- **Usar el link de Netlify como entorno de prueba** — descartado: es el mismo sitio.
- `revision3/encuadre.py`, `revision3/prueba.py`, `face_landmarker.task`, `yunet.onnx` y los haarcascades — borrados al dejar de usarse la detección facial.

## 18. Known Problems

| Problema | Estado |
|---|---|
| Casos compartidos (`SHARED_CASES`): al editarlos desde el procedimiento "prestado", la vista previa no se actualiza ahí (sí en el dueño de las fotos). Publicar funciona bien. | Abierto, cosmético **[V]** |
| Fotos quirúrgicas `antes-2q`/`despues-2q` de Tomás Bruno sin difuminar, mientras el otro par del mismo caso sí está marcado como sensible. | Abierto — ahora se puede corregir desde el editor con "Tapar" **[V]** |
| El recorte reemplaza la foto sin "deshacer" en el editor. Recuperable solo desde el historial de git. | Aceptado **[D]** |
| Un solo borrador compartido: si los dos editan a la vez, uno pisa al otro (hay aviso, no fusión). | Aceptado con mitigación **[D]** |
| Bundle único de ~570 KB (aviso de Vite por >500 KB). Sin code splitting. | Abierto, bajo impacto **[V]** |
| `beforeunload` no es fiable en navegadores móviles; mitigado con `keepalive` y escritura atómica. | Mitigado **[V]** |
| El repo vive dentro de `OneDrive`. Si se vuelve a vincular la cuenta, OneDrive puede dejar archivos "en la nube" y romper git y las builds. Ya causó un incidente de carga de fotos. | Riesgo activo **[V]** |
| Carpeta vacía `mdm-surgery/` dentro del repo. | Cosmético **[V]** |
| `/api/login` no tiene rate limiting ni bloqueo por IP (solo un delay fijo de 1,2 s por request, que no frena intentos en paralelo). | Abierto, HIGH — ver `docs/audits/CYBERSECURITY.md` SEC-01 **[V]** |
| `esbuild`/`vite` con aviso MODERATE de `npm audit` (afecta solo al server de dev local, no a producción). Requiere `vite@8` para resolverse, cambio mayor. | Abierto, diferido a propósito **[V]** |
| Sin Política de Privacidad, Aviso Médico ni Términos y Condiciones publicados, pese a que el formulario recolecta datos personales en 3+ jurisdicciones. Borradores tecnológicos listos en `docs/legal/BORRADORES_LEGALES.md`, sin publicar. | Abierto, requiere datos del cliente + revisión jurídica **[V]** |

## 19. Pending Tasks

1. ~~SEO faltante: `robots.txt`, `sitemap.xml`, `canonical`, `og:url`, JSON-LD médico.~~ Implementado 2026-09-22 (ver §15). Falta `hreflang`, diferido a propósito: requiere URLs por idioma, es decisión de arquitectura. **[V]**
2. Conseguir testimonios reales adicionales (hoy hay uno). **[P]**
3. Revisar y tapar las fotos quirúrgicas sin censura (`antes-2q`/`despues-2q` de Tomás Bruno). **[P]**
4. Documentar fuera del repo: DNS/registrador, Google Workspace, cuenta de Netlify y de Formspree. **[P]**
5. Decidir si mover el repo fuera de OneDrive. **[P]**
6. Verificar con uso real el recorte y el reordenamiento por parte del doctor. **[P]**
7. Completar los `[DATO REQUERIDO]` de `docs/legal/BORRADORES_LEGALES.md` (responsable del tratamiento, domicilio, email de privacidad) y mandar los 3 borradores a revisión jurídica. **[P]**
8. Decidir dónde viven las páginas legales en el sitio (modal vs. ruta propia) y, con eso resuelto, agregar el checkbox de consentimiento al formulario. **[P]**
9. Confirmar si la práctica en EE.UU. es entidad cubierta por HIPAA. **[P]**
10. Revisar en GitHub el alcance real de `EDITOR_GITHUB_TOKEN` (fine-grained, limitado al repo). **[P]**
11. Evaluar agregar rate limiting a `/api/login` (probar con Emma antes de publicar). **[P]**
12. Agendar sin apuro la migración Vite 5 → 8 (resuelve el aviso MODERATE de `esbuild`, es breaking change). **[P]**

## 20. Next Recommended Actions

En orden, con dependencias:

1. **Confirmar que el doctor ya usó el editor nuevo** (recorte, tapar, reordenar). Sin esto, el resto es especulación. Sin dependencias.
2. **SEO** (tarea 1) — el de mayor retorno y no depende de nadie. Agrupar todo en **un solo deploy** junto a cualquier otro cambio pendiente.
3. **Censura de las quirúrgicas** (tarea 3) — se hace desde el editor, sin tocar código; consume el mismo deploy que el editor dispara al publicar.
4. **Sacar el repo de OneDrive** (tarea 5) — sin prisa, pero antes de que se vuelva a vincular la cuenta.

## 21. Commands

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build
```

```bash
npm run preview
```

`npm run dev` levanta además los endpoints `/__editor/*` en el puerto 5173.

Ver qué bundle está sirviendo producción (para confirmar que un deploy terminó):

```bash
curl -s https://mdmsurgery.com/ | grep -o 'assets/index-[A-Za-z0-9_-]*\.js' | head -1
```

Comprobar que las funciones responden, sin credenciales:

```bash
curl -s https://mdmsurgery.com/api/borrador
```

## 22. Environment / Configuration

Variables en **Netlify → Environment variables** (nunca en el repo):

| Variable | Uso | Valor |
|---|---|---|
| `EDITOR_PASSWORD` | Contraseña compartida del editor; también firma el pase HMAC | [REDACTED] |
| `EDITOR_GITHUB_TOKEN` | Token con permiso de escritura en el repo | [REDACTED] |
| `EDITOR_REPO` | Opcional. Default `eaim791/MDM-Surgery` | — |
| `EDITOR_RAMA` | Opcional. Default `main` | — |

Cambiar `EDITOR_PASSWORD` invalida todos los pases vigentes, porque el pase se firma con ella. **[V]**

`localStorage` del cliente: `mdm-theme`, `mdm-lang`, `mdm-editor` (el pase). **[V]**

## 23. Git / Checkpoints

Rama única `main`. Commits recientes, del más nuevo al más viejo: **[V]**

```
cc58786  Recortar fotos, elegir la censura y ordenar los casos arrastrando
22b2648  Distingue un archivo que no se pudo bajar de uno con formato raro
d00c62a  Lee las fotos .HEIC del iPhone sin pedir que las conviertan a mano
d51024d  Avisa cuando una foto no se puede agregar, en vez de no hacer nada
54d1d66  Permite quitar un caso entero desde el editor
7485c09  Guarda el borrador solo y protege el momento del guardado
4e401c9  Actualiza las fotos de Resultados desde el editor   <-- commit hecho por el editor
ccfb5ea  Publica aunque alguna foto a quitar ya no este en el sitio
19acdcb  Deja de esconder los fallos al publicar
```

`4e401c9` muestra cómo se ve un commit generado por el propio editor: mensaje fijo "Actualiza las fotos de Resultados desde el editor". **[V]**

## 24. Important Files

| Ruta | Qué es |
|---|---|
| `src/App.jsx` | Todo el sitio y el editor. ~3550 líneas. |
| `src/data.js` | Contenido + `SHARED_CASES`, `CASOS_AL_FINAL`, `CASOS_AL_PRINCIPIO`, `PROCEDIMIENTOS_SENSIBLES`, `FOTOS_SENSIBLES`, `ordenarCasos`, `esSensible`, `fitStyle`, `fitRender`. |
| `src/encuadre.json` | `{ fotos, marcos, aparte, censura, orden }`. Clave = `slug/caseId/archivo-sin-extension`, normalizada NFC. |
| `src/i18n.js` | Textos ES/EN. |
| `src/index.css` | Tokens y estilos globales. |
| `vite.config.js` | Plugin `editorApi()` — endpoints de escritura solo en dev. |
| `netlify.toml` | Build, functions y redirect `/api/*`. |
| `netlify/functions/_sesion.mjs` | `crearPase` / `paseValido` / `pedirPase` (HMAC-SHA256, 12 h). |
| `netlify/functions/login.mjs` | Login. |
| `netlify/functions/borrador.mjs` | Borrador en Netlify Blobs + conflicto. |
| `netlify/functions/publicar.mjs` | Commit a GitHub. |
| `src/assets/procedimientos/<slug>/<caso>/*.webp` | 610 fotos en 18 procedimientos. |
| `revision3/*.py` | Utilidades locales fuera del sitio (conversión a webp, og image, inventario). |

## 25. Risks / Things Not To Break

- **No pushear sin OK.** Cada push gasta ~15,4 de 300 créditos mensuales.
- **No poner secretos en el repo ni pedirlos por chat.** Para probar el camino autenticado, pedirle a Emma que lo haga y que pase el mensaje que ve en pantalla.
- **No dejar que nada del editor falle en silencio.** Es la causa raíz de casi todos los incidentes de este proyecto.
- **No dejar servidores de desarrollo viejos corriendo.** Un dev server obsoleto de otra sesión en el puerto 5173 llegó a borrar dos fotos reales. Cerrar el preview al terminar.
- **No romper el glob de fotos**: la ruta debe ser exactamente `<slug>/<caso>/<archivo>.webp`, tres niveles.
- **No tocar `items-end` de `.res-pair`** sin entender que mantiene pareja la línea inferior del antes/después.
- **No revertir el `paddingLeft` calculado** del riel de procedimientos a `getBoundingClientRect()`.
- **No quitar `overflow-anchor: none`** durante el arrastre.
- Las fotos son material clínico de pacientes reales: tratar la censura y los borrados con cuidado.

## 26. Handoff Instructions For Next Claude Session

1. Leer este documento entero. No re-auditar el repo salvo que algo no cuadre.
2. Correr `git log --oneline -5` y `git status` para ver si algo cambió desde `cc58786`: el editor puede haber generado commits propios.
3. Trabajar en español rioplatense, que es como se viene hablando con la clienta.
4. Antes de proponer un cambio, revisar §25.
5. Agrupar cambios y pedir OK explícito antes de pushear; al terminar, informar cuántos deploys se gastaron.
6. Para verificar algo del editor en producción, no pedir la contraseña: pedirle a Emma que haga la prueba y pase el mensaje en pantalla.
7. Al terminar una tanda de trabajo, actualizar §2, §15, §18, §19 y §27 de este documento.

## 27. Last Updated

2026-09-22 — pusheado a `main` en un solo deploy, sobre la base `cc58786`:
auditoría integral + hardening (SEO técnico, headers de seguridad + CSP,
nota anti-datos-sensibles, fix de `nanoid`), 5 hallazgos de UX/UI
implementados (FAB flotante, contraste de inputs, tarjetas de Sedes por
ciudad, copy de Hilos Tensores), y el rediseño de slogan/loading (Mrs Saint
Delafield + monograma con foco). Documentación en
`docs/MDM_SURGERY_MASTER_AUDIT.md`, `docs/audits/` y `docs/legal/`. Ver §2,
§15, §18, §19 para el detalle.
