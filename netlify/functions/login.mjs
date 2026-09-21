import { crearPase, json } from "./_sesion.mjs";

/* POST /api/login { clave } -> { ok, pase }
   Espera un momento antes de responder a una clave incorrecta, para que no
   sirva de nada probar contraseñas una atrás de otra. */
export default async (req) => {
  if (req.method !== "POST") return json({ ok: false }, 405);
  const esperada = process.env.EDITOR_PASSWORD;
  if (!esperada) return json({ ok: false, error: "Falta configurar EDITOR_PASSWORD" }, 500);

  let clave = "";
  try { ({ clave = "" } = await req.json()); } catch { /* cuerpo vacío o roto */ }

  if (clave !== esperada) {
    await new Promise((r) => setTimeout(r, 1200));
    return json({ ok: false, error: "Contraseña incorrecta" }, 401);
  }
  return json({ ok: true, pase: await crearPase(esperada) });
};
