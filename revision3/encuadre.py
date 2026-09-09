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
# Tope aparte, mas permisivo, para el zoom EXTRA que hace falta solo para
# alinear el ancla con su par (ver alinea() y su uso en main()): sin esto,
# una foto cuya cara ya viene comoda a menos de 1.35 quedaba igual clavada
# lejos de pera-con-pera cuando su par necesitaba mas margen para llegar al
# mismo punto del marco. No se usa para el zoom "de contenido" (ka/piso),
# que sigue respetando ZOOM_MAX como siempre.
ZOOM_MAX_ALINEA = 1.7

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

# Encuadre unico "cuello para arriba": mismo ancla (cara completa, frente-menton),
# mismo lugar dentro del marco y misma ampliacion para todos los procedimientos
# de cara — asi todas las fotos del sitio quedan con el mismo aire alrededor de
# la cara, en vez de que cada procedimiento tuviera su propio zoom (algunos muy
# cerrados, como ojos/labios a 0.80-0.86). Pedido del cliente: mostrar del cuello
# para arriba, sin hombros, y "lo mismo en todas las fotos, en todos los casos".
CUELLO_ARRIBA = ("cara", 0.50, 0.43, 0.46)

PLAN = {
    "rhinoplasty":          CUELLO_ARRIBA,
    "profiloplasty":        CUELLO_ARRIBA,
    "upper-lip-lift":       CUELLO_ARRIBA,
    "eyes-expression":      CUELLO_ARRIBA,
    "blepharoplasty":       CUELLO_ARRIBA,
    "forehead-orbital":     CUELLO_ARRIBA,
    "chin-jaw":             CUELLO_ARRIBA,
    "facial-harmonization": CUELLO_ARRIBA,
    "feminization":         CUELLO_ARRIBA,
    "masculinization":      CUELLO_ARRIBA,
    "rejuvenation":         CUELLO_ARRIBA,
    "face-neck-lift":       CUELLO_ARRIBA,
    # Estos 4 quedan con su encuadre de siempre — el cliente pidio dejarlos
    # afuera de este cambio (Pomulos, Nuez de Adan, Implante Capilar, Hilos
    # Tensores no se tocan). Los valores no cambiaron, solo se los saca del
    # bloque de arriba para que quede claro que es a proposito.
    "cheeks":               ("pomulos",   0.50, 0.50, 0.70),
    "adams-remodeling":     ("menton",    0.50, 0.42, 0.60),
    "hair-implants":        ("frente",    0.50, 0.42, 0.58),
    "tensor-threads":       ("cara-baja", 0.50, 0.46, 0.60),
    # breast y body-remodeling no llevan cara: se quedan con el encuadre por defecto.
}

# Casos puntuales donde el cliente pidio corregir que el antes y el despues no
# quedaban "pera con pera" — alinea() (ver mas abajo) solo se aplica a estos,
# no a todo el sitio: sin esta lista, cualquier otro caso con el mismo problema
# geometrico tambien se recalculaba y le cambiaba el encuadre sin que nadie lo
# hubiera pedido.
ALINEAR_CASOS = {
    ("facial-harmonization", "Camila Benítez"),
    ("facial-harmonization", "Lucía Fernández"),
    ("facial-harmonization", "Valentina Morales"),
    ("facial-harmonization", "Sofía Rossi"),
    ("profiloplasty", "Clara Godoy"),
    ("feminization", "caso-05"),
    ("feminization", "Renata Quiroga"),
    ("masculinization", "Gael Alvarez"),
    ("rhinoplasty", "caso-05"),
    ("rhinoplasty", "Josefina Paredes"),
    ("upper-lip-lift", "caso-04"),
}

# Fotos puntuales de un caso "alineable" donde el ancla no se puede medir bien
# — perfil muy cerrado mal calibrado en YuNet, o directamente una foto tan
# cerrada en el original que ni siquiera se ve el menton (el modelo lo
# extrapola a ciegas mas alla del propio borde de la foto) — forzar el zoom
# hasta ahi para "alinear" contra un dato no confiable termina peor que no
# alinear nada. Estas quedan con su encuadre normal (el mismo que si el caso
# no estuviera en ALINEAR_CASOS).
SIN_ALINEAR = {
    "facial-harmonization/Valentina Morales/despues-3",
    "facial-harmonization/Camila Benítez/antes-0",
}

# Fotos donde ni el ancla de MediaPipe ni la de YuNet caen sobre la cara (un
# perfil muy cerrado con pelo/oreja de por medio termina "detectando" la oreja
# como si fuera el menton): con un ancla asi de mala, cualquier encuadre
# calculado a partir de ella queda peor que el recorte por defecto (el mismo
# "objectPosition" fijo que usan las fotos sin cara detectada). Se tratan como
# si no se les hubiera encontrado cara.
SIN_DETECTAR = {
    "profiloplasty/Clara Godoy/antes (3)",
}

