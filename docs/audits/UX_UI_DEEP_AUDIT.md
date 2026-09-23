---
title: MDM Surgery — Deep UX/UI Audit
updated: 2026-09-22
based_on_commit: cc58786 (+ working tree del hardening del 2026-09-22)
scope: Exclusivamente UX/UI, dirección de arte y accesibilidad visual. Legal, privacidad, ciberseguridad, SEO y frontend general ya están en docs/MDM_SURGERY_MASTER_AUDIT.md — no se repiten acá salvo cruce directo con UX.
method: Inspección visual real en preview local (npm run dev), no solo lectura de código. Desktop 1440×900, mobile 375×812, light y dark, ES y EN.
---

# MDM Surgery — Deep UX/UI Audit

No se cambió nada en esta pasada (colores, tipografías, layout, componentes,
textos, animaciones, spacing) salvo lo que ya estaba aprobado en la auditoría
anterior. Esto es diagnóstico puro.

## Executive Summary

La dirección de arte de MDM Surgery ya está muy bien resuelta: la combinación
Playfair Display / Inter / Cormorant Garamond / Sacramento, la paleta
serena, el modo oscuro (no es una simple inversión — tiene su propia
jerarquía y tono) y el wordmark superpuesto "MDM / MARCELO DI MAGGIO" en el
hero son decisiones de nivel editorial que ya transmiten lo que el proyecto
busca. No encontré nada que rompa la elegancia general ni elementos
decorativos de sobra. Los problemas reales son puntuales y localizados, no
sistémicos:

1. **El botón flotante de contacto (mobile) tapa texto real** en la sección
   "Qué hacemos" — el único hallazgo P0 de esta auditoría.
2. Las tarjetas de "Sedes" quedan con alturas dispareja entre sí (Argentina
   con dos ciudades vs. España/EE.UU. con una), lo que rompe ligeramente el
   ritmo de grilla.
3. Los bordes de inputs del formulario (`--line`) tienen muy poco contraste
   contra el fondo — no es un problema de texto, pero sí de "dónde está el
   campo" para baja visión.
4. El resto son detalles de *pixel polish* (P2/P3): el listón que corta el
   wordmark del hero a la altura de la "D", la descripción de las tarjetas de
   procedimientos que corta la frase a mitad ("...para redefinir el…") en
   ambos idiomas por igual.

No encontré nada bilingüe que rompa el layout (ES/EN) — los textos más
largos en inglés no desbordan ni deforman componentes, porque las tarjetas ya
truncan con el mismo criterio en ambos idiomas.

## Current Experience

Recorrido real hecho como visitante (no como editor) en `npm run dev`
(nota: en dev, `puedeEditar` es `true` por defecto — dos botones flotantes
extra, "Entrar al editor" y el ícono de nube de publicar, aparecen en pantalla
que **no existen para un visitante público sin sesión**; se excluyeron de los
hallazgos por no ser UX real de cara al usuario final).

El recorrido "Descubrir → doctor → especialidades → resultados → confianza →
ubicaciones → contacto" **sí ocurre de forma natural**: el nav lateral fijo
en desktop mantiene siempre visible el camino completo, y el CTA del hero
("Solicitar consulta privada") + el FAB persistente de contacto le dan salida
al usuario en cualquier punto del scroll sin ser agresivos (un solo tono de
color, sin parpadeo, sin popups invasivos).

## Brand / Art Direction

**Funciona bien, sin cambios sugeridos:**

- El hero con video de fondo (mármol, pinzas de precisión, texturas de piel)
  en loop, oscurecido con una máscara de degradé, evita la estética de
  "clínica genérica" — no hay foto de quirófano ni bata blanca de stock.
