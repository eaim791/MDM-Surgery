---
title: MDM Surgery — Master Audit
updated: 2026-09-22
based_on_commit: cc58786
sources: [MDM_SURGERY_CONTEXT.md, audits/LEGAL_PRIVACY.md, audits/CYBERSECURITY.md, legal/BORRADORES_LEGALES.md]
---

# MDM Surgery — Master Audit

No soy abogado y este documento no es asesoramiento legal. No afirmo que el
sitio sea "100% legal" ni "imposible de demandar" — el objetivo es reducir
exposición razonable, detectar faltantes, implementar lo que es seguro
implementar sin revisión externa, y dejar claro qué necesita datos del
cliente, aprobación del cliente o revisión de un abogado.

Formato de cada hallazgo (usado en `audits/*.md`): ID / Área / Severidad /
Estado / Evidencia / Problema / Riesgo / Recomendación / Archivo / Acción
propuesta / ¿Seguro implementar? / ¿Requiere cliente? / ¿Requiere abogado?
Severidades: CRITICAL, HIGH, MEDIUM, LOW, INFO. No se usan scores globales.

## Executive Summary

MDM Surgery es una SPA estática de una sola página, sin cookies, sin
analytics, sin trackers y sin embeds de terceros — eso simplifica mucho el
panorama de privacidad frente a un sitio médico típico. El riesgo principal
detectado no es técnico sino de **ausencia de documentación legal**: no hay
Política de Privacidad, Aviso Médico ni Términos, pese a que el formulario de
contacto recolecta datos personales de visitantes de al menos tres
jurisdicciones (Argentina, España/UE, EE.UU.) y tiene un campo libre por el
que alguien podría enviar información de salud. En seguridad, no se
encontraron vulnerabilidades críticas ni secretos expuestos; el punto más
débil es la falta de rate limiting en el login del editor. En SEO, los
faltantes ya conocidos (`robots.txt`, `sitemap.xml`, canonical, `og:url`,
JSON-LD) se implementaron en esta pasada; `hreflang` se dejó pendiente por
una razón técnica de fondo (ver SEO). Se aplicó también una advertencia en el
formulario para desalentar el envío de datos médicos sensibles, y se
corrigieron los headers de seguridad y una dependencia vulnerable (`nanoid`).
Ningún cambio implementado toca el editor, `data.js`, `encuadre.json` ni el
comportamiento de arrastre/scroll documentados como frágiles en
`MDM_SURGERY_CONTEXT.md` §25.

## Critical Findings

**Ninguno.** No se encontraron secretos expuestos, vulnerabilidades críticas
de inyección/XSS, ni exposición no autorizada de datos. El hallazgo de mayor
severidad es HIGH (falta de rate limiting en `/api/login`, ver Cybersecurity).

## Legal / Privacy

Análisis completo, por jurisdicción (Argentina/Ley 25.326, España-UE/RGPD,
EE.UU./Nueva York, determinación de HIPAA) en
**[audits/LEGAL_PRIVACY.md](audits/LEGAL_PRIVACY.md)**. Resumen:

- El sitio recolecta datos personales vía Formspree; aplica normativa de
  protección de datos en las tres jurisdicciones donde el sitio declara
  presencia.
- El campo de mensaje libre puede recibir datos de salud (categoría
  especial/sensible) sin que el usuario lo busque activamente — se agregó una
  advertencia visible (ver Safe Changes).
- HIPAA: sin evidencia en el repo de que el sitio procese PHI de forma
  rutinaria; probablemente no aplica al sitio web en sí, pero depende de si
  la práctica en EE.UU. es entidad cubierta — **[CONFIRMAR CON ABOGADO]**.
- Documentos legales necesarios: Política de Privacidad (necesaria), Aviso
  Médico (necesario), Términos y Condiciones (probablemente necesarios),
  Política de Cookies (no necesaria hoy — no hay cookies no esenciales).
  Borradores técnicos bilingües en
  **[legal/BORRADORES_LEGALES.md](legal/BORRADORES_LEGALES.md)**, con
  placeholders `[DATO REQUERIDO]` donde falta información que no se debe
  inventar.