# Camila Benítez angulo 1: el "antes" esta recortado tan arriba que ni siquiera
# muestra el menton (ver SIN_ALINEAR), asi que se queda en su propio 100% sin
# forzar nada — es el limite del archivo, no se puede correjir. Pero el
# "despues" SI se puede mover: en vez de apuntarlo al 0.43 generico del resto
# del sitio (que no tiene nada que ver con donde quedo el "antes" al no poder
# moverse), se lo alinea contra el punto real donde cayo el ancla del "antes"
# ya recortado — asi los dos coinciden en el mismo lugar del marco aunque ese
# lugar no sea el estandar. Valor medido: con el "antes" a su propio 100% (sin
# zoom, sin margen para moverse) su ancla "cara" (frente-menton) cae al 55.4%
# de alto del marco — is ese el target real para emparejar el "despues".
TY_CUSTOM = {
    "facial-harmonization/Camila Benítez/despues-0": 0.554,
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
    """Rectangulo de la foto dentro del marco, en fracciones del marco.

    Una sola formula para los dos casos (foto que tapa el marco de sobra, y
    foto que le queda chica) en vez de una rama aparte para cada uno: en
    ambos se intenta primero apoyar el ancla (ax,ay) exactamente en (tx,ty)
    del marco, y solo se recorta esa franja cuando no entra sin dejar hueco
    vacio. Esto es lo que hace que el mismo punto de la cara (ej. el menton)
    caiga en el mismo lugar del marco en el antes y en el despues, incluso
    cuando a alguna de las dos le toca quedar con margen gris — centrarla
    sin mirar el ancla (como hacia antes) los desalineaba entre si.
    """
    _, tx, ty, _ = plan
    w = k * aspecto / marco                                 # ancho mostrado / ancho del marco
    izq = min(max(tx - ax * w, min(0.0, 1 - w)), max(0.0, 1 - w))
    arr = min(max(ty - ay * k, min(0.0, 1 - k)), max(0.0, 1 - k))
    return [round(float(v) * 100, 2) for v in (w, k, izq, arr)]


def piso(aspecto, marco):
    """Ampliacion minima para que la foto tape el marco entero, sin franja
    gris. Se usa como piso SOLO hasta ZOOM_MAX (ver main()): mas alla de eso
    la foto es demasiado distinta de proporcion al marco como para taparlo
    sin acercarse mas de la cuenta, y ahi si se deja el margen gris — pero
    solo en ese caso limite, no como default."""
    return max(1.0, marco / aspecto)


def alinea(ay, ty):
    """Zoom minimo para que el ancla (ej. el menton) pueda llegar exactamente
    a ty en el marco. encuadre() desplaza la foto para apoyar el ancla ahi,
    pero solo hasta donde el propio recuadro se lo permite sin dejar hueco
    vacio (ver los clamps de esa funcion) — si la foto viene demasiado
    ajustada (poco o nada para recortar arriba o abajo), ese margen no
    alcanza y el ancla queda clavada donde haya caido de forma natural, sin
    coincidir con la de su par. Agrandar un poco mas (hasta ZOOM_MAX como
    tope, igual que el resto) le da el margen que le faltaba."""
    if ay <= 0 or ay >= 1:
        return 1.0
    return max(ty / ay, (1 - ty) / (1 - ay))


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
        if clave in SIN_DETECTAR:     # ancla no confiable: tratar como sin cara
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
            # Cada foto con su propia ampliacion (no la menor de las dos): ka/kb ya
            # estan pensadas para que la cara ocupe la MISMA fraccion del marco en
            # cualquier foto (ver "zoom" mas arriba) — forzar una sola comun entre
            # el antes y el despues rompia justamente eso cuando las dos fotos
            # partian de una distancia de toma distinta (una mas cerca, otra mas
            # lejos): la que quedaba obligada a la ampliacion de la otra terminaba
            # con la cara mas chica o mas grande en el marco que su par, aunque el
            # numero de zoom fuera "el mismo". Compartir marco (arriba) ya alcanza
            # para que las dos tarjetas midan igual; el zoom se calibra por separado.
            base_a = min(max(ka, piso(aspectos[a], marcos[ca])), ZOOM_MAX)
            base_b = min(max(kb, piso(aspectos[b], marcos[cb])), ZOOM_MAX)
            if (slug, caso) in ALINEAR_CASOS:
                if ca not in SIN_ALINEAR:
                    ty_a = TY_CUSTOM.get(ca, PLAN[slug][2])
                    base_a = max(base_a, min(alinea(crudo[ca][1], ty_a), ZOOM_MAX_ALINEA))
                if cb not in SIN_ALINEAR:
                    ty_b = TY_CUSTOM.get(cb, PLAN[slug][2])
                    base_b = max(base_b, min(alinea(crudo[cb][1], ty_b), ZOOM_MAX_ALINEA))
            zoom[ca], zoom[cb] = base_a, base_b
        for f, _ in archivos:
            c = f"{slug}/{caso}/{sin_ext(f)}"
            if c in emparejada or f not in aspectos:
                continue
            marcos[c] = forma(aspectos[f])
            if c in zoom:
                base = min(max(zoom[c], piso(aspectos[f], marcos[c])), ZOOM_MAX)
                if (slug, caso) in ALINEAR_CASOS and c not in SIN_ALINEAR:
                    ty = TY_CUSTOM.get(c, PLAN[slug][2])
                    base = max(base, min(alinea(crudo[c][1], ty), ZOOM_MAX_ALINEA))
                zoom[c] = base

    salida = {}
    for clave, (ax, ay, alto, aspecto, origen) in crudo.items():
        slug = clave.split("/")[0]
        if clave not in zoom or clave not in marcos:
            continue
        ancla, tx, ty, escala = PLAN[slug]
        plan = (ancla, tx, TY_CUSTOM.get(clave, ty), escala)
        r = encuadre(ax, ay, zoom[clave], plan, aspecto, marcos[clave])
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
