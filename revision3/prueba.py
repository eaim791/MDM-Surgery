"""Dibuja como quedarian los pares antes/despues con el encuadre calculado."""
import json, os, sys
from PIL import Image, ImageDraw

BASE = "src/assets/procedimientos"
D = json.load(open("src/encuadre.json", encoding="utf-8"))
ENC, MARCOS = D["fotos"], D["marcos"]
W, H = 200, 250          # marco 4:5

def marco(p, clave):
    im = Image.open(p).convert("RGB")
    a = MARCOS.get(clave, 0.8)
    W, H = (int(round(250 * a)), 250)
    lienzo = Image.new("RGB", (W, H), (232, 230, 228))
    r = ENC.get(clave)
    if r:
        w, h, x, y = [v / 100 for v in r]
        im = im.resize((max(1, int(W * w)), max(1, int(H * h))), Image.LANCZOS)
        lienzo.paste(im, (int(W * x), int(H * y)))
    else:                                     # sin datos: cover centrado
        s = max(W / im.width, H / im.height)
        im = im.resize((int(im.width * s), int(im.height * s)), Image.LANCZOS)
        lienzo.paste(im, ((W - im.width) // 2, int(H * 0.35 - im.height * 0.35)))
        ImageDraw.Draw(lienzo).rectangle([0, 0, W - 1, H - 1], outline=(200, 60, 60), width=3)
    return lienzo

def hoja(slug, salida):
    d = os.path.join(BASE, slug)
    casos = sorted(x for x in os.listdir(d) if os.path.isdir(os.path.join(d, x)))
    filas = []
    for c in casos:
        fs = sorted(os.listdir(os.path.join(d, c)))
        antes = [f for f in fs if "antes" in f.lower() or "before" in f.lower()]
        desp = [f for f in fs if any(t in f.lower() for t in ("despu", "dsp", "after"))]
        for a, b in zip(antes, desp):
            filas.append((c, a, b))
    if not filas:
        return
    cols = 4
    fw, fh = 400 + 6, H + 18
    n = len(filas)
    hojas = (n + cols * 6 - 1) // (cols * 6)
    for k in range(hojas):
        parte = filas[k * cols * 6:(k + 1) * cols * 6]
        rows = (len(parte) + cols - 1) // cols
        img = Image.new("RGB", (cols * (fw + 8), rows * (fh + 8)), "white")
        dr = ImageDraw.Draw(img)
        for i, (c, a, b) in enumerate(parte):
            ox, oy = (i % cols) * (fw + 8), (i // cols) * (fh + 8)
            ma = marco(os.path.join(d, c, a), f"{slug}/{c}/{a}")
            mb = marco(os.path.join(d, c, b), f"{slug}/{c}/{b}")
            img.paste(ma, (ox, oy + 16))
            img.paste(mb, (ox + ma.width + 6, oy + 16))
            dr.text((ox + 2, oy + 3), f"{c[:22]}  {a[:14]}", fill="black")
        img.save(f"{salida}/{slug}-{k+1}.jpg", quality=80)
        print(f"  {salida}/{slug}-{k+1}.jpg")

os.makedirs("revision3/hojas", exist_ok=True)
for slug in sys.argv[1:]:
    hoja(slug, "revision3/hojas")