## Cookies

Auditoría real de tecnologías usadas (no supuesta): `document.cookie` no
aparece en el código; no hay Google Analytics, Meta Pixel, Tag Manager,
Hotjar, Clarity, ni ningún otro tracker o CMP. El único almacenamiento del
lado del cliente es `localStorage` con tres claves, todas funcionales:
`mdm-theme`, `mdm-lang`, `mdm-editor` (pase de sesión del editor). Ninguna
requiere consentimiento bajo ePrivacy/RGPD. **Conclusión: no hace falta
banner de cookies ni CMP.** Se documentó esto explícitamente para no agregar
complejidad innecesaria a un problema que no existe.

## Forms

- Formulario de contacto → Formspree (`https://formspree.io/f/xnpaaroa`).
  Ya tenía honeypot y tiempo mínimo de llenado (antibot) correctamente
  implementados — no se tocaron.
- **Falta** checkbox de consentimiento vinculado a una Política de
  Privacidad — no se agregó todavía porque no hay página de privacidad
  publicada a la que enlazar (ver Changes Requiring Client Confirmation).
- **Implementado en esta pasada**: nota bilingüe bajo el campo de mensaje
  pidiendo no incluir datos médicos sensibles, síntomas urgentes o
  información de terceros (`src/i18n.js` claves `fMsgNote`, `src/App.jsx`
  cerca del textarea de contacto).
- Validación, estados de error y accesibilidad del formulario ya eran
  razonables: mensajes de error visibles (`cErr`), verificación de email
  antes de enviar, `maxLength` en los campos. No se encontraron problemas
  nuevos que ameriten cambio.

## Patient Data / Images

Prioridad alta, sin cambios automáticos a fotos ni casos (según lo pedido).
Detalle completo en `audits/LEGAL_PRIVACY.md` §8. Resumen:

- La lógica de censura por foto (`FOTOS_SENSIBLES`, `PROCEDIMIENTOS_SENSIBLES`,
  `esSensible()`, `encuadre.json → censura`) ya existe y no se tocó.
- Un solo testimonio real, con handle de Instagram público enlazado a un post
  real — riesgo menor porque la persona ya lo publicó ella misma, pero falta
  confirmar consentimiento explícito para citarlo en el sitio.
  **[CONFIRMAR CON CLIENTE]**.
- No se auditaron metadatos EXIF de las ~610 fotos existentes (fuera de
  presupuesto de esta auditoría); los nombres de archivo ya son genéricos.
- Pendiente ya conocido: fotos `antes-2q`/`despues-2q` de Tomás Bruno sin
  difuminar — se puede resolver desde el editor (tapar foto), no es un
  cambio de código.
- Sin evidencia de fotos de menores en el repo — **[CONFIRMAR CON CLIENTE]**
  como práctica general.

## Cybersecurity

Detalle completo, con formato ID/Área/Severidad, en
**[audits/CYBERSECURITY.md](audits/CYBERSECURITY.md)**. Resumen:

| Severidad | Total | Corregidos ahora | Abiertos |
|---|---|---|---|
| CRITICAL | 0 | — | — |
| HIGH | 2 | 1 (`nanoid`) | 1 (sin rate limiting en `/api/login`) |
| MEDIUM | 3 | 1 (headers de seguridad) | 2 (revocación de pase, alcance del token de GitHub) |
| LOW | 2 | — | 2 (pase en localStorage, sin logging de intentos) |
| INFO | 1 | — | 1 (control ya correcto, documentado para no tocarlo) |

`npm audit` no encontró vulnerabilidades en dependencias de producción
(`--omit=dev`); sí encontró `nanoid` (HIGH, corregido con `npm audit fix`,
sin cambios de versión mayor) y `esbuild`/`vite` (MODERATE, solo afecta el
servidor de desarrollo local — se difirió porque el fix requiere `vite@8`,
un cambio mayor que merece su propio checkpoint).

