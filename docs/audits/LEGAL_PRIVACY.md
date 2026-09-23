---
title: MDM Surgery — Legal / Privacy Audit
updated: 2026-09-22
parent: ../MDM_SURGERY_MASTER_AUDIT.md
---

# Legal / Privacy Audit — MDM Surgery

No soy abogado y esto no es asesoramiento legal. Es un análisis técnico de
exposición, pensado para que un abogado real lo revise más rápido. Ningún
dato de identidad legal (razón social, domicilio, CUIT/NIF/EIN, responsable
de tratamiento, DPO) fue inventado: donde falta, dice **[DATO REQUERIDO]**.

## 1. Qué procesa el sitio hoy (verificado en el repo)

| Dato | Dónde | Recolectado por |
|---|---|---|
| Nombre, email, mensaje libre, procedimiento de interés (opcional) | Formulario de contacto | Formspree (`https://formspree.io/f/xnpaaroa`) |
| Tema (claro/oscuro), idioma (es/en) | `localStorage` del navegador | Nadie — no sale del dispositivo |
| Pase de sesión del editor (`mdm-editor`) | `localStorage` | Nadie — no sale del dispositivo; ver [[Cybersecurity]] |
| Fotos de casos antes/después, nombres de pacientes en testimonios | Contenido estático del sitio (`src/data.js`, `src/assets/`) | Publicado por el propio equipo vía el editor |

**No hay cookies** (`document.cookie` no aparece en `src/`), **no hay
analytics, pixels, tag managers ni CMPs** (grep dedicado sin resultados), y
**no hay embeds de terceros** — los links a YouTube/Instagram son salida
(`target="_blank"`), no `<iframe>`. Esto simplifica mucho el punto 3 (cookies).

## 2. Argentina — Ley 25.326 de Protección de Datos Personales

- El formulario de contacto recolecta datos personales (nombre, email,
  mensaje) de titulares que pueden estar en Argentina. Aplica la ley.
- **Datos sensibles**: la ley 25.326 considera sensibles los datos de salud.
  El campo de mensaje libre permite que un visitante escriba información de
  salud por su cuenta (ver Forms/Formspree más abajo) — eso activa el régimen
  de datos sensibles si ocurre.
- **Consentimiento**: la ley exige consentimiento informado, expreso y por
  escrito para datos sensibles; para datos comunes, consentimiento informado
  (puede ser tácito en ciertos casos, pero lo prudente en un sitio médico es
  hacerlo explícito).
- **Falta hoy**: no hay Política de Privacidad, no hay checkbox de
  consentimiento en el formulario, no hay aviso de qué se hace con los datos
  ni durante cuánto tiempo.
- **Responsable del tratamiento**: [DATO REQUERIDO] — persona física/jurídica
  responsable (¿el Dr. Di Maggio a título personal? ¿una sociedad?).
- Estado: **[CONFIRMAR CON ABOGADO / CLIENTE]** sobre la forma societaria y el
  texto final de la política.

## 3. España / Unión Europea — RGPD y ePrivacy

- El sitio se dirige explícitamente a Madrid (sede declarada, licencia médica
  en España según `src/data.js`), así que puede recibir datos de personas en
  la UE. El RGPD aplica por el criterio de "oferta de bienes o servicios a
  personas en la UE" (art. 3.2), independientemente de dónde esté alojado el
  sitio.
- **Categoría especial de datos** (art. 9 RGPD): datos de salud. Igual que en
  Argentina, el campo libre del formulario puede convertir una consulta común
  en tratamiento de categoría especial si el visitante escribe síntomas o
  diagnóstico.
- **Base legal**: para gestionar la consulta comercial, "consentimiento" o
  "medidas precontractuales" (art. 6.1.b) son las bases más razonables; para
  datos de salud que el usuario mande por su cuenta, hace falta
  consentimiento explícito (art. 9.2.a) — motivo extra para la advertencia
  ya agregada en el formulario (ver Master Audit → Safe Changes) y para
  evaluar si conviene bloquear ese tipo de envío en vez de solo advertir.
- **ePrivacy / cookies**: como no hay cookies no esenciales ni tracking,
  **no hace falta banner de cookies ni CMP** bajo la Directiva ePrivacy. Si
  en el futuro se agrega analytics o un embed con cookies de terceros, esto
  cambia.
- **Encargado de tratamiento**: Formspree actúa como encargado (procesa datos
  por cuenta del responsable). Falta verificar si Formspree ofrece un DPA
  (Data Processing Agreement) y dónde aloja los datos (transferencia
  internacional si es fuera del EEE). [DATO REQUERIDO: plan de Formspree
  contratado y su política de subencargados/ubicación de datos — no es
  visible desde el repo, hay que revisarlo en la cuenta de Formspree.]
- **Derechos ARCO+ (acceso, rectificación, cancelación/supresión, oposición,
  portabilidad, limitación)**: hoy no hay ningún canal documentado para
  ejercerlos.
- **DPO**: probablemente no obligatorio para este volumen de datos (no hay
  tratamiento a gran escala de categorías especiales como actividad
  principal), pero **[CONFIRMAR CON ABOGADO]**.
