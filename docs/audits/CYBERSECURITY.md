---
title: MDM Surgery — Cybersecurity Audit
updated: 2026-09-22
parent: ../MDM_SURGERY_MASTER_AUDIT.md
---

# Cybersecurity Audit — MDM Surgery

Alcance: código del repo en `cc58786` (front-end estático + 3 Netlify Functions del
editor). No se auditó la configuración de Netlify/GitHub/DNS fuera del repo
porque no es visible desde acá — ver `MDM_SURGERY_CONTEXT.md` §10-11.

Formato de cada hallazgo: ID / Área / Severidad / Estado / Evidencia / Problema /
Riesgo / Recomendación / Archivo / Acción propuesta / ¿Seguro implementar? /
¿Requiere cliente? / ¿Requiere abogado?

---

### SEC-01 — Sin rate limiting ni bloqueo por IP en `/api/login`

- **Área:** Auth / editor
- **Severidad:** HIGH
- **Estado:** Abierto
- **Evidencia:** `netlify/functions/login.mjs` solo espera 1200 ms antes de
  responder a una clave incorrecta. No hay contador de intentos ni bloqueo por
  IP; Netlify Functions son *stateless*, así que ese delay no impide mandar
  muchos intentos en paralelo (cada request es independiente).
- **Problema:** `EDITOR_PASSWORD` es la única barrera de acceso al editor y a
  la publicación en GitHub. Sin límite de intentos, es vulnerable a fuerza
  bruta distribuida (aunque el costo/beneficio para un atacante es bajo dado
  que la clave es robusta y no hay indicios de exposición).
- **Riesgo:** Acceso no autorizado al editor → publicación no autorizada de
  contenido/fotos en el sitio en producción.
- **Recomendación:** Rate limiting por IP (ej. Netlify Blobs como contador con
  TTL, o un servicio externo) y/o CAPTCHA en el login. Alternativa mínima:
  aumentar el delay progresivamente por IP.
- **Archivo:** `netlify/functions/login.mjs`
- **Acción propuesta:** No implementada en esta pasada — cambia el
  comportamiento de auth del único punto de acceso del editor; mejor probarla
  con Emma antes de que quede en producción.
- **¿Seguro implementar?:** Con prueba antes de publicar, sí.
- **¿Requiere cliente?:** No, pero sí una prueba de Emma post-deploy (regla
  del proyecto: no pedir la contraseña, pedirle a Emma que pruebe).
- **¿Requiere abogado?:** No.

---

### SEC-02 — Pase HMAC sin revocación individual

- **Área:** Auth / sesión
- **Severidad:** MEDIUM
- **Estado:** Documentado como decisión aceptada en `MDM_SURGERY_CONTEXT.md` §16
- **Evidencia:** `netlify/functions/_sesion.mjs` — el pase se firma con la
  propia `EDITOR_PASSWORD` y vale 12 h; no hay lista de revocación ni jti.
- **Problema:** Si un pase se filtra (dispositivo compartido, captura de
  pantalla del `localStorage`, etc.), la única forma de invalidarlo es
  cambiar `EDITOR_PASSWORD`, lo que desloguea a las dos personas que la usan.
- **Riesgo:** Uso indebido del editor durante hasta 12 h con un pase robado.
- **Recomendación:** Aceptable dado el modelo de una sola contraseña
  compartida (decisión ya tomada). Si se quiere mejorar sin rediseñar todo:
  bajar el TTL de 12 h, o guardar un "epoch" de invalidación en Blobs que
  `paseValido` consulte.
- **Archivo:** `netlify/functions/_sesion.mjs`
- **Acción propuesta:** Ninguna por ahora — es hardening opcional sobre una
  decisión ya aceptada.
- **¿Seguro implementar?:** Sí, pero es trabajo nuevo, no un fix.
- **¿Requiere cliente?:** Sí, es una decisión de producto (TTL más corto =
  el doctor tiene que loguearse más seguido).
- **¿Requiere abogado?:** No.

---

### SEC-03 — Pase de sesión en `localStorage`

- **Área:** Auth / sesión
- **Severidad:** LOW (mitigado por la ausencia de XSS conocido)
- **Estado:** Abierto
- **Evidencia:** `src/App.jsx` guarda el pase en `localStorage.mdm-editor`.
  No se encontró `dangerouslySetInnerHTML`, `innerHTML` ni `eval` en `src/`
  (grep dedicado, sin resultados) — la superficie de XSS que podría robar ese
  token hoy es prácticamente nula.
