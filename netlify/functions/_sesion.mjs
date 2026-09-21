/* Sesión del editor: no hay base de datos ni usuarios. Se compara la
   contraseña contra EDITOR_PASSWORD (variable de entorno de Netlify) y, si
   coincide, se devuelve un pase firmado que vence a las 12 horas. El pase se
   firma con la propia contraseña, así que cambiarla invalida los pases viejos. */

const codificar = (txt) => new TextEncoder().encode(txt);

const clave = async (secreto) =>
  crypto.subtle.importKey("raw", codificar(secreto), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);

const aBase64 = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes)));

export const crearPase = async (secreto, horas = 12) => {
  const vence = Date.now() + horas * 60 * 60 * 1000;
  const firma = await crypto.subtle.sign("HMAC", await clave(secreto), codificar(String(vence)));
  return `${vence}.${aBase64(firma)}`;
};

export const paseValido = async (pase, secreto) => {
  if (!pase || !secreto) return false;
  const [vence, firma] = String(pase).split(".");
  if (!vence || !firma || Number(vence) < Date.now()) return false;
  const esperada = await crypto.subtle.sign("HMAC", await clave(secreto), codificar(vence));
  return aBase64(esperada) === firma;
};

export const pedirPase = (req) => (req.headers.get("authorization") || "").replace(/^Bearer /, "");

export const json = (datos, estado = 200) =>
  new Response(JSON.stringify(datos), { status: estado, headers: { "content-type": "application/json" } });
