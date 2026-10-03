import { getStore } from "@netlify/blobs";
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
const SLUG_OK = /^[a-z0-9-]+$/;
/* Las fotos no viajan en el pedido: Netlify no acepta pedidos de mas de ~6 MB
   (error 413) y con muchas fotos se pasaba. El editor guarda el borrador justo
   antes de publicar, asi que cada foto ya esta en el almacen del borrador
   (borrador.mjs) y se toma de ahi. Las pruebas locales reemplazan el almacen
   con globalThis.__almacenDePrueba. */
const almacen = () => globalThis.__almacenDePrueba ?? getStore({ name: "editor-borrador", consistency: "strong" });

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

/* De a varias a la vez. Netlify corta la funcion a los 10 segundos y, de a
   una, cada llamada a GitHub tarda ~0,3 s: con ~25 fotos se pasaba del tiempo
   y el editor recibia una respuesta vacia. GitHub pide no exagerar con las
   llamadas simultaneas que crean contenido, asi que van de a 6. */
const deAVarias = async (items, cuantas, fn) => {
  const res = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(cuantas, items.length) }, async () => {
    while (i < items.length) { const k = i++; res[k] = await fn(items[k]); }
  }));
  return res;
};

export default async (req) => {
  if (req.method !== "POST") return json({ ok: false }, 405);
  if (!(await paseValido(pedirPase(req), process.env.EDITOR_PASSWORD))) {
    return json({ ok: false, error: "Sesión vencida, volvé a entrar" }, 401);
  }
  if (!process.env.EDITOR_GITHUB_TOKEN) {
    return json({ ok: false, error: "Falta configurar EDITOR_GITHUB_TOKEN" }, 500);
  }

  try {
    const { fotos = {}, marcos = {}, censura = {}, orden = {}, compartidos = {}, archivos = [] } = await req.json();
    for (const a of archivos) {
      if (!RUTA_OK.test(a.ruta)) return json({ ok: false, error: `Ruta no permitida: ${a.ruta}` }, 400);
    }
    // "procedimiento/caso": [procedimientos donde se muestra]. Solo nombres de procedimiento validos.
    for (const [k, lista] of Object.entries(compartidos)) {
      if (!/^[^/\\]+\/[^/\\]+$/.test(k) || !Array.isArray(lista) || !lista.every((s) => SLUG_OK.test(String(s)))) {
        return json({ ok: false, error: `Lista de procedimientos no válida para ${k}` }, 400);
      }
    }
    if (!archivos.length && !Object.keys(fotos).length && !Object.keys(marcos).length
        && !Object.keys(censura).length && !Object.keys(orden).length && !Object.keys(compartidos).length) {
      return json({ ok: true, sinCambios: true });
    }

    /* Todo lo que no depende de lo anterior va en paralelo (ver deAVarias):
       las fotos nuevas, el archivo de encuadres y el arbol del repositorio. */
    const hayEncuadres = Object.keys(fotos).length || Object.keys(marcos).length || Object.keys(censura).length
      || Object.keys(orden).length || Object.keys(compartidos).length;

    // 1. Punto de partida: el último commit de la rama.
    const base = (async () => {
      const ref = await gh(`/git/ref/heads/${RAMA}`);
      const commitBase = await gh(`/git/commits/${ref.object.sha}`);
      return { ref, commitBase };
    })();

    // 2. Encuadres: se lee el archivo actual y se le aplican los cambios.
    const encuadres = (async () => {
      if (!hayEncuadres) return null;
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
      // Censura elegida foto por foto desde el editor.
      datos.censura ??= {};
      for (const [clave, valor] of Object.entries(censura)) {
        if (valor === null) delete datos.censura[clave];
        else datos.censura[clave] = !!valor;
      }
      // Orden de los casos de cada procedimiento, arrastrado desde el editor.
      datos.orden ??= {};
      for (const [slug, lista] of Object.entries(orden)) {
        if (!Array.isArray(lista) || !lista.length) delete datos.orden[slug];
        else datos.orden[slug] = lista.map(String);
      }
      // En que procedimientos se muestra cada caso, elegido desde el editor.
      datos.compartidos ??= {};
      for (const [k, lista] of Object.entries(compartidos)) {
        if (!lista.length) delete datos.compartidos[k];
        else datos.compartidos[k] = [...new Set(lista.map(String))];
      }
      const blob = await gh("/git/blobs", {
        method: "POST",
        body: JSON.stringify({ content: JSON.stringify(datos), encoding: "utf-8" }),
      });
      return { path: ENCUADRES, mode: "100644", type: "blob", sha: blob.sha };
    })();

    /* 3a. Lo que se quiere borrar tiene que existir: si se le pide a GitHub
       que borre una ruta que no esta en el repositorio, responde
       "GitRPC::BadObjectState" y no aclara cual es. Asi que primero se lee el
       arbol del commit y se comparan las rutas (normalizadas, porque los
       acentos pueden venir escritos de dos maneras distintas). */
    const aBorrar = archivos.filter((a) => a.accion === "borrar");
    const repo = (async () => {
      if (!aBorrar.length) return null;
      const { commitBase } = await base;
      const t = await gh(`/git/trees/${commitBase.tree.sha}?recursive=1`);
      return t.truncated ? null
        : new Map(t.tree.filter((x) => x.type === "blob").map((x) => [x.path.normalize("NFC"), x.path]));
    })();

    // 3b. Fotos nuevas: cada una va como blob, de a varias a la vez.
    const nuevas = deAVarias(archivos.filter((a) => a.accion === "guardar"), 6, async ({ ruta, datos }) => {
      const contenido = datos || await almacen().get(`archivo/${ruta}`);
      if (!contenido) throw new Error(`No encontré la foto ${ruta.split("/").pop()} en el borrador. Recargá la página y probá de nuevo.`);
      const blob = await gh("/git/blobs", { method: "POST", body: JSON.stringify({ content: contenido, encoding: "base64" }) });
      return { path: `${BASE_FOTOS}/${ruta}`, mode: "100644", type: "blob", sha: blob.sha };
    });

    const [{ ref, commitBase }, entradaEncuadres, enElRepo, entradasNuevas] = await Promise.all([base, encuadres, repo, nuevas]);
    const arbol = [...(entradaEncuadres ? [entradaEncuadres] : []), ...entradasNuevas];

    // 3c. Fotos quitadas: con sha en null.
    const faltantes = [];
    for (const { ruta } of aBorrar) {
      const path = `${BASE_FOTOS}/${ruta}`;
      if (enElRepo) {
        const real = enElRepo.get(path.normalize("NFC"));
        if (!real) { faltantes.push(ruta); continue; }
        arbol.push({ path: real, mode: "100644", type: "blob", sha: null });
      } else {
        arbol.push({ path, mode: "100644", type: "blob", sha: null });
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