- **Problema:** `localStorage` es accesible por cualquier script que corra en
  el origen. Si en el futuro se agrega un tercero (analytics, un embed, una
  librería con una vulnerabilidad), ese pase queda expuesto.
- **Riesgo:** Robo de sesión del editor vía XSS, si se introduce en el
  futuro.
- **Recomendación:** Mantener la política de no agregar scripts de terceros
  sin revisar (ver Third Parties). No es urgente cambiar el storage.
- **Archivo:** `src/App.jsx`
- **Acción propuesta:** Ninguna.
- **¿Seguro implementar?:** N/A
- **¿Requiere cliente?:** No.
- **¿Requiere abogado?:** No.

---

### SEC-04 — Sin headers de seguridad — CORREGIDO EN ESTA PASADA

- **Área:** Transporte / navegador
- **Severidad:** MEDIUM (antes de este cambio)
- **Estado:** ✅ Implementado
- **Evidencia:** `netlify.toml` no tenía bloque `[[headers]]`. El sitio no
  fijaba `Content-Security-Policy`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options` ni
  `Strict-Transport-Security`.
- **Problema:** Sin CSP ni `X-Frame-Options`, el sitio es más vulnerable a
  clickjacking y a que un script inyectado (por una dependencia comprometida,
  por ejemplo) cargue lo que quiera.
- **Riesgo:** Clickjacking, exfiltración de datos vía scripts inyectados,
  MIME sniffing.
- **Recomendación / Acción tomada:** Se agregó un bloque `[[headers]]` en
  `netlify.toml` con CSP restrictiva. Orígenes permitidos, verificados en el
  código: `'self'` para todo, `https://cdn.jsdelivr.net` en `script-src`
  (carga bajo demanda de `heic2any` solo en el editor) y
  `https://formspree.io` en `connect-src`/`form-action` (formulario de
  contacto). `style-src` incluye `'unsafe-inline'` porque Framer Motion y los
  estilos inline de Tailwind lo necesitan — sacarlo requeriría reescribir la
  animación del sitio, fuera de alcance de esta auditoría.
- **Archivo:** `netlify.toml`
- **Acción propuesta:** Verificar la consola del navegador sin errores de CSP
  después del próximo deploy (no amerita un deploy aparte, va con el resto de
  los cambios).
- **¿Seguro implementar?:** Sí — verificado que compila y que la app carga sin
  errores de consola en `npm run dev` (el header no aplica en local, así que
  la verificación real es post-deploy).
- **¿Requiere cliente?:** No.
- **¿Requiere abogado?:** No.

---

### SEC-05 — Dependencias: `nanoid` (HIGH) — CORREGIDO; `esbuild`/`vite` (MODERATE) — diferido

- **Área:** Dependencias
- **Severidad:** HIGH (nanoid, corregido) / MODERATE (esbuild, abierto)
- **Estado:** Parcialmente corregido
- **Evidencia:** `npm audit` (2026-09-22) reportó 1 HIGH (`nanoid` < 3.3.18,
  GHSA-2v37-7h3g-55p8) y 1 MODERATE (`esbuild` <= 0.24.2 vía `vite`,
  GHSA-67mh-4wv8-2f99).
- **Problema:** `nanoid` con `size: 0` puede entrar en loop infinito — bajo
  impacto real en este proyecto (no se usa `nanoid` con tamaño dinámico desde
  input externo), pero el fix no rompía nada y ya se aplicó. El aviso de
  `esbuild` es sobre su servidor de desarrollo (`npm run dev`), que solo
  corre en la máquina local, no en producción.
- **Riesgo:** Bajo en ambos casos para este proyecto puntual; se corrigió el
  que no tenía costo.
- **Recomendación:** `npm audit fix` (sin `--force`) ya se ejecutó — actualizó
  el lockfile, sin tocar `package.json` ni versiones mayores. El aviso de
  `esbuild`/`vite` requiere `vite@8` (breaking, cambia Vite 5→8) — no se tocó
  en esta pasada porque el proyecto usa Vite 5 con Tailwind v4 y el `editorApi()`
  plugin a medida; una migración mayor de Vite merece su propio checkpoint y
  build de prueba completo, no un fix reactivo dentro de esta auditoría.
- **Archivo:** `package-lock.json`
- **Acción propuesta:** `npm audit fix` aplicado. Migración a Vite 8 queda
  como pendiente separado (ver Pending Tasks).
- **¿Seguro implementar?:** El fix de nanoid sí (ya aplicado, build verificado
  con `npm run build`). La migración de Vite no, sin probarla aparte.
- **¿Requiere cliente?:** No para nanoid. Sí para decidir cuándo agendar la
  migración de Vite (tiempo de prueba).