## Accessibility

- Foco visible: existe un `outline` de accento global en `src/index.css`
  (no se removió el outline nativo sin reemplazo) — correcto, no se tocó.
- `alt` en imágenes: las decorativas usan `alt="" aria-hidden="true"`
  correctamente; las informativas (foto del Dr. Di Maggio, lightbox de casos)
  tienen `alt` descriptivo. No se encontraron `<img>` sin atributo `alt`.
- `lang` del documento se actualiza dinámicamente al cambiar de idioma
  (`document.documentElement.lang = lang` en `src/App.jsx:924`) — correcto.
- `prefers-reduced-motion` respetado en las animaciones (confirmado en
  `MDM_SURGERY_CONTEXT.md` §5, no re-auditado a fondo por presupuesto).
- No se hizo una auditoría exhaustiva con lector de pantalla real (fuera de
  alcance de esta pasada) — si se quiere profundizar, un chequeo con axe o
  Lighthouse sobre el sitio en producción sería el siguiente paso, sin
  necesidad de otra sesión completa de auditoría.

## UX/UI

Auditoría profunda dedicada (inspección visual real, no solo código) en
**[audits/UX_UI_DEEP_AUDIT.md](audits/UX_UI_DEEP_AUDIT.md)**. Estado
2026-09-22: **UX-01, UX-02, UX-03, UX-04 y UX-06 implementados y
verificados** (build + preview mobile/desktop, sin errores de consola). El
FAB de contacto ya no tapa texto en Areas ni en los tabs de Resultados
(mobile); los bordes de los inputs del formulario pasan el contraste WCAG
1.4.11; Sedes pasó a una tarjeta por ciudad con título "Ciudad, País" (evita
la ambigüedad de "Córdoba", que existe en Argentina y en España); el copy de
"Hilos Tensores" ya no se corta a mitad de frase. UX-05 (wordmark del hero)
queda como polish opcional, sin tocar.

- El formulario, los estados de carga (`Loader2` en botones), los mensajes
  de error visibles y el aviso de contenido sensible ya siguen el principio
  de "nada falla en silencio" documentado como no negociable del proyecto.
  La nueva nota sobre datos médicos sensibles sigue el mismo lenguaje visual
  discreto (`text-[var(--faint)]`) que el resto de las notas del formulario,
  sin romper la estética editorial/minimalista.
- No se identificaron problemas de jerarquía, spacing o contraste nuevos en
  esta pasada — el sistema de diseño (paleta, tipografías, tokens en
  `src/index.css`) ya está consolidado y no se tocó.
- La decisión de dónde y cómo mostrar los futuros documentos legales (modal
  vs. página propia) queda pendiente de una decisión de producto — ver
  Changes Requiring Client Confirmation.

## Frontend

- Bundle de producción: 581 KB JS (antes 570 KB, el crecimiento es por el
  JSON-LD embebido — despreciable) + 64 KB CSS. Vite avisa por >500 KB; no se
  hizo code splitting porque cambiaría la arquitectura de carga por una
  ganancia marginal en un sitio de una sola página que ya carga rápido en la
  práctica (según el contexto documentado). No se justifica el riesgo.
- `npm run build` corre sin errores ni warnings nuevos.
- No se tocó ninguno de los puntos frágiles documentados en
  `MDM_SURGERY_CONTEXT.md` §8 (loader, riel de procedimientos, hero,
  encuadre, scroll durante el arrastre).

## SEO

Estado verificado contra lo que `MDM_SURGERY_CONTEXT.md` §13 marcaba como
pendiente:

