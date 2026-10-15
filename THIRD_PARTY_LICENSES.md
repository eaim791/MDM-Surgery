# Licencias de terceros

El sitio usa las siguientes librerías y tipografías de código abierto. Cada una
conserva su propia licencia; el archivo [LICENSE](LICENSE) del proyecto no las
modifica. Las versiones exactas están en `package-lock.json`.

## Se incluyen en el sitio publicado

| Paquete | Licencia | Para qué se usa |
|---|---|---|
| [react](https://react.dev/) y react-dom | MIT | Interfaz |
| [framer-motion](https://www.framer.com/motion/) | MIT | Animaciones |
| [lucide-react](https://lucide.dev/) | ISC | Íconos |
| [@fontsource/playfair-display](https://fontsource.org/fonts/playfair-display) | OFL-1.1 | Tipografía de títulos |
| [@fontsource/inter](https://fontsource.org/fonts/inter) | OFL-1.1 | Tipografía de texto |
| [@fontsource/cormorant-garamond](https://fontsource.org/fonts/cormorant-garamond) | OFL-1.1 | Tipografía de citas |
| [@fontsource/mrs-saint-delafield](https://fontsource.org/fonts/mrs-saint-delafield) | OFL-1.1 | Tipografía manuscrita del slogan |

## Solo para el editor de fotos (funciones del servidor)

| Paquete | Licencia | Para qué se usa |
|---|---|---|
| [@netlify/blobs](https://github.com/netlify/blobs) | MIT | Guardar el borrador del editor |

## Solo para construir el sitio (no van al navegador)

| Paquete | Licencia |
|---|---|
| [vite](https://vite.dev/) | MIT |
| [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react) | MIT |
| [tailwindcss](https://tailwindcss.com/) y @tailwindcss/vite | MIT |

## Se carga bajo demanda desde una CDN

El editor de fotos descarga [heic2any](https://github.com/alexcorvi/heic2any)
(licencia MIT) desde jsDelivr, solo cuando se sube una foto de iPhone en formato
HEIC. No forma parte del sitio que ven las visitas.

## Nota sobre las tipografías (SIL Open Font License 1.1)

Las cuatro tipografías se publican bajo la SIL Open Font License 1.1, que
permite usarlas, incluso en un sitio comercial, siempre que se conserve su
aviso de licencia (viene dentro de cada paquete de Fontsource en
`node_modules/@fontsource/*/LICENSE`). No se venden por separado.
