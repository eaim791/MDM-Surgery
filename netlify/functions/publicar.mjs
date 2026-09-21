import { json, paseValido, pedirPase } from "./_sesion.mjs";

/* POST /api/publicar
   Sube a GitHub, en un solo commit, lo que el editor dejó preparado:
   fotos nuevas o reemplazadas, fotos quitadas y el archivo de encuadres.
   Netlify ve el commit y reconstruye el sitio solo. */

const REPO = process.env.EDITOR_REPO || "eaim791/MDM-Surgery";
const RAMA = process.env.EDITOR_RAMA || "main";
const BASE_FOTOS = "src/assets/procedimientos";
const ENCUADRES = "src/encuadre.json";
// Solo rutas "<procedimiento>/<caso>/<archivo>.webp": sin "..", sin salirse.
const RUTA_OK = /^[^/\\]+\/[^/\\]+\/[^/\\]+\.webp$/;

const gh = async (camino, opciones = {}) => {
  const r = await fetch(`https://api.github.com/repos/${REPO}${camino}`, {
    ...opciones,
    headers: {
      authorization: `Bearer ${process.env.EDITOR_GITHUB_TOKEN}`,
      accept: "application/vnd.github+json",
      "content-type": "application/json",
      "user-agent": "mdm-surgery-editor",
      ...(opciones.headers || {}),
    },
  });
  const cuerpo = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(cuerpo.message || `GitHub respondió ${r.status}`);
  return cuerpo;
};

export default async (req) => {
  /* Chequeo temporal para saber por que falla la publicacion. No devuelve
     ningun dato secreto: solo si las variables estan puestas y si el token
     llega al repositorio con permiso de escritura. Se saca una vez resuelto. */
  if (req.method === "GET") {
    const estado = {
      claveConfigurada: !!process.env.EDITOR_PASSWORD,
      tokenConfigurado: !!process.env.EDITOR_GITHUB_TOKEN,
      rama: RAMA,
    };
    if (estado.tokenConfigurado) {
      try {
        const repo = await gh("");
        estado.llegaAlRepositorio = true;
        estado.puedeEscribir = !!repo.permissions?.push;
      } catch (e) {
        estado.llegaAlRepositorio = false;
        estado.motivo = String(e.message || e);
      }
    }
    return json({ ok: true, estado });
  }
  if (req.method !== "POST") return json({ ok: false }, 405);
  if (!(await paseValido(pedirPase(req), process.env.EDITOR_PASSWORD))) {
    return json({ ok: false, error: "Sesión vencida, volvé a entrar" }, 401);
  }
  if (!process.env.EDITOR_GITHUB_TOKEN) {
    return json({ ok: false, error: "Falta configurar EDITOR_GITHUB_TOKEN" }, 500);
  }

  try {
    const { fotos = {}, marcos = {}, archivos = [] } = await req.json();
    for (const a of archivos) {
      if (!RUTA_OK.test(a.ruta)) return json({ ok: false, error: `Ruta no permitida: ${a.ruta}` }, 400);
    }
    if (!archivos.length && !Object.keys(fotos).length && !Object.keys(marcos).length) {
      return json({ ok: true, sinCambios: true });
    }

    // 1. Punto de partida: el último commit de la rama.
    const ref = await gh(`/git/ref/heads/${RAMA}`);
    const commitBase = await gh(`/git/commits/${ref.object.sha}`);

    // 2. Encuadres: se lee el archivo actual y se le aplican los cambios.
    const arbol = [];
    if (Object.keys(fotos).length || Object.keys(marcos).length) {
      const actual = await gh(`/contents/${ENCUADRES}?ref=${RAMA}`);
      // De base64 a texto pasando por bytes: las claves tienen acentos
      // ("Julieta Espósito") y atob solo devuelve bytes sueltos.
      const bytes = Uint8Array.from(atob(actual.content.replace(/\n/g, "")), (c) => c.charCodeAt(0));
      const datos = JSON.parse(new TextDecoder().decode(bytes));
      const redondear = (n) => Math.round(n * 100) / 100;
      for (const [clave, valor] of Object.entries(fotos)) {
        if (valor === null) delete datos.fotos[clave];
        else datos.fotos[clave] = valor.map(redondear);
      }
      for (const [clave, valor] of Object.entries(marcos)) {
        if (valor === null) delete datos.marcos[clave];
        else datos.marcos[clave] = Array.isArray(valor) ? valor.map(redondear) : redondear(valor);
      }
      const blob = await gh("/git/blobs", {
        method: "POST",
        body: JSON.stringify({ content: JSON.stringify(datos), encoding: "utf-8" }),
      });
      arbol.push({ path: ENCUADRES, mode: "100644", type: "blob", sha: blob.sha });
    }

    /* 3a. Lo que se quiere borrar tiene que existir: si se le pide a GitHub
       que borre una ruta que no esta en el repositorio, responde
       "GitRPC::BadObjectState" y no aclara cual es. Asi que primero se lee el
       arbol del commit y se comparan las rutas (normalizadas, porque los
       acentos pueden venir escritos de dos maneras distintas). */
    const aBorrar = archivos.filter((a) => a.accion === "borrar");
    let enElRepo = null;
    if (aBorrar.length) {
      const base = await gh(`/git/trees/${commitBase.tree.sha}?recursive=1`);
      if (!base.truncated) {
        enElRepo = new Map(base.tree.filter((x) => x.type === "blob").map((x) => [x.path.normalize("NFC"), x.path]));
      }
    }
    const faltantes = [];

    // 3b. Fotos: las nuevas van como blob; las quitadas, con sha en null.
    for (const { accion, ruta, datos } of archivos) {
      const path = `${BASE_FOTOS}/${ruta}`;
      if (accion === "guardar") {
        const blob = await gh("/git/blobs", { method: "POST", body: JSON.stringify({ content: datos, encoding: "base64" }) });
        arbol.push({ path, mode: "100644", type: "blob", sha: blob.sha });
      } else if (accion === "borrar") {
        if (enElRepo) {
          const real = enElRepo.get(path.normalize("NFC"));
          if (!real) { faltantes.push(ruta); continue; }
          arbol.push({ path: real, mode: "100644", type: "blob", sha: null });
        } else {
          arbol.push({ path, mode: "100644", type: "blob", sha: null });
        }
      }
    }

    // Si lo unico que habia era borrar fotos que ya no estan, no hay commit.
    if (!arbol.length) return json({ ok: true, sinCambios: true, faltantes });

    // 4. Un solo commit con todo y la rama apuntando ahí.
    const arbolNuevo = await gh("/git/trees", {
      method: "POST",
      body: JSON.stringify({ base_tree: commitBase.tree.sha, tree: arbol }),
    });
    const commit = await gh("/git/commits", {
      method: "POST",
      body: JSON.stringify({
        message: "Actualiza las fotos de Resultados desde el editor",
        tree: arbolNuevo.sha,
        parents: [ref.object.sha],
      }),
    });
    await gh(`/git/refs/heads/${RAMA}`, { method: "PATCH", body: JSON.stringify({ sha: commit.sha }) });

    return json({ ok: true, commit: commit.sha.slice(0, 7), archivos: arbol.length, faltantes });
  } catch (e) {
    return json({ ok: false, error: String(e.message || e) }, 500);
  }
};
