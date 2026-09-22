import { getStore } from "@netlify/blobs";
import { json, paseValido, pedirPase } from "./_sesion.mjs";

/* Borrador del editor: lo que se acomoda desde el sitio se guarda acá, en el
   almacenamiento de Netlify, sin tocar la página que ven las visitas. Sirve
   para cortar a la mitad y seguir otro día, o desde otra computadora. Recién
   al publicar (funcion publicar.mjs) el borrador pasa a la página de verdad.

   GET  /api/borrador                -> { fotos, marcos, archivos:[{accion,ruta}] }
   GET  /api/borrador?archivo=RUTA   -> { datos } (la foto en base64)
   POST /api/borrador                <- guarda la lista y los encuadres
   POST /api/borrador?archivo=RUTA   <- guarda una foto
   DELETE /api/borrador              -> lo borra todo (despues de publicar) */

// Solo rutas "<procedimiento>/<caso>/<archivo>.webp": sin "..", sin salirse.
const RUTA_OK = /^[^/\\]+\/[^/\\]+\/[^/\\]+\.webp$/;
const INDICE = "indice";
const almacen = () => getStore({ name: "editor-borrador", consistency: "strong" });

export default async (req) => {
  if (!(await paseValido(pedirPase(req), process.env.EDITOR_PASSWORD))) {
    return json({ ok: false, error: "Sesión vencida, volvé a entrar" }, 401);
  }
  const archivo = new URL(req.url).searchParams.get("archivo");
  if (archivo && !RUTA_OK.test(archivo)) return json({ ok: false, error: `Ruta no permitida: ${archivo}` }, 400);

  const store = almacen();
  try {
    if (req.method === "GET") {
      if (archivo) {
        const datos = await store.get(`archivo/${archivo}`);
        if (!datos) return json({ ok: false, error: "Esa foto ya no está en el borrador" }, 404);
        return json({ ok: true, datos });
      }
      return json({ ok: true, borrador: (await store.get(INDICE, { type: "json" })) || null });
    }

    if (req.method === "POST") {
      if (archivo) {
        const { datos = "" } = await req.json();
        if (!datos) return json({ ok: false, error: "La foto llegó vacía" }, 400);
        await store.set(`archivo/${archivo}`, datos);
        return json({ ok: true });
      }
      const { fotos = {}, marcos = {}, archivos = [], visto, forzar = false } = await req.json();
      for (const a of archivos) {
        if (!RUTA_OK.test(a.ruta)) return json({ ok: false, error: `Ruta no permitida: ${a.ruta}` }, 400);
      }
      const previo = await store.get(INDICE, { type: "json" });
      /* El borrador es uno solo y lo comparten las dos personas que tienen la
         contrasena. Si el que esta guardando arranco de una version mas vieja
         que la guardada, se le avisa en vez de pisar el trabajo del otro.
         Una pestana abierta desde antes de este cambio no manda "visto": en
         ese caso no se puede comparar y se la deja guardar, para no romperle
         el guardado a quien todavia tiene la pagina vieja cargada. */
      if (!forzar && visto !== undefined && previo?.guardado && previo.guardado > visto) {
        return json({ ok: false, conflicto: true, guardado: previo.guardado }, 409);
      }
      // Las fotos que se sacaron del borrador dejan de ocupar lugar.
      const siguen = new Set(archivos.map((a) => a.ruta));
      for (const a of previo?.archivos ?? []) {
        if (!siguen.has(a.ruta)) await store.delete(`archivo/${a.ruta}`);
      }
      const guardado = Date.now();
      await store.setJSON(INDICE, { fotos, marcos, archivos, guardado });
      return json({ ok: true, guardado });
    }

    if (req.method === "DELETE") {
      const previo = await store.get(INDICE, { type: "json" });
      for (const a of previo?.archivos ?? []) await store.delete(`archivo/${a.ruta}`);
      await store.delete(INDICE);
      return json({ ok: true });
    }

    return json({ ok: false }, 405);
  } catch (e) {
    return json({ ok: false, error: String(e.message || e) }, 500);
  }
};
