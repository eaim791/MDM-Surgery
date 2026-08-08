import os, re, shutil
import numpy as np
from PIL import Image
BASE = "src/assets/procedimientos"

def cases(slug):
    d = os.path.join(BASE, slug)
    if not os.path.isdir(d): return []
    return sorted(x for x in os.listdir(d) if os.path.isdir(os.path.join(d, x)))

# --- 1. congelar los nombres actuales como ids estables x-NN -------------------
for s in sorted(os.listdir(BASE)):
    d = os.path.join(BASE, s)
    if not os.path.isdir(d): continue
    for i, c in enumerate(cases(s), 1):
        shutil.move(os.path.join(d, c), os.path.join(d, f"x-{i:02d}"))

def cd(slug, n): return os.path.join(BASE, slug, f"x-{n:02d}")
def angles(d):
    return max([int(m.group(1)) for f in os.listdir(d) if (m := re.match(r"antes-(\d+)\.", f))] or [0])

def merge(slug, dst, src):
    dd, sd = cd(slug, dst), cd(slug, src)
    if not os.path.isdir(sd): print(f"  !! {slug} x-{src:02d}"); return
    k = angles(dd)
    for i in range(1, angles(sd) + 1):
        k += 1
        for tag in ("antes", "despues"):
            shutil.move(os.path.join(sd, f"{tag}-{i}.jpg"), os.path.join(dd, f"{tag}-{k}.jpg"))
    shutil.rmtree(sd); print(f"  {slug}: x-{src:02d} fusionado en x-{dst:02d} ({k} ang)")

def drop(slug, n):
    d = cd(slug, n)
    if os.path.isdir(d): shutil.rmtree(d); print(f"  {slug}: x-{n:02d} eliminado")

def free(slug):
    d0 = os.path.join(BASE, slug); os.makedirs(d0, exist_ok=True)
    i = 90
    while os.path.exists(os.path.join(d0, f"x-{i:02d}")): i += 1
    return os.path.join(d0, f"x-{i:02d}")

def move(src_slug, n, dst_slug, copy=False):
    sd = cd(src_slug, n)
    if not os.path.isdir(sd): print(f"  !! {src_slug} x-{n:02d}"); return
    dd = free(dst_slug)
    (shutil.copytree if copy else shutil.move)(sd, dd)
    print(f"  {src_slug}/x-{n:02d} -> {dst_slug}/{os.path.basename(dd)}{' (copia)' if copy else ''}")

def swap(slug, n, k):
    d = cd(slug, n)
    a, b = os.path.join(d, f"antes-{k}.jpg"), os.path.join(d, f"despues-{k}.jpg")
    shutil.move(a, a + ".tmp"); shutil.move(b, a); shutil.move(a + ".tmp", b)
    print(f"  {slug}: x-{n:02d} angulo {k} invertido")

def drop_angle(slug, n, k):
    d = cd(slug, n); tot = angles(d)
    for tag in ("antes", "despues"):
        os.remove(os.path.join(d, f"{tag}-{k}.jpg"))
    for i in range(k + 1, tot + 1):
        for tag in ("antes", "despues"):
            shutil.move(os.path.join(d, f"{tag}-{i}.jpg"), os.path.join(d, f"{tag}-{i-1}.jpg"))
    print(f"  {slug}: x-{n:02d} angulo {k} eliminado")

def recrop(slug, n):
    """Recorta bandas planas (texto) y vuelve a encuadrar en 4:5."""
    d = cd(slug, n)
    for f in sorted(os.listdir(d)):
        a = np.asarray(Image.open(os.path.join(d, f)).convert("RGB")).astype(float)
        for _ in range(2):
            h, w, _ = a.shape; g = a.mean(2)
            rs, cs = g.std(1), g.std(0)
            t = 0
            while t < h * 0.45 and rs[t] < 16: t += 1
            b = h - 1
            while b > h * 0.55 and rs[b] < 16: b -= 1
            l = 0
            while l < w * 0.45 and cs[l] < 16: l += 1
            r = w - 1
            while r > w * 0.55 and cs[r] < 16: r -= 1
            a = a[t:b+1, l:r+1]
        h, w, _ = a.shape
        if w / h > 0.8:
            nw = int(round(h * 0.8)); x = (w - nw) // 2; a = a[:, x:x+nw]
        else:
            nh = int(round(w / 0.8)); y = int(round((h - nh) * 0.38)); a = a[y:y+nh]
        Image.fromarray(a.astype("uint8")).save(os.path.join(d, f), "JPEG", quality=88, optimize=True)
    print(f"  {slug}: x-{n:02d} recortado (texto fuera)")

print("Correcciones")
recrop("upper-lip-lift", 3); recrop("upper-lip-lift", 4)
move("facial-harmonization", 5, "upper-lip-lift")
for n in (6, 5, 4): drop("forehead-orbital", n)
drop("chin-jaw", 1)
merge("eyes-expression", 2, 3)
for s in (15, 9, 8): merge("feminization", 7, s)
drop("feminization", 10)
swap("feminization", 12, 1)
for s in (17, 13): merge("feminization", 2, s)
merge("rejuvenation", 5, 6)
merge("rejuvenation", 7, 8)
move("face-neck-lift", 1, "forehead-orbital", copy=True)
move("face-neck-lift", 1, "rhinoplasty")
merge("rhinoplasty", 9, 10)
merge("rhinoplasty", 11, 12)
for n in (23, 20, 18, 17, 14): drop("rhinoplasty", n)
move("rhinoplasty", 19, "upper-lip-lift")
merge("rhinoplasty", 24, 25)
drop("blepharoplasty", 1)
drop("body-remodeling", 2)
drop_angle("body-remodeling", 6, 1)
swap("body-remodeling", 6, 1)

# --- renumerar ---------------------------------------------------------------
for s in sorted(os.listdir(BASE)):
    d = os.path.join(BASE, s)
    if not os.path.isdir(d): continue
    for i, c in enumerate(cases(s), 1):
        shutil.move(os.path.join(d, c), os.path.join(d, f"_t{i:02d}"))
    for f in sorted(os.listdir(d)):
        if f.startswith("_t"): shutil.move(os.path.join(d, f), os.path.join(d, f"caso-{f[2:]}"))

print("\nEstado final")
for s in sorted(os.listdir(BASE)):
    d = os.path.join(BASE, s)
    if not os.path.isdir(d): continue
    cs = cases(s)
    print(f"  {s}: {len(cs)}" + (f"  [{', '.join(str(angles(os.path.join(d,c))) for c in cs)}]" if cs else ""))