- **Transferencias internacionales**: si Formspree aloja en EE.UU., aplica el
  marco de transferencias post-Schrems II (SCCs / Data Privacy Framework).
  **[CONFIRMAR CON ABOGADO Y CON FORMSPREE]**.

## 4. Estados Unidos / Nueva York

- El sitio declara sede y licencia médica en Nueva York, y menciona consultas
  frecuentes en San Diego, Los Ángeles y Chicago (`src/data.js`). Esto puede
  activar normativa estatal de privacidad si hay volumen de visitantes de
  esos estados (CCPA/CPRA para California, SHIELD Act para Nueva York en
  materia de seguridad de datos, entre otras).
- **HIPAA — determinación explícita, no asumir que aplica:**
  - HIPAA aplica a "entidades cubiertas" (proveedores de salud que transmiten
    información de salud electrónicamente en transacciones estandarizadas,
    como facturación a seguros) y a sus "asociados de negocio".
  - Un sitio de marketing/contacto por sí solo **no necesariamente** activa
    HIPAA: lo que importa es si el consultorio del Dr. Di Maggio, como
    entidad, ya es una entidad cubierta por su práctica clínica en EE.UU.
    (facturación electrónica a aseguradoras, por ejemplo) — eso es
    independiente del sitio web.
  - **Lo que sí importaría para el sitio**: si el formulario de contacto se
    usa como canal para transmitir PHI (Protected Health Information, ej.
    historia clínica, diagnóstico) entre paciente y consultorio de forma
    rutinaria, y el consultorio es una entidad cubierta, entonces Formspree
    pasaría a ser un "asociado de negocio" y haría falta un BAA (Business
    Associate Agreement) con Formspree — que Formspree probablemente no
    ofrece en sus planes estándar. [DATO REQUERIDO: confirmar con el cliente
    si la práctica en EE.UU. es entidad cubierta bajo HIPAA.]
  - Conclusión provisoria: **no hay evidencia en el repo de que el sitio en
    sí procese PHI de forma rutinaria** (el formulario es de consulta
    general, no un portal de pacientes), así que HIPAA probablemente no
    aplica al sitio web puntualmente — pero la advertencia agregada al
    formulario (no mandar datos médicos sensibles) reduce ese riesgo en vez
    de asumirlo resuelto. **[CONFIRMAR CON ABOGADO]**.
- **Marketing/CAN-SPAM, TCPA**: si en el futuro se agrega email marketing o
  SMS, aplican CAN-SPAM Act y TCPA respectivamente. Hoy no hay newsletter ni
  marketing automatizado detectado en el repo.

## 5. Cookies y consentimiento — conclusión

- **Inventario real**: cero cookies, cero trackers, cero embeds de terceros
  con cookies. Solo `localStorage` para tema/idioma/pase de sesión — ninguno
  de estos requiere consentimiento bajo ePrivacy (son estrictamente
  funcionales/técnicos, no de seguimiento).
- **Conclusión**: **no hace falta banner de cookies ni CMP hoy**. Agregar uno
  sería complejidad innecesaria para un problema que no existe. Si se agrega
  analytics, un mapa embebido, o un pixel de marketing en el futuro, este
  punto hay que revisarlo de nuevo antes de publicarlo.

## 6. Documentos legales — qué necesita este sitio

| Documento | Necesidad | Motivo | Jurisdicción | ¿Implementable ahora? |
|---|---|---|---|---|
| Política de Privacidad | **Necesario** | Hay formulario que recolecta datos personales en 3+ jurisdicciones con régimen de protección de datos | AR / UE / US | Borrador técnico sí (ver `docs/legal/`), texto final no sin abogado |
| Aviso/Disclaimer médico | **Necesario** | El sitio muestra resultados antes/después y hace claims de trayectoria — es estándar en sitios médicos aclarar que los resultados varían (el copy ya lo dice parcialmente, ver SEO/UX) y que el sitio no reemplaza una consulta médica | AR / UE / US | Sí, borrador técnico |
| Política de Cookies | **Opcional / no necesaria hoy** | No hay cookies no esenciales que gestionar | — | Si se implementa, que sea corta y honesta ("no usamos cookies de seguimiento") |
| Términos y Condiciones | Probablemente necesaria | Cubre uso del sitio, propiedad intelectual de fotos/contenido, limitación de responsabilidad | AR / UE / US | Sí, borrador técnico |
| Consentimiento de uso de imagen (fotos antes/después, testimonios) | **Necesario, pero es proceso clínico, no del sitio** | El sitio ya asume que las fotos publicadas tienen consentimiento del paciente (ver `src/data.js`, comentario sobre testimonios "todos reales") — lo que falta es documentar ese proceso, no agregar nada al código | AR / UE / US | No es un cambio de código — es un proceso del consultorio. **[CONFIRMAR CON CLIENTE]** que exista un consentimiento firmado por caso publicado |
| Consentimiento de marketing separado | Opcional | Solo aplica si se agrega newsletter/marketing por email en el futuro | UE (RGPD exige opt-in separado) | No aplica hoy |

