import os, re, shutil
from PIL import Image
BASE = "src/assets/procedimientos"

def dirs(slug):
    d = os.path.join(BASE, slug)
    return sorted([x for x in os.listdir(d) if os.path.isdir(os.path.join(d, x))]) if os.path.isdir(d) else []

# 1. ids estables
for s in sorted(os.listdir(BASE)):
    d = os.path.join(BASE, s)
    if not os.path.isdir(d): continue
    for i, c in enumerate(dirs(s), 1):
        os.rename(os.path.join(d, c), os.path.join(d, f"x-{i:02d}"))

def cd(slug, n): return os.path.join(BASE, slug, f"x-{n:02d}")
def ang(d): return max([int(m.group(1)) for f in os.listdir(d) if (m := re.match(r"antes-(\d+)\.", f))] or [0])

def merge(slug, dst, src):
    dd, sd = cd(slug, dst), cd(slug, src)
    if not os.path.isdir(sd): print(f"  !! {slug} x-{src:02d}"); return
    k = ang(dd)
    for i in range(1, ang(sd) + 1):
        k += 1
        for tag in ("antes", "despues"):
            os.rename(os.path.join(sd, f"{tag}-{i}.jpg"), os.path.join(dd, f"{tag}-{k}.jpg"))
    shutil.rmtree(sd); print(f"  {slug}: x-{src:02d} -> x-{dst:02d} ({k} ang)")

def drop(slug, n):
    d = cd(slug, n)
    if os.path.isdir(d): shutil.rmtree(d); print(f"  {slug}: x-{n:02d} eliminado")

def move(ss, n, ds):
    sd = cd(ss, n)
    if not os.path.isdir(sd): print(f"  !! {ss} x-{n:02d}"); return
    d0 = os.path.join(BASE, ds); os.makedirs(d0, exist_ok=True)
    i = 90
    while os.path.exists(os.path.join(d0, f"x-{i:02d}")): i += 1
    os.rename(sd, os.path.join(d0, f"x-{i:02d}")); print(f"  {ss}/x-{n:02d} -> {ds}/x-{i:02d}")

def swap(slug, n, k):
    d = cd(slug, n)
    a, b = os.path.join(d, f"antes-{k}.jpg"), os.path.join(d, f"despues-{k}.jpg")
    os.rename(a, a + ".t"); os.rename(b, a); os.rename(a + ".t", b)

def split_antes(slug, n, k=1):
    """La foto 'antes' trae antes+despues juntas: izquierda->antes, derecha->despues."""
    d = cd(slug, n)
    p = os.path.join(d, f"antes-{k}.jpg")
    im = Image.open(p).convert("RGB"); w, h = im.size
    izq, der = im.crop((0, 0, w // 2, h)), im.crop((w // 2, 0, w, h))
    def recorte(x):
        ww, hh = x.size
        if ww / hh > 0.8:
            nw = int(round(hh * 0.8)); o = (ww - nw) // 2; x = x.crop((o, 0, o + nw, hh))
        else:
            nh = int(round(ww / 0.8)); o = int(round((hh - nh) * 0.38)); x = x.crop((0, o, ww, o + nh))
        return x
    recorte(izq).save(p, "JPEG", quality=88, optimize=True)
    recorte(der).save(os.path.join(d, f"despues-{k}.jpg"), "JPEG", quality=88, optimize=True)
    print(f"  {slug}: x-{n:02d} angulo {k} separado (izq=antes, der=despues)")

print("Correcciones")
merge("forehead-orbital", 1, 5)
move("rejuvenation", 8, "rhinoplasty")
move("rejuvenation", 9, "forehead-orbital")
drop("rejuvenation", 11)
drop("rhinoplasty", 12)
split_antes("rhinoplasty", 18, 1)
split_antes("rhinoplasty", 22, 1)
for k in range(2, ang(cd("rhinoplasty", 22)) + 1):
    swap("rhinoplasty", 22, k)
print(f"  rhinoplasty: x-22 angulos 2+ invertidos")
move("rhinoplasty", 26, "body-remodeling")
merge("rhinoplasty", 27, 28)
drop("rhinoplasty", 34)

# 2. renumerar via staging (evita colisiones en Windows)
TMP = "revision2/_st"
if os.path.isdir(TMP): shutil.rmtree(TMP)
os.makedirs(TMP)
def key(n):
    m = re.search(r"(\d+)$", n); return int(m.group(1)) if m else 0
for s in sorted(os.listdir(BASE)):
    d = os.path.join(BASE, s)
    if not os.path.isdir(d): continue
    st = os.path.join(TMP, s); os.makedirs(st)
    for i, c in enumerate(sorted(dirs(s), key=key), 1):
        os.rename(os.path.join(d, c), os.path.join(st, f"{i:03d}"))
    n = 0
    for c in sorted(os.listdir(st)):
        p = os.path.join(st, c)
        if not any(f.endswith(".jpg") for f in os.listdir(p)): shutil.rmtree(p); continue
        n += 1; os.rename(p, os.path.join(d, f"caso-{n:02d}"))
shutil.rmtree(TMP)

print("\nEstado final")
tot = 0
for s in sorted(os.listdir(BASE)):
    d = os.path.join(BASE, s)
    if not os.path.isdir(d): continue
    cs = dirs(s); tot += len(cs)
    print(f"  {s}: {len(cs)}" + (f"  [{', '.join(str(ang(os.path.join(d,c))) for c in cs)}]" if cs else ""))
print("TOTAL:", tot)