| Ítem | Estado antes | Acción |
|---|---|---|
| `robots.txt` | Faltante (confirmado, no existía en `public/`) | ✅ Creado |
| `sitemap.xml` | Faltante | ✅ Creado (una sola URL — el sitio es una SPA de una página) |
| `<link rel="canonical">` | Faltante | ✅ Agregado en `index.html` |
| `og:url` | Faltante | ✅ Agregado |
| JSON-LD (`Physician`) | Faltante | ✅ Agregado, solo con datos verificados en `src/data.js` (nombre, redes, sedes). Sin domicilio ni teléfono — no están confirmados en el repo |
| `hreflang` | Faltante | **No implementado** — el sitio sirve una sola URL para ambos idiomas (el idioma es estado de cliente vía `localStorage`, no una ruta distinta). Agregar `hreflang` sin URLs por idioma no le da a Google nada real que indexar por separado; hacerlo bien requeriría rutas (`/en`) o un parámetro de idioma en la URL — es una decisión de arquitectura, no un fix de metadata. Queda documentado como pendiente técnico, no como tarea suelta |

## Third Parties

| Proveedor | Función | Datos involucrados | Cookies/storage | Jurisdicción/transferencia | ¿Necesita documentación? |
|---|---|---|---|---|---|
| Formspree | Procesa el formulario de contacto | Nombre, email, mensaje (potencialmente datos de salud si el usuario los escribe) | Ninguna del lado de este sitio | [DATO REQUERIDO: ubicación de datos de Formspree] | Sí — mencionar en Política de Privacidad |
| Netlify | Hosting, build, functions, Blobs (borrador del editor) | Fotos en borrador (no publicadas), variables de entorno secretas | Ninguna de cara al visitante | [DATO REQUERIDO] | Opcional — es infraestructura, no de cara al usuario final |
| GitHub | Repositorio + publicación del editor vía API | Contenido del repo (fotos publicadas, código) | N/A | [DATO REQUERIDO] | No, es infraestructura interna |
| jsDelivr (CDN) | Sirve `heic2any` bajo demanda, solo dentro del editor | Ninguno del visitante público | Ninguna | N/A | No — nunca se carga fuera del editor |
| YouTube / Instagram / Facebook / X / LinkedIn | Solo enlaces de salida (`target="_blank"`), sin embeds | Ninguno mientras el usuario no haga click | Ninguna en este sitio | N/A | No |

## Missing Information

Lista consolidada (repetida de `audits/LEGAL_PRIVACY.md` para visibilidad
rápida) — nada de esto se inventó:

- Responsable del tratamiento (persona física o sociedad), domicilio legal,
  CUIT/NIF/EIN
- Email dedicado de privacidad
- Plan y ubicación de datos de Formspree (DPA, subencargados)
- Confirmación de si la práctica en EE.UU. es entidad cubierta por HIPAA
- Confirmación de consentimiento firmado por cada caso/testimonio publicado
- Vigencia de las licencias médicas mostradas en certificados
- Tipo y alcance real de `EDITOR_GITHUB_TOKEN` (fine-grained vs. clásico)

## Safe Changes

Implementados en esta pasada, sin tocar editor, `data.js`, `encuadre.json` ni
comportamiento documentado como frágil. Build verificado (`npm run build`) y
la nota del formulario probada en el preview local sin errores de consola:

1. `public/robots.txt` — nuevo.
2. `public/sitemap.xml` — nuevo (una URL).
3. `index.html` — `<link rel="canonical">`, `og:url`, JSON-LD `Physician`
   con datos verificados.
4. `netlify.toml` — bloque `[[headers]]`: CSP, `X-Content-Type-Options`,
   `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`,
   `Strict-Transport-Security`. Orígenes de la CSP verificados contra el
   código real (Formspree, jsDelivr, self) — no se inventaron permisos de
   más.
5. `src/i18n.js` + `src/App.jsx` — nota bilingüe bajo el campo de mensaje del
   formulario de contacto, pidiendo no incluir datos médicos sensibles.
6. `npm audit fix` — corrigió `nanoid` (HIGH) sin cambios de versión mayor;
   solo tocó `package-lock.json`.
7. `docs/audits/LEGAL_PRIVACY.md`, `docs/audits/CYBERSECURITY.md`,
   `docs/legal/BORRADORES_LEGALES.md` — documentación nueva.

