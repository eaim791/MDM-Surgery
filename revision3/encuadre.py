"""Calcula el encuadre de cada foto de caso.

Para cada foto publicada escribe el rectangulo (ancho, alto, izquierda, arriba) en
porcentaje del marco 4:5 de la galeria. Con eso la web amplia cada foto sobre la zona
del procedimiento y deja el mismo punto de la cara (menton con menton, nariz con nariz)
en el mismo lugar del marco, sin tocar el archivo: el original queda intacto y el
lightbox lo sigue mostrando entero.

Deteccion en dos pasos: MediaPipe FaceLandmarker (478 puntos, muy preciso pero se
pierde en los perfiles) y, cuando falla, YuNet (bbox + 5 puntos, aguanta el perfil).
Las anclas de YuNet se estiman con las medianas medidas sobre las fotos donde los dos
detectores coinciden.
"""
import json, os, statistics as st, sys, warnings
import numpy as np
from PIL import Image

warnings.filterwarnings("ignore")
os.environ.setdefault("GLOG_minloglevel", "3")
os.environ.setdefault("OPENCV_LOG_LEVEL", "SILENT")

import cv2
import mediapipe as mp
from mediapipe.tasks.python import vision, BaseOptions

BASE = "src/assets/procedimientos"
MODELO = "revision3/face_landmarker.task"
YUNET = "revision3/yunet.onnx"
SALIDA = "src/encuadre.json"

MARCO_MIN = 0.75        # el recuadro nunca es mas angosto que 3:4 (vertical)
MARCO_MAX = 1.5         # ni mas ancho que 3:2 (apaisado)
ZOOM_MAX = 1.35         # tope de ampliacion: mas que esto queda demasiado cerca
ZOOM_MIN = 0.7          # piso, para que ninguna foto quede diminuta en el marco

# Landmarks de MediaPipe (478 puntos)
NARIZ, MENTON, FRENTE, ENTRECEJO = 1, 152, 10, 168
OJO_IZQ, OJO_DER = 33, 263
POMULO_IZQ, POMULO_DER = 50, 280
LABIOS = 13

ANCLAS = {
    "nariz":     (NARIZ,),
    "perfil":    (NARIZ, LABIOS),
    "labios":    (LABIOS,),
    "ojos":      (OJO_IZQ, OJO_DER),
    "frente":    (FRENTE,),
    "ceja":      (FRENTE, ENTRECEJO),
    "pomulos":   (POMULO_IZQ, POMULO_DER),
    "menton":    (MENTON,),
    "cara":      (FRENTE, MENTON),
    "cara-baja": (MENTON, ENTRECEJO),
}

# Por procedimiento: ancla, donde cae dentro del marco (tx, ty) y que fraccion del
# alto del marco ocupa la cara (frente-menton).
PLAN = {
    "rhinoplasty":          ("nariz",     0.50, 0.50, 0.68),
    "profiloplasty":        ("perfil",    0.50, 0.52, 0.68),
    "upper-lip-lift":       ("labios",    0.50, 0.52, 0.86),
    "eyes-expression":      ("ojos",      0.50, 0.48, 0.80),
    "blepharoplasty":       ("ojos",      0.50, 0.48, 0.86),
    "forehead-orbital":     ("ceja",      0.50, 0.46, 0.64),
    "cheeks":               ("pomulos",   0.50, 0.50, 0.70),
    "chin-jaw":             ("menton",    0.50, 0.60, 0.70),
    "adams-remodeling":     ("menton",    0.50, 0.42, 0.60),
    "hair-implants":        ("frente",    0.50, 0.42, 0.58),
    "facial-harmonization": ("cara",      0.50, 0.50, 0.60),
    "feminization":         ("cara",      0.50, 0.50, 0.60),
    "masculinization":      ("cara",      0.50, 0.50, 0.60),
    "rejuvenation":         ("cara",      0.50, 0.50, 0.60),
    "face-neck-lift":       ("cara-baja", 0.50, 0.46, 0.58),
    "tensor-threads":       ("cara-baja", 0.50, 0.46, 0.60),
    # breast y body-remodeling no llevan cara: se quedan con el encuadre por defecto.
}