- El wordmark superpuesto (letras gigantes "MDM" en outline con "MARCELO DI
  MAGGIO" en una banda sólida que corta a través) es un recurso tipográfico
  editorial fuerte, coherente en claro y oscuro. No es un bug — es
  intencional y funciona.
- El uso de framing/marcos finos alrededor de fotos (doctor, casos) da
  sensación de precisión sin caer en "luxury" excesivo.
- Watermark "MDM MARCELO DI MAGGIO" sobre las fotos de casos: tamaño y
  opacidad correctos — protege el contenido sin robarle protagonismo a la
  foto clínica.

**Detalle a revisar (P3, subjetivo):** la banda que lleva "MARCELO DI MAGGIO"
corta el trazo de la "D" gigante del fondo casi por la mitad de su curva, lo
que hace que esa letra se lea menos como "D" y más como dos trazos verticales
al primer vistazo. Es un efecto secundario del mismo recurso que funciona
bien en el resto — no amerita rediseñar el hero, solo ajustar unos px la
altura de la banda si en algún momento se retoca esa sección.

## Visual Hierarchy

El usuario entiende, en orden, quién es el doctor (hero + sección "MDM &
Equipo" con credenciales listadas con íconos), qué hace (sección "Qué
hacemos" con 4 líneas de especialidad), por qué confiar (certificados,
papers, entrevistas — todos con evidencia enlazada, no solo texto), qué
procedimientos realiza (rail de Procedimientos con duración/recuperación) y
dónde (Sedes) — la secuencia de secciones en el nav ya sigue exactamente ese
orden. Ningún heading compite en tamaño con el que le sigue; la eyebrow en
mayúsculas pequeñas + título serif grande es un patrón consistente en las 9
secciones.

## Typography

Sin problemas de legibilidad en texto largo (line-height generoso en
párrafos de body). La combinación serif (Playfair para títulos, Cormorant
para el slogan cursivo-itálico) / sans (Inter para UI y body) está aplicada
de forma consistente — no encontré un lugar donde se mezclen fuera de este
patrón. Sacramento se usa solo para el loader y el wordmark del hero, nunca
en texto funcional (correcto, es ilegible en tamaños chicos).

**Nota real, no bilingüe:** en las tarjetas de Procedimientos, la
descripción larga se corta con "…" a las 2 líneas — pasa **igual en español
que en inglés** (verificado: "para redefinir el…" / "to redefine…" ambos
cortan a mitad de frase). No es un bug de traducción, es el mismo
line-clamp aplicado por igual — pero corta antes de completar la idea en
ambos casos. Polish menor (P3): si se quiere resolver, alcanza con acortar
la oración original en `data.js`, no con tocar el componente.

## Layout / Grid / Spacing

- El ancho de columna de texto en secciones de body largo (Areas, Team) se
  mantiene en un rango cómodo de lectura (`max-w`), no hay líneas
  demasiado largas ni en desktop grande.
- **Sedes (Locations), desktop:** la grilla de 3 columnas (Argentina /
  España / Estados Unidos) no fuerza igual altura entre tarjetas. Argentina
  tiene dos sub-bloques (Buenos Aires + Córdoba) y termina bastante más abajo
  que España y Estados Unidos, que tienen uno solo. El resultado es una fila
  con bordes inferiores en tres alturas distintas — no rompe la lectura, pero
  sí el ritmo de grilla que el resto del sitio mantiene con cuidado.
  — *Sección: Locations · Viewport: desktop 1440px · Archivo:
  `src/App.jsx` (bloque `LOCATIONS`/`SEDES`, componente de la sección
  "Dónde trabajamos").*

## Desktop

- No se detectó sensación de "pantalla vacía" ni exceso de whitespace
  desperdiciado en 1440px — el hero usa el ancho completo con el video de
  fondo, y las secciones con texto respetan un ancho de columna cómodo sin
  dejar el resto de la pantalla en blanco (queda ocupado por foto/ilustración
  de fondo en la mayoría de los casos).
- Notebooks de poca altura: el contexto ya documenta un ajuste por
  `@media (max-height: 850px)` para las cards de Resultados — no se volvió a
  auditar a fondo por estar ya resuelto y no observarse regresión visual en
  esta pasada.

## Mobile

**P0 — El FAB de contacto tapa texto real en "Qué hacemos".**

En 375×812, con el scroll detenido en la sección Areas, el botón flotante de
contacto (ícono de sobre, fixed bottom-right) se superpone directamente sobre
la última línea del texto "Remodelación de las estructuras faciales como
conjunto" — la palabra "faciales" queda parcial u totalmente tapada detrás
del círculo del botón. Confirmado con captura y zoom: el texto real, no un
artefacto de scroll. — *Sección: Areas ("Qué hacemos") · Viewport: mobile
375px · Elemento: FAB de contacto (ícono sobre) · Archivo: `src/App.jsx`
(FAB de contacto, posición `fixed bottom-6 right-6` o similar; lista de
`AREAS`/ítems de la sección Areas).*

Por qué importa: en un sitio donde "nada puede fallar en silencio" es
principio de proyecto, un botón que tapa contenido real (no solo decorativo)
es la versión visual de ese mismo problema — el usuario pierde información
sin ningún aviso.

Recomendación: agregar padding-bottom al último ítem de la lista de Areas (o
a la lista completa) del tamaño del FAB + margen, o reducir el "safe scroll
padding" que ya exista para otros elementos flotantes. Esfuerzo bajo, cambio
aislado a una sola sección.

¿Seguro modificar?: Sí, es un ajuste de espaciado local, no toca el editor,
`data.js` ni ningún punto frágil documentado en `MDM_SURGERY_CONTEXT.md` §25.

**P1 — El mismo FAB se superpone a la fila de tabs "CASO 01/02/03" en
Resultados (mobile).**

La fila horizontal de tabs de caso (con su propio affordance de "»  Deslizá
para ver más", que ya funciona bien) queda con el FAB de contacto encimado
sobre el borde derecho, exactamente donde estaría el próximo tab visible
parcialmente. No tapa texto crítico, pero sí puede interferir con el gesto
de swipe/tap en esa zona para un dedo que arranca el gesto ahí. — *Sección:
Resultados · Viewport: mobile 375px.*

**Confirmado correcto, sin cambios:** el menú mobile (drawer lateral con
overlay), el acordeón de submenús (MDM & Equipo, Trayectoria & Prensa), y el
swipe horizontal de fotos "Más fotos de este caso" — todos con touch targets
de tamaño razonable y feedback visual claro.

## Dark Mode

Aprobado — no es "la misma web con los colores invertidos". Verificado
programáticamente (no solo visual): los tokens de `src/index.css` en modo
oscuro (`--bg #15181A`, `--ink #ECEEEF`, `--muted #9AA2A7`, `--faint
#858D92`, `--accent #8FA8BE`) dan contraste de texto normal de 5.28:1 a
15.32:1 contra el fondo — todos pasan WCAG AA (mínimo 4.5:1) con margen. El
hero en oscuro usa una máscara más profunda sobre el video que en claro,
manteniendo el tono editorial en vez de solo "atenuar el brillo". Las tarjetas
del formulario de contacto tienen su propia superficie (`--surface`) con
borde sutil, no quedan flotando sin límite visual sobre el fondo.

## Bilingual UX

No se encontraron desbordes de layout, botones que cambien de tamaño de
forma que rompa la grilla, ni headings que partan mal la línea al pasar de
ES a EN, en ninguna de las secciones inspeccionadas (Hero, Areas,
Procedimientos, nav, footer). El único efecto de la diferencia de longitud
de texto es el truncado ya descripto en Typography, que es simétrico entre
idiomas — no es un problema bilingüe real.

## Navigation

El nav lateral fijo (desktop) marca la sección activa con un subrayado corto
bajo el label — sutil y correcto, sin necesidad de resaltar con color de
fondo. Los submenús (MDM & Equipo, Trayectoria & Prensa) se expanden inline
sin superponerse a nada. En mobile, el drawer dimmea el fondo sin taparlo
del todo — permite ubicarse sin cerrar el menú primero. No se encontraron
problemas de navegación.

## Conversion / User Journey

Sin fricción evidente. El único punto muerto real: la sección Testimonios
tiene un solo testimonio real más una tarjeta "Próximamente" del mismo
tamaño — ya está resuelto con buen criterio (no se infla con testimonios
falsos, decisión ya documentada como intencional en el Master Audit). No se
propone ningún cambio ahí porque es una decisión de contenido, no de UX.

## Forms

- Orden de campos (Nombre/Email → Procedimiento opcional → Mensaje) es
  lógico y progresivo.
- La nota anti-datos-sensibles agregada en la auditoría anterior se integra
  visualmente bien — mismo tratamiento tipográfico que el resto de las notas
  del formulario, no compite ni se siente "pegada".
- Estados de envío (`Enviando…`, error visible en rojo suave `#E0908D`,
  modal de verificación de email antes de enviar, modal de confirmación de
  envío) cumplen el principio de "nada falla en silencio" — cada estado
  posible tiene feedback visible.
- **Hallazgo real (no repetido del Master Audit):** los bordes de los campos
  (`input`, `select`, `textarea`) usan el token `--line`. Medido:
  `#E3E5E7` sobre fondo blanco `#FFFFFF` = **contraste 1.26:1**. Muy por
  debajo del umbral de WCAG 1.4.11 (3:1) para distinguir el límite de un
  componente interactivo en su estado de reposo (no enfocado). El estado de
  foco sí tiene un contorno de acento visible y correcto — el problema es
  solo "encontrar" el campo antes de tocarlo, relevante para baja visión.
  — *Archivo: `src/index.css` (`--line`), aplicado en los inputs de
  `src/App.jsx` (formulario de contacto).*

## Accessibility

- Contraste de texto: aprobado en ambos temas (ver cálculos en Dark Mode;
  en claro, `--faint` da 5.17:1, `--muted` 6.10:1, `--ink` 15.71:1, `--accent`
  8.09:1 — todos sobre AA).
- Foco visible: `outline: 2px solid var(--accent)` global en
  `src/index.css`, no removido — correcto, confirmado en código (ya estaba
  en el Master Audit, se reconfirma acá desde el ángulo visual).
- `alt` en imágenes: correcto (decorativas vacías + `aria-hidden`,
  informativas con texto real) — confirmado en el Master Audit, sin cambios
  desde entonces.
- **Nuevo hallazgo:** contraste de borde de inputs por debajo de 3:1 (ver
  Forms arriba) — único hallazgo de accesibilidad visual nuevo de esta
  pasada.
- No se corrió Lighthouse/axe como herramienta separada: el entorno de
  navegador de esta sesión no tiene esas extensiones instaladas y agregar una
  herramienta nueva solo para esta auditoría no se justificaba por el
  presupuesto de la tarea — en su lugar, se midió contraste real de forma
  programática (ver método arriba), que cubre el hallazgo más común que
  Lighthouse reportaría.

## Microinteractions

Las animaciones de entrada (fade/slide al hacer scroll) son breves y no se
sienten "impresionantes por impresionar" — consistente con el objetivo de
"lujo sereno". `prefers-reduced-motion` ya está respetado (confirmado en el
Master Audit). Hover states en botones y links son sutiles (cambio de
opacidad/color, sin scale exagerado salvo `active:scale-90/95` en toques,
que es un patrón táctil correcto para mobile). No se encontró ninguna
animación que convenga reducir o eliminar.

## Pixel Polish

1. Banda del wordmark del hero corta la "D" gigante a mitad de curva (ver
   Brand/Art Direction) — P3.
2. Descripciones de tarjetas de Procedimientos truncadas a mitad de oración
   en ambos idiomas (ver Typography) — P3.
3. Tarjetas de Sedes con altura dispareja en la fila de 3 columnas (ver
   Layout) — P2.
4. Borde de inputs de formulario con contraste 1.26:1 en reposo (ver Forms
   / Accessibility) — P2.
5. FABs flotantes (contacto, y en dev también el de publicar) se posicionan
   sin padding de seguridad respecto al contenido que puede quedar debajo en
   mobile (ver Mobile P0/P1) — P0/P1.

No se encontraron inconsistencias de radios de borde, sombras, o pesos de
ícono entre componentes — el sistema visual (botones, links, cards,
headings) es coherente en todas las secciones recorridas.

## Component Consistency

Botones primarios (fondo `--accent`), secundarios (borde, fondo
transparente) y terciarios (solo texto/ícono) se usan de forma consistente
según jerarquía de acción en las 9 secciones — no hay un botón "primario"
compitiendo con otro en la misma vista. Cards de Procedimientos, Resultados
y Team comparten el mismo lenguaje de borde fino + spacing interno. Iconos
(lucide-react + set propio) mantienen el mismo grosor de trazo
(`strokeWidth` consistente) donde se pudo verificar visualmente.

## Problems

Resumen consolidado — ver Priority Matrix para el detalle completo con
formato ID/Severidad/Evidencia.

- P0: FAB de contacto tapa texto en Areas (mobile).
- P1: FAB de contacto interfiere con la fila de tabs de casos en Resultados
  (mobile).
- P2: Tarjetas de Sedes con altura despareja (desktop).
- P2: Contraste insuficiente en bordes de inputs del formulario (ambos
  temas, más notorio en claro).
- P3: Banda del wordmark corta la "D" del hero.
- P3: Truncado de descripciones de Procedimientos a mitad de oración.

## Recommendations

Ver cada hallazgo en Priority Matrix para la recomendación puntual. En
términos generales: **no tocar nada de la dirección de arte ya definida** —
los cambios sugeridos son de espaciado/contraste local, no de rediseño.

## Priority Matrix

**Estado de implementación (2026-09-22):** UX-01, UX-02, UX-04, UX-03 y UX-06
implementados y verificados (build + preview mobile/desktop). UX-05 queda
como polish opcional, sin tocar el hero.

### UX-01 — FAB de contacto tapa texto en la sección Areas (mobile) — ✅ IMPLEMENTADO

- **Prioridad:** P0
- **Sección:** Areas / Qué hacemos
- **Problema:** El botón flotante de contacto (fixed, bottom-right) se
  superpone sobre la última línea de la descripción del último ítem
  visible de la lista ("Remodelación de las estructuras faciales como
  conjunto"), tapando parcialmente la palabra final.
- **Evidencia:** Captura + zoom en mobile 375×812, tema oscuro y claro
  (reproducible en ambos). Confirmado que el texto real del DOM incluye la
  palabra completa — el recorte es puramente visual por superposición del
  FAB.
- **Por qué importa:** Contenido real oculto sin aviso — contradice el
  principio de proyecto "nada puede fallar en silencio" aplicado a UX, no
  solo a errores de sistema.
- **Recomendación:** Agregar `padding-bottom` (o `scroll-margin`) al
  contenedor de la lista de Areas equivalente al tamaño del FAB + su margen
  de seguridad, para que ningún ítem termine exactamente debajo de él.
- **Impacto UX:** Alto — afecta a todo visitante mobile que lea esa sección
  hasta el final.
- **Esfuerzo estimado:** Bajo (ajuste de spacing en un contenedor).
- **Archivo/componente:** `src/App.jsx` — sección Areas y el FAB de
  contacto (botón flotante con `mailto`/scroll a Contacto).
- **¿Seguro modificar?:** Sí.

### UX-02 — FAB de contacto se superpone a los tabs de caso en Resultados (mobile) — ✅ IMPLEMENTADO

- **Prioridad:** P1
- **Sección:** Resultados
- **Problema:** El mismo FAB queda posicionado sobre el borde derecho de la
  fila de tabs "CASO 01/02/03…", en la zona donde el usuario deslizaría para
  ver más casos.
- **Evidencia:** Captura mobile 375×812, sección Resultados, tema oscuro.
- **Por qué importa:** Puede interferir con el gesto de swipe/tap en esa
  franja, aunque no tapa texto crítico (la fila ya tiene su propio affordance
  de "deslizá para ver más").
- **Recomendación:** Mismo criterio que UX-01 — reservar un margen inferior
  o lateral en esa fila específica, o evaluar si el FAB debería ocultarse
  temporalmente dentro de las zonas de interacción por swipe (más esfuerzo,
  no imprescindible).
- **Impacto UX:** Medio.
- **Esfuerzo estimado:** Bajo a medio.
- **Archivo/componente:** `src/App.jsx` — sección Resultados, fila de tabs
  de caso.
- **¿Seguro modificar?:** Sí, siempre que no se toque la lógica de
  `esSensible`/`encuadre.json` ni el drag-to-reorder del editor.

### UX-03 — Tarjetas de Sedes con altura despareja (desktop) — ✅ IMPLEMENTADO (Opción B)

- **Prioridad:** P2
- **Sección:** Locations / Sedes
- **Problema:** En la grilla de 3 columnas, la tarjeta de Argentina (dos
  ciudades) termina visualmente mucho más abajo que España y Estados Unidos
  (una ciudad cada una), rompiendo el alineado inferior de la fila.
- **Evidencia:** Captura desktop 1440px, sección Sedes — bordes inferiores
  de las tres tarjetas en alturas distintas.
- **Por qué importa:** Es el único lugar del sitio donde una grilla de
  tarjetas no respeta una altura de fila coherente; visualmente se siente
  "apenas desalineado" más que roto.
- **Recomendación:** Evaluar `align-items: stretch` con altura mínima
  compartida, o mover cada ciudad a su propia tarjeta individual (Buenos
  Aires y Córdoba como dos tarjetas separadas en vez de una tarjeta-país con
  sub-bloques) para que las 4 tarjetas resultantes se acomoden más parejo en
  una grilla de 2×2 o 4 columnas. Es una decisión de layout, no solo CSS.
- **Impacto UX:** Bajo-medio (percepción de pulido, no de función).
- **Esfuerzo estimado:** Medio (puede implicar reestructurar el componente,
  no solo spacing).
- **Archivo/componente:** `src/App.jsx` — sección Locations,
  `src/data.js` — `LOCATIONS`.
- **¿Seguro modificar?:** Sí, es contenido/presentación, no toca datos
  sensibles ni el editor.

### UX-04 — Contraste insuficiente en bordes de inputs del formulario — ✅ IMPLEMENTADO

- **Prioridad:** P2
- **Sección:** Contact (formulario)
- **Problema:** El borde de `input`/`select`/`textarea` usa `--line`, que
  da un contraste de 1.26:1 contra el fondo en modo claro (por debajo del
  3:1 que pide WCAG 1.4.11 para límites de componentes interactivos en
  reposo).
- **Evidencia:** Medido programáticamente: `--line #E3E5E7` sobre
  `--bg #FFFFFF` = 1.26:1 (fórmula de contraste WCAG estándar, cálculo
  hecho en esta sesión).
- **Por qué importa:** Un usuario con baja visión puede no distinguir dónde
  empieza y termina un campo del formulario antes de hacer foco en él —
  el estado de foco sí es accesible, el de reposo no.
- **Recomendación:** Subir levemente el contraste del borde de campos de
  formulario específicamente (no de todos los usos de `--line`, que
  funciona bien como divisor decorativo) — un tono más oscuro solo para
  `border` de inputs, o agregar `background` sutil distinto del fondo de
  página.
- **Impacto UX:** Medio para usuarios con baja visión; imperceptible para
  el resto.
- **Esfuerzo estimado:** Bajo (una regla CSS).
- **Archivo/componente:** `src/index.css` (token `--line`),
  `src/App.jsx` (clases de los inputs del formulario de contacto).
- **¿Seguro modificar?:** Sí, con cuidado de no afectar el resto de los
  usos de `--line` como divisor entre secciones (donde el contraste bajo
  es intencional y correcto).

### UX-05 — Wordmark del hero corta la "D" a mitad de curva — ⏸ POLISH OPCIONAL, SIN TOCAR

- **Prioridad:** P3
- **Sección:** Hero
- **Problema:** La banda sólida que lleva "MARCELO DI MAGGIO" cruza el
  trazo curvo de la "D" gigante de fondo casi por su punto medio, haciendo
  que se lea menos como "D" a primer vistazo.
- **Evidencia:** Captura desktop 1440px, hero, ambos temas.
- **Por qué importa:** Es un detalle de nivel "premium vs. bueno" — no
  rompe la comprensión (el usuario igual lee "MDM"), pero un ajuste fino de
  1-2 líneas de base mejoraría la lectura de la letra.
- **Recomendación:** Si en algún momento se retoca el hero, mover la banda
  unos px para que corte por debajo del punto medio de la curva de la "D",
  o por encima de su arranque.
- **Impacto UX:** Bajo.
- **Esfuerzo estimado:** Bajo, pero no aislado — toca un componente ya
  documentado como delicado (loader/wordmark en `MDM_SURGERY_CONTEXT.md`
  §8). Solo abordar si se hace junto con otro cambio al hero.
- **Archivo/componente:** `src/App.jsx` (wordmark del hero).
- **¿Seguro modificar?:** Con cuidado — es una de las zonas marcadas como
  "no tocar sin releer el comentario del código" en el contexto maestro.

### UX-06 — Descripciones de Procedimientos truncadas a mitad de oración — ✅ IMPLEMENTADO

- **Prioridad:** P3
- **Sección:** Procedures
- **Problema:** El line-clamp de la descripción corta antes de terminar la
  idea ("para redefinir el…" / "to redefine…"), igual en ambos idiomas.
- **Evidencia:** Capturas mobile ES y EN, tarjeta "Hilos Tensores"/"Tensor
  Threads".
- **Por qué importa:** No es un bug de bilingüismo (pasa igual en los dos
  idiomas), pero dejar una frase a medias en una tarjeta que vende un
  procedimiento médico se siente descuidado en un sitio que se define como
  editorial y preciso.
- **Recomendación:** Acortar la oración fuente en `src/data.js` para que
  cierre una idea completa dentro de las 2 líneas visibles, en vez de tocar
  el componente de truncado.
- **Impacto UX:** Bajo.
- **Esfuerzo estimado:** Bajo (edición de copy, no de código de layout).
- **Archivo/componente:** `src/data.js` (descripciones de `PROCEDURES`).
- **¿Seguro modificar?:** Sí, es contenido, no lógica — pero es contenido
  médico, así que cualquier reescritura de la frase debería pasar por quien
  aprueba el copy, no solo por criterio de diseño.

## Suggested Next Implementation Pass

Orden sugerido si Emma aprueba avanzar, de menor a mayor esfuerzo/riesgo:

1. UX-04 (contraste de borde de inputs) — CSS aislado, cero riesgo.
2. UX-01 (padding bajo la lista de Areas) — spacing aislado, bajo riesgo.
3. UX-02 (margen en la fila de tabs de Resultados) — spacing aislado, pero
   cerca de la zona de swipe del editor: probar en mobile real antes de
   dar por cerrado.
4. UX-06 (acortar copy de Procedimientos) — requiere aprobación de
   contenido, no solo de diseño.
5. UX-03 (rediseño de tarjetas de Sedes) — el único cambio que toca
   estructura de componente, no solo spacing; conviene agendarlo aparte.
6. UX-05 (ajuste del wordmark del hero) — solo si se retoca el hero por
   otro motivo; no vale la pena abrir esa zona solo por este detalle.

Ninguno de estos cambios toca el editor remoto, `encuadre.json`, la lógica
de censura (`esSensible`), ni los puntos frágiles de `MDM_SURGERY_CONTEXT.md`
§25 (salvo UX-05, señalado explícitamente arriba).

## Implementación 2026-09-22 — UX-01, UX-02, UX-04

Implementados, con `npm run build` limpio y verificación visual en preview
local (mobile 375×812 confirmado con captura; desktop 1280px confirmado por
inspección de estilos computados vía consola, ya que el panel de preview
dejó de renderizar capturas durante esta sesión — sin relación con el
código, confirmado sin errores de consola).

- **UX-01**: `src/App.jsx` — el contenedor de la lista de Areas
  (`<motion.div className="mt-12 border-t border-[var(--line)] ...">`) suma
  `pb-20 sm:pb-0`. En mobile deja ~80px de aire después del último ítem para
  que no quede debajo del FAB de contacto; en `sm+` no cambia nada
  (verificado: `padding-bottom` computado = `0px` a 1280px de ancho).
- **UX-02**: `src/App.jsx` — el contenedor de la fila de tabs de caso en
  Resultados suma `pr-14 sm:pr-0`. En mobile reserva ~56px a la derecha para
  que el último "pill" visible no quede tapado por el FAB; en `sm+` no
  cambia nada.
- **UX-04**: nuevo token `--field-line` en `src/index.css` (`#7D8285` en
  claro, contraste 3.89:1 vs. blanco; `#6B727A` en oscuro, 3.66:1 vs. fondo
  — ambos por encima del 3:1 de WCAG 1.4.11), aplicado a los 4 controles del
  formulario de contacto en `src/App.jsx` (nombre, email, select de
  procedimiento, mensaje). El resto de los usos de `--line` como divisor no
  se tocó.
- **Dependencia también actualizada en esta pasada:** `npm audit fix`
  (`package-lock.json`) — sin relación con UX, arrastrada del hardening
  anterior, no generó cambios nuevos acá.

**Observación nueva, no solicitada, no implementada:** con el padding de
UX-01 ya puesto, en mobile el FAB pasa a superponerse levemente al primer
ítem del bloque "Los paquetes estéticos pueden incluir" (el que sigue
después de Areas) en vez de al último ítem de Areas. Es el mismo problema
de fondo (un FAB `fixed` sobre contenido que fluye libremente) apareciendo
un bloque más abajo — no es específico de Areas, sino de cualquier sección
mobile que termine cerca de esa franja de la pantalla. No se tocó porque
excede el alcance de UX-01/02 tal como se aprobaron; queda anotado para
evaluar una solución de fondo (por ejemplo, un `scroll-margin`/safe-area
reservado a nivel de página en vez de por sección) si se decide encarar esto
de forma más general.

## Implementación 2026-09-22 (continuación) — UX-03 y UX-06

Emma eligió la Opción B para Sedes y planteó un riesgo real no cubierto por
la propuesta original: "Córdoba" existe tanto en Argentina como en España,
así que separar por ciudad sin más podía generar la misma ambigüedad que se
buscaba resolver. Solución acordada: cada tarjeta lleva el país en el propio
título ("Ciudad, País"), no como subtítulo aparte — así la lectura de una
sola tarjeta, sin ver las demás, nunca es ambigua.

- **UX-03**: `src/App.jsx`, sección Locations. Se aplanó `LOCATIONS` a nivel
  ciudad (`flatMap`) y la grilla pasó de 3 tarjetas por país
  (`md:grid-cols-3`) a 4 tarjetas por ciudad (`sm:grid-cols-2 lg:grid-cols-4`,
  con `items-stretch`). Cada tarjeta titula `{ciudad}, {país}` (ej. "Córdoba,
  Argentina", "Madrid, España"). Verificado en el DOM (accesibilidad) y por
  captura mobile: los 4 títulos completos aparecen correctos, sin
  ambigüedad, sin desbordes de texto en ES ni riesgo evidente en EN ("New
  York, United States").
- **UX-06**: `src/data.js`, `PROCEDURES → tensor-threads`. Descripción
  acortada en ES y EN (aprobado por Emma) para que entre en las 2 líneas
  visibles sin cortar la idea a la mitad.

### UX-03 — Dos opciones de estructura para Sedes (propuesta original)

**Opción A — Igualar alturas sin cambiar la estructura actual.**
Se mantienen las 3 tarjetas por país (Argentina con 2 ciudades adentro,
España y Estados Unidos con 1 cada una). Se agrega `items-stretch` a la
grilla para que las 3 tarjetas midan lo mismo que la más alta (Argentina).
Visualmente: España y Estados Unidos quedan con más aire interno debajo de
su única ciudad, pero los 3 bordes inferiores terminan alineados. Cambio
mínimo (una clase CSS), no toca `data.js`. Contra: el aire de más en 2 de
las 3 tarjetas puede leerse como espacio vacío sin motivo, no resuelve la
causa (asimetría de contenido), solo la disimula.

**Opción B — Una tarjeta por ciudad, no por país.**
Buenos Aires, Córdoba, Madrid y Nueva York pasan a ser 4 tarjetas
individuales (cada una con su propio país como subtítulo chico), en una
grilla de 4 columnas en desktop (2×2 si se prefiere más aire) en vez de 3.
Visualmente: las 4 tarjetas miden lo mismo de forma natural, porque cada una
tiene la misma cantidad de contenido (un párrafo). Contra: cambia la
agrupación visual actual (hoy el país agrupa sus ciudades; con esto cada
ciudad queda suelta) y toca la estructura del componente, no solo el CSS —
más trabajo, pero también más prolijo a futuro si se suma una ciudad nueva.

**Recomendación, sin decidir por vos:** si el objetivo es un ajuste rápido y
de bajo riesgo, Opción A. Si hay margen para tocar un poco más y la
prioridad es que se vea igual de bien si mañana se agrega o quita una
ciudad, Opción B envejece mejor. Decime cuál preferís (o pedime un mockup
visual con el Artifact tool si querés verlo renderizado antes de elegir) y
lo implemento en el próximo paso.

### UX-06 — Copy propuesto para "Hilos Tensores" / "Tensor Threads"

Es el único caso verificado con evidencia (captura) en esta auditoría; el
mismo recorte a 2 líneas puede afectar a otras descripciones de
`PROCEDURES` si son igual de largas, pero no se relevaron una por una —
avisar si se quiere una revisión completa de las 16.

**Texto actual (se corta en pantalla):**
- ES: "Reposición de los tejidos del rostro mediante hilos, sin cirugía
  abierta, para redefinir el contorno."
- EN: "Repositioning of the facial tissues with threads, without open
  surgery, to redefine the contour."

**Propuesta (recorta la cláusula final, que es justo la que se pierde hoy;
el beneficio de "efecto lifting sutil" ya está en el campo `who` de abajo,
así que no se pierde información nueva):**
- ES: "Reposición de los tejidos del rostro mediante hilos, sin necesidad de
  cirugía abierta."
- EN: "Repositioning of facial tissues with threads, without the need for
  open surgery."

**REQUIERE APROBACIÓN DE COPY MÉDICO — no aplicado.** Si preferís conservar
la mención a "redefinir el contorno" en vez de recortarla, es una frase más
larga y habría que acortar en otro lado (por ejemplo, el nombre del
procedimiento ya lo sugiere) — puedo proponer una segunda variante si esta
no convence.