**Nota post-deploy** (no amerita un deploy aparte, va con el próximo que se
haga de todas formas): revisar la consola del navegador en producción por si
la CSP bloquea algo no detectado en esta auditoría — pedirle a Emma que lo
chequee, según la regla del proyecto de no pedir la contraseña ni probar
producción por chat.

## Changes Requiring Client Confirmation

- **Checkbox de consentimiento en el formulario**: depende de que exista una
  Política de Privacidad publicada primero. Falta decidir dónde vivirá esa
  página (modal, como el resto de las ventanas del sitio, o una ruta propia)
  — es una decisión de UX/arquitectura, no solo de contenido.
- **Publicar las páginas legales** (`docs/legal/BORRADORES_LEGALES.md`):
  requiere completar los `[DATO REQUERIDO]` y decidir la forma de
  integrarlas al sitio.
- **Rate limiting en `/api/login`** (SEC-01): cambia el comportamiento del
  único punto de acceso del editor — probarlo con Emma antes de que quede en
  producción.
- **Revisar alcance de `EDITOR_GITHUB_TOKEN`** en GitHub (SEC-07): solo lo
  puede confirmar quien administra la cuenta de GitHub del repo.
- **Confirmar consentimiento** para el testimonio con handle de Instagram y
  para cada caso antes/después publicado.
- **Migración de Vite 5 → 8** para resolver el aviso MODERATE de
  `esbuild`: es un cambio mayor de tooling, merece su propio checkpoint y
  tiempo de prueba, no algo dentro de esta auditoría.

## Changes Requiring Legal Review

- Texto final de Política de Privacidad, Aviso Médico y Términos y
  Condiciones (`docs/legal/BORRADORES_LEGALES.md`) — son borradores
  tecnológicos, no textos listos para publicar.
- Determinación final de aplicabilidad de HIPAA a la práctica en EE.UU.
- Base legal y mecanismo de consentimiento para datos de salud que un
  visitante envíe voluntariamente por el formulario (RGPD art. 9, Ley
  25.326 datos sensibles).
- Confirmación de si Formspree requiere un DPA/BAA según la jurisdicción y
  el volumen de datos de salud que efectivamente se reciban.
- Responsable del tratamiento, domicilio legal y demás datos de identidad
  necesarios para publicar las políticas.

## Recommended Order

1. Confirmar con el cliente los datos legales faltantes (responsable del
   tratamiento, domicilio, email de privacidad) — sin esto no se puede
   avanzar con las páginas legales.
2. Decidir con el cliente dónde vivirán las páginas legales en el sitio
   (modal vs. ruta propia) y, recién con eso resuelto, agregar el checkbox
   de consentimiento al formulario.
3. Revisar con un abogado los tres borradores de `docs/legal/`.
4. Pedirle a Emma que pruebe el login del editor y confirme que la
   advertencia del formulario se ve bien en producción, en el mismo deploy
   donde se agrupen estos cambios.
5. Revisar el alcance real de `EDITOR_GITHUB_TOKEN` en GitHub.
6. Evaluar agregar rate limiting a `/api/login` como tarea aparte.
7. Agendar, sin apuro, la migración de Vite 5 → 8.

## Final Checklist

- [x] `git status` y `git log` revisados antes de empezar
- [x] Contexto maestro leído antes de auditar
- [x] Sin secretos impresos ni solicitados por chat
- [x] Sin cambios destructivos, sin push, sin deploy
- [x] `npm run build` verificado tras los cambios
- [x] Preview local verificado sin errores de consola para el cambio de UI
- [x] Ningún dato legal inventado — placeholders `[DATO REQUERIDO]` donde
      corresponde
- [x] Ninguna foto ni caso clínico modificado automáticamente
- [x] Lógica de censura (`esSensible`, `encuadre.json`) no tocada
- [ ] Pendiente: revisión jurídica de los borradores legales
- [ ] Pendiente: decisión del cliente sobre checkbox de consentimiento y
      ubicación de las páginas legales
- [ ] Pendiente: prueba de Emma en producción tras el próximo deploy
