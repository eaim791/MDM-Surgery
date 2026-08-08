import os, re, shutil
BASE = "src/assets/procedimientos"

def cdir(slug, case):
    return os.path.join(BASE, slug, case)

def angles(d):
    """Numero de angulos (pares antes/despues) en una carpeta de caso."""
    n = 0
    for f in os.listdir(d):
        m = re.match(r"antes-(\d+)\.", f)
        if m:
            n = max(n, int(m.group(1)))
    return n

def merge(slug, dst, src):
    """Suma los angulos de src al caso dst y elimina src."""
    dd, sd = cdir(slug, dst), cdir(slug, src)
    if not os.path.isdir(sd):
        print(f"  !! no existe {slug}/{src}"); return
    k = angles(dd)
    for i in range(1, angles(sd) + 1):
        k += 1
        for tag in ("antes", "despues"):
            shutil.move(os.path.join(sd, f"{tag}-{i}.jpg"), os.path.join(dd, f"{tag}-{k}.jpg"))
    shutil.rmtree(sd)
    print(f"  {slug}/{src} -> fusionado en {dst} (ahora {k} angulos)")

def move(src_slug, src_case, dst_slug):
    """Mueve un caso entero a otro procedimiento, al final."""
    sd = cdir(src_slug, src_case)
    if not os.path.isdir(sd):
        print(f"  !! no existe {src_slug}/{src_case}"); return
    d0 = os.path.join(BASE, dst_slug)
    os.makedirs(d0, exist_ok=True)
    n = len([x for x in os.listdir(d0) if os.path.isdir(os.path.join(d0, x))])
    dst = f"caso-{n+1:02d}"
    shutil.move(sd, os.path.join(d0, dst))
    print(f"  {src_slug}/{src_case} -> {dst_slug}/{dst}")
    return dst

def drop(slug, case):
    sd = cdir(slug, case)
    if os.path.isdir(sd):
        shutil.rmtree(sd); print(f"  {slug}/{case} -> descartado")

def renumber(slug):
    d0 = os.path.join(BASE, slug)
    if not os.path.isdir(d0): return
    cases = sorted([x for x in os.listdir(d0) if os.path.isdir(os.path.join(d0, x))])
    for i, c in enumerate(cases, 1):
        want = f"caso-{i:02d}"
        if c != want:
            shutil.move(os.path.join(d0, c), os.path.join(d0, "_tmp_" + want))
    for f in sorted(os.listdir(d0)):
        if f.startswith("_tmp_"):
            shutil.move(os.path.join(d0, f), os.path.join(d0, f[5:]))

print("Fusiones dentro de cada procedimiento")
merge("upper-lip-lift", "caso-01", "caso-03")
merge("upper-lip-lift", "caso-01", "caso-04")
merge("upper-lip-lift", "caso-01", "caso-05")
merge("upper-lip-lift", "caso-01", "caso-06")
merge("body-remodeling", "caso-06", "caso-07")
merge("rhinoplasty", "caso-03", "caso-04")
merge("rhinoplasty", "caso-05", "caso-06")
merge("rhinoplasty", "caso-05", "caso-07")
merge("feminization", "caso-02", "caso-04")
merge("feminization", "caso-05", "caso-06")
merge("eyes-expression", "caso-01", "caso-02")
merge("forehead-orbital", "caso-01", "caso-02")
merge("rejuvenation", "caso-01", "caso-04")
merge("cheeks", "caso-01", "caso-02")
merge("face-neck-lift", "caso-01", "caso-02")

print("Reclasificaciones")
move("cheeks", "caso-01", "rhinoplasty")          # pomulos era rinoplastia
move("blepharoplasty", "caso-01", "rhinoplasty")
move("blepharoplasty", "caso-02", "rhinoplasty")
move("face-neck-lift", "caso-01", "rhinoplasty")
move("hair-implants", "caso-02", "body-remodeling")
drop("hair-implants", "caso-03")                  # duplicado de frente y orbitas
move("rejuvenation", "caso-03", "forehead-orbital")

for s in sorted(os.listdir(BASE)):
    if os.path.isdir(os.path.join(BASE, s)):
        renumber(s)

print("\nEstado final")
for s in sorted(os.listdir(BASE)):
    d = os.path.join(BASE, s)
    if not os.path.isdir(d): continue
    cs = sorted([x for x in os.listdir(d) if os.path.isdir(os.path.join(d, x))])
    if cs:
        print(f"  {s}: {len(cs)} casos ({', '.join(str(angles(os.path.join(d,c))) for c in cs)} angulos)")
    else:
        print(f"  {s}: sin casos")