- **¿Requiere abogado?:** No.

---

### SEC-06 — Validación de rutas de archivo (path traversal) — ya cubierto

- **Área:** Editor / Netlify Functions
- **Severidad:** INFO (control ya presente, documentado para que no se toque)
- **Estado:** Correcto, no tocar
- **Evidencia:** `borrador.mjs`, `publicar.mjs` y el `editorApi()` de
  `vite.config.js` comparten el mismo regex `RUTA_OK =
  /^[^/\\]+\/[^/\\]+\/[^/\\]+\.webp$/` antes de tocar el filesystem o el árbol
  de GitHub. Bloquea `..`, rutas absolutas y cualquier extensión que no sea
  `.webp`.
- **Problema:** Ninguno detectado — se documenta como control existente
  correcto.
- **Riesgo:** N/A.
- **Recomendación:** No modificar este regex sin re-auditar los tres archivos
  a la vez (están duplicados a propósito, no importados de un módulo común).
- **Archivo:** `netlify/functions/borrador.mjs`, `netlify/functions/publicar.mjs`,
  `vite.config.js`
- **Acción propuesta:** Ninguna.
- **¿Seguro implementar?:** N/A
- **¿Requiere cliente?:** No.
- **¿Requiere abogado?:** No.

---

### SEC-07 — `EDITOR_GITHUB_TOKEN` con alcance de escritura sobre todo el repo

- **Área:** Editor / GitHub
- **Severidad:** MEDIUM
- **Estado:** Abierto — depende de configuración fuera del repo (Netlify/GitHub)
- **Evidencia:** `publicar.mjs` usa `EDITOR_GITHUB_TOKEN` contra
  `https://api.github.com/repos/${REPO}` sin restricción de rutas a nivel API
  (la restricción a `src/assets/procedimientos` y `src/encuadre.json` es solo
  lógica de la función, no un límite del token).
- **Problema:** Si el token tiene permisos de escritura sobre todo el repo
  (en vez de un *fine-grained personal access token* limitado a esas rutas o
  a ese repo puntual), un uso indebido del editor podría, en teoría, escribir
  fuera de esas dos rutas si se explota algún bug futuro en `publicar.mjs`.
- **Riesgo:** Escalación de un bug de lógica a compromiso más amplio del repo.
- **Recomendación:** Confirmar en GitHub que `EDITOR_GITHUB_TOKEN` sea un
  *fine-grained token* limitado al repo `eaim791/MDM-Surgery` con permiso
  "Contents: read and write" únicamente (sin permisos de Actions, Admin,
  Webhooks, etc.). Esto se configura en GitHub, no en el código.
  [DATO REQUERIDO: confirmar el tipo y alcance del token actual — no es
  visible desde el repo.]
- **Archivo:** `netlify/functions/publicar.mjs` (variable de entorno en Netlify)
- **Acción propuesta:** Ninguna en código. Verificar configuración en GitHub.
- **¿Seguro implementar?:** N/A (config externa).
- **¿Requiere cliente?:** Sí — solo Emma/el dueño de la cuenta de GitHub puede
  ver y ajustar el alcance del token.
- **¿Requiere abogado?:** No.

---

### SEC-08 — Sin logging de intentos fallidos de login/publicación

- **Área:** Observabilidad
- **Severidad:** LOW
- **Estado:** Abierto
- **Evidencia:** Ninguna de las 3 funciones registra intentos fallidos en
  ningún store persistente (solo devuelven el error al cliente).
- **Problema:** Si alguien intenta acceder sin autorización, no queda rastro
  para detectarlo después.
- **Riesgo:** Detección tardía de abuso.
- **Recomendación:** Bajo impacto para un sitio de este tamaño; Netlify ya
  guarda logs de invocación de funciones (revisables desde el panel de
  Netlify sin cambiar código). No amerita build custom de logging.
- **Archivo:** `netlify/functions/*`
- **Acción propuesta:** Ninguna — usar los logs nativos de Netlify si hace
  falta investigar algo puntual.
- **¿Seguro implementar?:** N/A
- **¿Requiere cliente?:** No.
- **¿Requiere abogado?:** No.

---

## Resumen de severidades

| Severidad | Cantidad | Estado |
|---|---|---|
| CRITICAL | 0 | — |
| HIGH | 2 | 1 corregido (nanoid), 1 abierto (rate limiting login) |
| MEDIUM | 3 | 1 corregido (headers), 2 abiertos (revocación pase, alcance token GitHub) |
| LOW | 2 | Abiertos, bajo impacto |
| INFO | 1 | Control existente documentado, no tocar |