def sin_ext(f):
    """Las claves van sin extension: cambiar de formato no invalida el encuadre."""
    return os.path.splitext(f)[0]


def fotos():
    for slug in sorted(os.listdir(BASE)):
        d = os.path.join(BASE, slug)
        if not os.path.isdir(d):
            continue
        for caso in sorted(os.listdir(d)):
            dc = os.path.join(d, caso)
            if not os.path.isdir(dc):
                continue
            for f in sorted(os.listdir(dc)):
                # Las "fotoaparte" se muestran enteras, sin ampliar: no llevan encuadre.
                if f.lower().endswith((".jpg", ".jpeg", ".png", ".webp")) and "aparte" not in f.lower():
                    yield slug, caso, f, os.path.join(dc, f)


# ---------------------------------------------------------------- detectores

_mp_det = vision.FaceLandmarker.create_from_options(
    vision.FaceLandmarkerOptions(base_options=BaseOptions(model_asset_path=MODELO),
                                 num_faces=1, min_face_detection_confidence=0.2,
                                 min_face_presence_confidence=0.2))

def landmarks(im):
    """Puntos de MediaPipe en coordenadas normalizadas, reintentando en espejo y x2."""
    for prueba in (im, im.resize((im.width * 2, im.height * 2), Image.LANCZOS)):
        arr = np.asarray(prueba.convert("RGB"))
        r = _mp_det.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=arr))
        if r.face_landmarks:
            return r.face_landmarks[0]
        r = _mp_det.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=arr[:, ::-1].copy()))
        if r.face_landmarks:
            lm = r.face_landmarks[0]
            for p in lm:
                p.x = 1.0 - p.x
            return lm
    return None

def yunet(im):
    """bbox + 5 puntos de YuNet, normalizados. (x, y, w, h, nariz_x, nariz_y, ojos_dx)"""
    arr = np.asarray(im.convert("RGB"))[:, :, ::-1]
    h, w = arr.shape[:2]
    s = 800 / max(h, w)
    chico = cv2.resize(arr, (max(1, int(w * s)), max(1, int(h * s))))
    det = cv2.FaceDetectorYN.create(YUNET, "", (chico.shape[1], chico.shape[0]), 0.3, 0.3, 5000)
    n, caras = det.detect(chico)
    if caras is None or len(caras) == 0:
        return None
    c = max(caras, key=lambda f: f[2] * f[3])
    ch, cw = chico.shape[:2]
    bx, by, bw, bh = c[0] / cw, c[1] / ch, c[2] / cw, c[3] / ch
    ojo_d, ojo_i = (c[4] / cw, c[5] / ch), (c[6] / cw, c[7] / ch)
    nariz = (c[8] / cw, c[9] / ch)
    if bw <= 0 or bh <= 0:
        return None
    return dict(bx=bx, by=by, bw=bw, bh=bh, nariz=nariz,
                ojos=abs(ojo_d[0] - ojo_i[0]) / bw)


def punto(lm, ids):
    return (float(np.mean([lm[i].x for i in ids])), float(np.mean([lm[i].y for i in ids])))


def tamano(lm, aspecto):
    """Alto de la cara en fracciones del alto de la foto, sin que lo achique la
    inclinacion: se mide la distancia frente-menton, no su proyeccion vertical."""
    dx = (lm[FRENTE].x - lm[MENTON].x) * aspecto
    dy = lm[FRENTE].y - lm[MENTON].y
    return float(np.hypot(dx, dy))


def caja(y, aspecto):
    """Lado mayor del bbox de YuNet, en fracciones del alto: si la cabeza esta
    acostada el bbox se ensancha y el alto solo ya no mide la cara."""
    return max(y["bh"], y["bw"] * aspecto)


def encuadre(ax, ay, k, plan, aspecto, marco):
    """Rectangulo de la foto dentro del marco, en fracciones del marco."""
    _, tx, ty, _ = plan
    if aspecto > marco * 1.9:
        # Foto tan apaisada que recortarla al recuadro se comeria mas de la mitad del
        # ancho: mejor mostrarla entera y centrada, con margen arriba y abajo.
        k = marco / aspecto
        return [100.0, round(k * 100, 2), 0.0, round((1 - k) * 50, 2)]
    w = k * aspecto / marco                                # ancho mostrado / ancho del marco
    izq = min(max(tx - ax * w, 1 - w), 0.0)                # la foto siempre tapa el marco
    arr = min(max(ty - ay * k, 1 - k), 0.0)
    return [round(float(v) * 100, 2) for v in (w, k, izq, arr)]


