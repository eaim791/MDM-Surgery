# Política de seguridad

## Cómo avisar de un problema

Si encontrás una falla de seguridad en https://mdmsurgery.com (o en este
repositorio), **no la publiques**. Escribí a **info@mdmsurgery.com** con el
asunto "Seguridad" y contá:

- qué encontraste y en qué página o archivo;
- los pasos para reproducirlo;
- qué impacto creés que tiene.

Respondemos lo antes posible. Por favor, no pruebes nada que afecte a otras
personas (envío masivo de formularios, intentos de adivinar la contraseña del
editor, acceso a datos de pacientes).

## Qué protege el sitio

- Encabezados de seguridad y política de contenido (CSP) restrictiva, en
  `netlify.toml`.
- El editor de fotos exige una contraseña; la sesión dura 12 horas y las
  funciones del servidor validan cada pedido.
- La contraseña del editor y el token de GitHub viven **solo** como variables de
  entorno en Netlify (`EDITOR_PASSWORD`, `EDITOR_GITHUB_TOKEN`). Nunca se suben
  al repositorio ni se comparten por chat o correo.
- Los mensajes del formulario de contacto los recibe Formspree; el sitio no los guarda.
- El sitio no usa cookies de seguimiento, analítica ni píxeles de terceros.

## Si se filtra una clave

1. Revocá el token de GitHub desde la configuración de la cuenta y generá uno
   nuevo con permiso de escritura solo sobre este repositorio.
2. Cambiá las variables en Netlify (*Project configuration → Environment
   variables*) y volvé a publicar.
3. Cambiar `EDITOR_PASSWORD` cierra todas las sesiones abiertas del editor.
