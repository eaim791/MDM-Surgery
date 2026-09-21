import { execFile } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/* Editor de Resultados: el doctor acomoda, reemplaza, agrega y quita fotos
   desde el propio sitio. configureServer solo corre con "npm run dev", asi que
   ni el editor ni estos endpoints existen en el sitio publicado.

   - /__editor/encuadre  guarda el encuadre (posicion, zoom y tamano del recuadro)
   - /__editor/archivos  escribe, reemplaza o quita fotos de un caso */

const BASE = 'src/assets/procedimientos'
const PAPELERA = 'originales/borradas'
// Solo rutas "<procedimiento>/<caso>/<archivo>.webp" dentro de la carpeta de
// procedimientos: sin "..", sin subir de nivel, sin otras extensiones.
const RUTA_OK = /^[^/\\]+\/[^/\\]+\/[^/\\]+\.webp$/

const leerCuerpo = (req) => new Promise((resolve, reject) => {
  let body = ''
  req.on('data', (c) => { body += c })
  req.on('end', () => { try { resolve(JSON.parse(body || '{}')) } catch (e) { reject(e) } })
  req.on('error', reject)
})

const responder = (res, datos, codigo = 200) => {
  res.statusCode = codigo
  res.setHeader('content-type', 'application/json')
  res.end(JSON.stringify(datos))
}

function editorApi() {
  return {
    name: 'editor-resultados',
    configureServer(server) {
      server.middlewares.use('/__editor/encuadre', async (req, res) => {
        if (req.method !== 'POST') return responder(res, { ok: false }, 405)
        try {
          const { fotos = {}, marcos = {} } = await leerCuerpo(req)
          const ruta = 'src/encuadre.json'
          const datos = JSON.parse(readFileSync(ruta, 'utf-8'))
          const redondear = (n) => Math.round(n * 100) / 100
          for (const [clave, valor] of Object.entries(fotos)) {
            if (valor === null) delete datos.fotos[clave]
            else datos.fotos[clave] = valor.map(redondear)
          }
          for (const [clave, valor] of Object.entries(marcos)) {
            if (valor === null) delete datos.marcos[clave]
            else datos.marcos[clave] = Array.isArray(valor) ? valor.map(redondear) : redondear(valor)
          }
          writeFileSync(ruta, JSON.stringify(datos))
          responder(res, { ok: true, guardadas: Object.keys(fotos).length + Object.keys(marcos).length })
        } catch (e) {
          responder(res, { ok: false, error: String(e.message || e) }, 500)
        }
      })

      /* Publicar: sube a internet SOLO el contenido (fotos y encuadres), no el
         codigo. Cada llamada es un deploy, asi que del lado del sitio se pide
         confirmacion antes de tocar el boton. */
      server.middlewares.use('/__editor/publicar', async (req, res) => {
        if (req.method !== 'POST') return responder(res, { ok: false }, 405)
        const git = (args) => new Promise((resolve, reject) => {
          execFile('git', args, { cwd: process.cwd(), maxBuffer: 10 * 1024 * 1024 },
            (err, stdout, stderr) => (err ? reject(new Error(stderr || err.message)) : resolve(stdout)))
        })
        try {
          await git(['add', '--', 'src/assets/procedimientos', 'src/encuadre.json'])
          const pendiente = await git(['diff', '--cached', '--name-only'])
          if (!pendiente.trim()) return responder(res, { ok: true, sinCambios: true })
          await git(['commit', '-m', 'Actualiza las fotos de Resultados desde el editor'])
          await git(['push', 'origin', 'main'])
          const cuantos = pendiente.trim().split(String.fromCharCode(10)).length
          responder(res, { ok: true, archivos: cuantos })
        } catch (e) {
          responder(res, { ok: false, error: String(e.message || e) }, 500)
        }
      })

      server.middlewares.use('/__editor/archivos', async (req, res) => {
        if (req.method !== 'POST') return responder(res, { ok: false }, 405)
        try {
          const { acciones = [] } = await leerCuerpo(req)
          const hechas = []
          for (const { accion, ruta, datos } of acciones) {
            if (!RUTA_OK.test(ruta)) throw new Error(`Ruta no permitida: ${ruta}`)
            const destino = join(BASE, ruta)
            if (accion === 'guardar') {
              mkdirSync(dirname(destino), { recursive: true })
              writeFileSync(destino, Buffer.from(datos, 'base64'))
              hechas.push(`guardada ${ruta}`)
            } else if (accion === 'borrar') {
              // No se borra de verdad: la foto se mueve a originales/borradas
              // (carpeta local, fuera del repo) por si hay que recuperarla.
              if (!existsSync(destino)) { hechas.push(`ya no estaba ${ruta}`); continue }
              const guardada = join(PAPELERA, ruta)
              mkdirSync(dirname(guardada), { recursive: true })
              renameSync(destino, guardada)
              hechas.push(`quitada ${ruta}`)
            } else {
              throw new Error(`Accion desconocida: ${accion}`)
            }
          }
          responder(res, { ok: true, hechas })
        } catch (e) {
          responder(res, { ok: false, error: String(e.message || e) }, 500)
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), editorApi()],
})
