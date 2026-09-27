---
title: MDM Surgery — Pendientes legales
updated: 2026-09-23
LAST_LEGAL_REVIEW_REMINDER: 2026-09-23
---

# Pendientes legales — MDM Surgery

Solo lo que falta. Lo ya resuelto (Aviso Médico, Política de Cookies,
auditoría de privacidad/seguridad) vive en `docs/MDM_SURGERY_MASTER_AUDIT.md`
y `docs/audits/LEGAL_PRIVACY.md` — no se repite acá.

1. **Responsable legal del tratamiento** — persona física o sociedad titular
   del sitio/consultorio. [DATO REQUERIDO DEL CLIENTE]
2. **Domicilio legal** — para la Política de Privacidad y los Términos y
   Condiciones. [DATO REQUERIDO DEL CLIENTE]
3. **Email de privacidad** — puede ser `info@mdmsurgery.com` u otro; a
   decidir. [DECISIÓN DEL CLIENTE]
4. **Período de conservación de datos** del formulario de contacto.
   [DATO REQUERIDO DEL CLIENTE, posiblemente con abogado]
5. **Formspree**: plan contratado, ubicación de los datos, si ofrece DPA y
   quiénes son sus subencargados. [CONFIRMAR CON EL PROVEEDOR]
6. **HIPAA**: confirmar si la práctica del Dr. Di Maggio en EE.UU. es una
   entidad cubierta (facturación electrónica a aseguradoras, etc.) — el
   sitio en sí no muestra evidencia de procesar PHI de forma rutinaria, pero
   la determinación final depende de la práctica clínica, no del sitio web.
   [CONFIRMAR CON ABOGADO Y CLIENTE]
7. **Consentimiento de fotos, casos y testimonios**: cada foto de paciente
   publicada y cada testimonio citado debe tener autorización — hoy es un
   proceso del consultorio, no del sitio. El equipo debería poder mostrar
   ese consentimiento si se lo piden. Puntual: confirmar el consentimiento
   del testimonio con handle de Instagram (`@maeru.jpg`) para citarlo en el
   sitio. [CONFIRMAR CON EL CLIENTE — no requiere cambios de código]
8. **Revisar si hay algún otro dato legal requerido** que no esté listado
   acá, a medida que avance la implementación (ej. al completar Política de
   Privacidad y Términos con los datos de los puntos 1-4).
9. **Revisión final con abogado** de los 4 documentos (Privacidad, Aviso
   Médico, Términos, Cookies) antes o al momento de publicar los que faltan
   — Aviso Médico y Cookies ya están publicados en el sitio, pero ningún
   documento legal de este proyecto pasó por revisión jurídica profesional
   todavía.

## Qué depende de qué

- Política de Privacidad y Términos y Condiciones **no se pueden publicar**
  sin los puntos 1-4 (y 5 para Privacidad). El componente técnico
  (`LegalModal` en `src/App.jsx`, mismo mecanismo que Aviso Médico/Cookies)
  ya soporta ambos — falta el contenido en `src/i18n.js` (`legal.privacy`,
  `legal.terms`) y su botón en el pie de página. Ver comentarios en
  `src/App.jsx` (cerca de `legalOpen`) y `src/i18n.js` (cerca de `legal:`).
- El **checkbox de consentimiento** en el formulario de contacto depende de
  que la Política de Privacidad esté publicada — no se implementa antes.
- Nada de esto bloquea lo que ya está publicado (Aviso Médico, Cookies) ni
  requiere tocar el editor, las fotos o la censura.