## 7. Formspree — auditoría del formulario

- **Endpoint**: `https://formspree.io/f/xnpaaroa` (verificado en
  `src/App.jsx`).
- **Campos**: nombre, email, mensaje libre (hasta 800 caracteres), procedimiento
  de interés (opcional, de una lista fija), `_subject`, `_replyto`, honeypot
  `_gotcha`.
- **Riesgo del campo libre**: el usuario puede escribir lo que quiera,
  incluyendo síntomas, diagnóstico, historia clínica o datos de terceros. No
  hay validación de contenido (no debería haberla — sería invasivo filtrar
  texto médico). **En esta auditoría se agregó una advertencia visible** bajo
  el campo de mensaje, en ambos idiomas, pidiendo no incluir datos médicos
  sensibles ni información de terceros (ver Master Audit → Safe Changes).
  El texto es deliberadamente prudente ("por favor no incluyas..."), no una
  prohibición legal tajante.
- **Falta**: checkbox de consentimiento vinculado a una Política de
  Privacidad. No se agregó en esta pasada porque **no hay todavía una página
  de privacidad publicada a la que enlazar** — implementarlo ahora dejaría un
  checkbox que apunta a ningún lado. Ver Master Audit → Changes Requiring
  Client Confirmation.
- **Antibot**: honeypot + tiempo mínimo de llenado (`MIN_FILL_MS`) ya
  implementados y correctos — no se tocó.
- **Terceros involucrados**: solo Formspree recibe los datos del formulario.
  [DATO REQUERIDO: plan contratado de Formspree y su retención de datos —
  Formspree normalmente permite exportar/borrar submissions desde su panel.]

## 8. Fotos de pacientes, casos y testimonios — prioridad alta

- El código ya tiene una capa de censura por foto (`FOTOS_SENSIBLES`,
  `PROCEDIMIENTOS_SENSIBLES`, `esSensible()` en `src/data.js`, más
  `encuadre.json → censura` que puede pisarla desde el editor) — **no se
  tocó esta lógica**, solo se la documenta.
- **Testimonio real**: uno solo, con handle de Instagram público
  (`@maeru.jpg`) enlazado a un post real. Es información potencialmente
  identificable, pero la persona ya lo publicó ella misma en su cuenta
  pública — el riesgo es menor que publicar un dato privado, pero igual
  depende de que haya consentimiento para citarlo en el sitio.
  **[CONFIRMAR CON CLIENTE]** que exista ese consentimiento (aunque sea
  informal, vía DM).
- **Metadatos EXIF / nombres de archivo**: no se auditaron los binarios de
  `src/assets/procedimientos/` en esta pasada (sería una lectura masiva de
  ~610 fotos, fuera del presupuesto de esta auditoría). Recomendación: correr
  un chequeo puntual de EXIF sobre una muestra antes de cada tanda de fotos
  nuevas — los nombres de archivo (ej. `antes-1.webp`) ya son genéricos y no
  identifican al paciente.
- **Pendiente ya conocido** (`MDM_SURGERY_CONTEXT.md` §18-19): fotos
  quirúrgicas `antes-2q`/`despues-2q` de Tomás Bruno sin difuminar. Esto ya
  está resuelto técnicamente (el editor permite tapar foto por foto) — falta
  que alguien lo haga desde el editor. No es un cambio de código.
- **Menores**: no se encontró en el repo ninguna indicación de que haya
  fotos de menores de edad. **[CONFIRMAR CON CLIENTE]** como práctica general
  del consultorio.

## 9. Claims médicos / contenido

- El sitio afirma "uno de los equipos con más experiencia del mundo",
  licencias médicas en NY y España, certificaciones (con imagen del
  certificado enlazada) y papers científicos. La sección de certificados
  y papers ya enlaza a la imagen/documento fuente — eso es evidencia dentro
  del propio proyecto, no una afirmación sin respaldo.
- Frases más genéricas de posicionamiento ("resultados con una calidad y
  naturalidad únicas") son marketing habitual en este rubro, no una claim
  verificable — no se puede confirmar ni objetar desde el repo.
- **[REQUIERE VERIFICACIÓN DEL CLIENTE]**: vigencia actual de las licencias
  médicas mostradas (las imágenes de certificados no traen fecha de
  vencimiento visible en el repo).

## Checklist de datos faltantes (no inventados en esta auditoría)

- [ ] Responsable del tratamiento (persona física o sociedad) — AR/UE/US
- [ ] Domicilio legal / dirección de contacto para la Política de Privacidad
- [ ] CUIT / NIF / EIN si corresponde
- [ ] Email dedicado de privacidad (puede ser el mismo `info@mdmsurgery.com`
      — a decidir)
- [ ] Plan y ubicación de datos de Formspree (DPA, subencargados)
- [ ] Confirmación de si la práctica en EE.UU. es entidad cubierta por HIPAA
- [ ] Confirmación de consentimiento firmado por cada caso/testimonio publicado
- [ ] Vigencia de licencias médicas mostradas en certificados
