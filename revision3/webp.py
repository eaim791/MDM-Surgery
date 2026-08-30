"""Convierte a WebP todas las imagenes que publica la web, cada una bajo 200 KB.

Los originales se copian antes a originales/pre-webp/ con la misma estructura. No se
toca nada de las carpetas DNT ni de src/assets/casos (material de trabajo que la web
no incluye), ni el icono de la pestana, que tiene que seguir siendo PNG.

Para cada foto se busca la mejor calidad que entre en 200 KB: primero se acota el lado
mayor y despues se baja la calidad por pasos. Los dibujos de linea de proc/ van en WebP
sin perdida, que ademas pesan menos que su PNG.
"""
import os, shutil, sys
from PIL import Image

TOPE = 200 * 1024
LADO = [1800, 1500, 1280, 1024]          # tope del lado mayor, en orden
CALIDADES = [82, 74, 66, 58, 50, 42]
COPIA = "originales/pre-webp"
FUENTES = (".jpg", ".jpeg", ".png")

def objetivos():
    """Rutas de las imagenes que la web publica."""
    for r, ds, fs in os.walk("src/assets/procedimientos"):
        partes = r.replace(os.sep, "/").split("/")
        if "DNT" in partes or len(partes) != 5:      # solo src/assets/procedimientos/<slug>/<caso>
            continue
        for f in fs:
            if os.path.splitext(f)[1].lower() in FUENTES:
                yield os.path.join(r, f), False
    for carpeta in ("src/assets/certificados", "src/assets/pappers"):
        for f in sorted(os.listdir(carpeta)):
            if os.path.splitext(f)[1].lower() in FUENTES:
                yield os.path.join(carpeta, f), False
    for f in sorted(os.listdir("src/assets/proc")):  # dibujos de linea: sin perdida
        if f.lower().endswith(".png"):
            yield os.path.join("src/assets/proc", f), True
    yield "src/assets/marcelodimaggio.jpg", False


def convertir(p, sin_perdida):
    im = Image.open(p)
    im = im.convert("RGBA" if (sin_perdida and "A" in im.getbands()) else "RGB")
    destino = os.path.splitext(p)[0] + ".webp"

    if sin_perdida:
        im.save(destino, "WEBP", lossless=True, method=6)
        return destino, os.path.getsize(destino), "lossless"

    for lado in LADO:
        chica = im
        if max(im.size) > lado:
            s = lado / max(im.size)
            chica = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
        for q in CALIDADES:
            chica.save(destino, "WEBP", quality=q, method=6)
            n = os.path.getsize(destino)
            if n <= TOPE:
                return destino, n, f"{chica.width}x{chica.height} q{q}"
    return destino, os.path.getsize(destino), "NO ENTRA"


def main():
    items = list(dict.fromkeys(objetivos()))
    print(f"{len(items)} imagenes\n")
    antes = despues = 0
    peores, fallos = [], []
    for i, (p, sin_perdida) in enumerate(items, 1):
        if not os.path.isfile(p):
            print("  falta", p)
            continue
        # copia de seguridad antes de tocar nada
        copia = os.path.join(COPIA, os.path.relpath(p))
        os.makedirs(os.path.dirname(copia), exist_ok=True)
        if not os.path.exists(copia):
            shutil.copy2(p, copia)

        viejo = os.path.getsize(p)
        destino, nuevo, como = convertir(p, sin_perdida)
        if como == "NO ENTRA":
            fallos.append((p, nuevo))
        if sin_perdida and nuevo > viejo:            # el PNG pesaba menos: se deja el WebP igual
            pass
        antes += viejo
        despues += nuevo
        if destino != p:
            os.remove(p)
        peores.append((nuevo, p))
        if i % 60 == 0:
            print(f"  {i}/{len(items)}", flush=True)

    print(f"\n{antes / 1e6:.1f} MB  ->  {despues / 1e6:.1f} MB  "
          f"({100 - despues * 100 / antes:.0f}% menos)")
    peores.sort(reverse=True)
    print("\nlas mas pesadas:")
    for n, p in peores[:6]:
        print(f"  {n / 1024:6.0f} KB  {p}")
    print(f"\nsin poder bajar de 200 KB: {len(fallos)}")
    for p, n in fallos:
        print(f"  {n / 1024:.0f} KB  {p}")


main()