def piso(aspecto, marco):
    """Ampliacion minima para que la foto cubra el marco sin dejar huecos."""
    return max(1.0, marco / aspecto)


def forma(*aspectos):
    """Proporcion del recuadro para un par: la de la foto mas vertical, acotada. Tomar
    la mas vertical evita tener que agrandar la otra para tapar un marco ancho."""
    return min(max(min(aspectos), MARCO_MIN), MARCO_MAX)


import re
BEFORE = lambda f: any(t in f.lower() for t in ("antes", "before"))
AFTER = lambda f: any(t in f.lower() for t in ("despu", "dsp", "after"))
natural = lambda s: [int(x) if x.isdigit() else x
                     for x in re.split(r"(\d+)", os.path.splitext(s)[0].lower())]

def pares(archivos):
    """Empareja antes-N con despues-N igual que la web, para igualar la ampliacion."""
    antes = sorted([f for f in archivos if BEFORE(f)], key=natural)
    desp = sorted([f for f in archivos if AFTER(f)], key=natural)
    return list(zip(antes, desp))


def main():
    items = list(fotos())
    print(f"{len(items)} fotos")

    medidas = []      # para calibrar YuNet
    crudo = {}        # ruta -> (ancla_x, ancla_y, alto_cara)
    pendientes = []
    for i, (slug, caso, f, p) in enumerate(items, 1):
        try:
            im = Image.open(p)
        except Exception:
            continue
        clave = f"{slug}/{caso}/{sin_ext(f)}"
        if slug not in PLAN:          # mamas y remodelacion corporal: sin cara que medir
            continue
        lm = landmarks(im)
        y = yunet(im)
        if lm is not None:
            alto = tamano(lm, im.width / im.height)
            ax, ay = punto(lm, ANCLAS[PLAN[slug][0]])
            crudo[clave] = (ax, ay, alto, im.width / im.height, "mp")
            if y:
                perfil = y["ojos"] < 0.22
                espejo = -1 if y["nariz"][0] < y["bx"] + y["bw"] / 2 else 1
                fila = {"esPerfil": perfil, "alto": alto / caja(y, im.width / im.height)}
                for nombre, ids in ANCLAS.items():
                    px, py = punto(lm, ids)
                    fila[nombre] = (espejo * (px - y["bx"]) / y["bw"], (py - y["by"]) / y["bh"])
                medidas.append(fila)
        elif y:
            pendientes.append((clave, slug, y, im.width / im.height))
        if i % 40 == 0:
            print(f"  {i}/{len(items)}", flush=True)

    # Medianas de YuNet: posicion de cada ancla dentro del bbox y alto de cara / alto bbox.
    def mediana(filas, campo, eje=None):
        v = [f[campo] if eje is None else f[campo][eje] for f in filas]
        return st.median(v) if v else None

    tabla = {}
    for perfil in (False, True):
        filas = [f for f in medidas if f["esPerfil"] == perfil] or medidas
        tabla[perfil] = {"alto": mediana(filas, "alto"),
                         **{a: (mediana(filas, a, 0), mediana(filas, a, 1)) for a in ANCLAS}}
    print("\ncalibracion YuNet (frontal / perfil):")
    for perfil in (False, True):
        n = sum(1 for f in medidas if f["esPerfil"] == perfil)
        print(f"  {'perfil' if perfil else 'frontal'}: n={n} alto={tabla[perfil]['alto']:.3f} "
              f"cara={tuple(round(float(v),3) for v in tabla[perfil]['cara'])}")

    for clave, slug, y, aspecto in pendientes:
        perfil = y["ojos"] < 0.22
        t = tabla[perfil]
        espejo = -1 if y["nariz"][0] < y["bx"] + y["bw"] / 2 else 1
        rx, ry = t[PLAN[slug][0]]
        ax = y["bx"] + espejo * rx * y["bw"]
        ay = y["by"] + ry * y["bh"]
        crudo[clave] = (ax, ay, t["alto"] * caja(y, aspecto), aspecto, "yn")

    # Ampliacion de cada foto: la cara ocupa siempre la misma fraccion del marco.
    zoom = {c: PLAN[c.split("/")[0]][3] / v[2] for c, v in crudo.items() if v[2] >= 0.02}

    # Proporcion del recuadro. El antes y el despues de un mismo angulo comparten marco
    # y ampliacion, asi la cara sale del mismo tamano y en el mismo lugar a los dos lados.
    porcaso = {}
    for slug, caso, f, p in items:
        porcaso.setdefault((slug, caso), []).append((f, p))
    marcos, emparejada = {}, set()
    for (slug, caso), archivos in porcaso.items():
        aspectos = {}
        for f, p in archivos:
            try:
                with Image.open(p) as im:
                    aspectos[f] = im.width / im.height
            except Exception:
                pass
        for a, b in pares([f for f, _ in archivos]):
            if a not in aspectos or b not in aspectos:
                continue
            ca, cb = f"{slug}/{caso}/{sin_ext(a)}", f"{slug}/{caso}/{sin_ext(b)}"
            marcos[ca] = marcos[cb] = forma(aspectos[a], aspectos[b])
            emparejada |= {ca, cb}
            ka, kb = zoom.get(ca), zoom.get(cb)
            if not (ka and kb):
                continue
            # Ampliacion comun: la menor de las dos, para no acercar de mas la foto
            # que ya venia cerca. Nunca menos de lo que necesita para tapar su marco.
            suelo = max(piso(aspectos[a], marcos[ca]), piso(aspectos[b], marcos[cb]))
            zoom[ca] = zoom[cb] = min(max(min(ka, kb), suelo), max(ZOOM_MAX, suelo))
        for f, _ in archivos:
            c = f"{slug}/{caso}/{sin_ext(f)}"
            if c in emparejada or f not in aspectos:
                continue
            marcos[c] = forma(aspectos[f])
            if c in zoom:
                zoom[c] = min(max(zoom[c], piso(aspectos[f], marcos[c])), ZOOM_MAX)

    salida = {}
    for clave, (ax, ay, alto, aspecto, origen) in crudo.items():
        slug = clave.split("/")[0]
        if clave not in zoom or clave not in marcos:
            continue
        r = encuadre(ax, ay, zoom[clave], PLAN[slug], aspecto, marcos[clave])
        if r:
            salida[clave] = r

    # Las fotos sueltas se muestran enteras: su marco toma la proporcion exacta de la
    # foto en vez de forzar un 4:5 que dejaria bandas vacias.
    proporciones = {}
    for slug in sorted(os.listdir(BASE)):
        d = os.path.join(BASE, slug)
        if not os.path.isdir(d):
            continue
        for caso in sorted(os.listdir(d)):
            dc = os.path.join(d, caso)
            if not os.path.isdir(dc):
                continue
            for f in sorted(os.listdir(dc)):
                if "aparte" not in f.lower() or not f.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
                    continue
                try:
                    with Image.open(os.path.join(dc, f)) as im:
                        proporciones[f"{slug}/{caso}/{sin_ext(f)}"] = round(im.width / im.height, 4)
                except Exception:
                    pass
    with open(SALIDA, "w", encoding="utf-8") as fh:
        json.dump({"fotos": salida,
                   "marcos": {k: round(float(v), 4) for k, v in sorted(marcos.items())},
                   "aparte": proporciones},
                  fh, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
    print(f"{len(marcos)} marcos, {len(proporciones)} fotos sueltas con proporcion")

    mp_n = sum(1 for v in crudo.values() if v[4] == "mp")
    print(f"\n{len(salida)}/{len(items)} fotos encuadradas  (mediapipe {mp_n}, yunet {len(crudo)-mp_n})")
    faltan = [f"{s}/{c}/{f}" for s, c, f, _ in items if f"{s}/{c}/{sin_ext(f)}" not in salida]
    print(f"sin cara: {len(faltan)}")
    for x in faltan:
        print("   ", x)


main()
