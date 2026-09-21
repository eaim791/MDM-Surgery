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
      const { fotos = {}, marcos = {}, archivos = [] } = await req.json();
      for (const a of archivos) {
        if (!RUTA_OK.test(a.ruta)) return json({ ok: false, error: `Ruta no permitida: ${a.ruta}` }, 400);
      }
      // Las fotos que se sacaron del borrador dejan de ocupar lugar.
      const previo = await store.get(INDICE, { type: "json" });
      const siguen = new Set(archivos.map((a) => a.ruta));
      for (const a of previo?.archivos ?? []) {
        if (!siguen.has(a.ruta)) await store.delete(`archivo/${a.ruta}`);
      }
      await store.setJSON(INDICE, { fotos, marcos, archivos, guardado: Date.now() });
      return json({ ok: true });
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
