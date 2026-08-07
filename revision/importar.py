import os, shutil
from PIL import Image
SRC="revision/halves"; BASE="src/assets/procedimientos"; TARGET=4/5
# (slug, [(antes,despues), ...])  A = izquierda/arriba = antes ; B = derecha/abajo = despues
PLAN = {
 "feminization":      [[(5,6)], [(78,79),(80,81),(82,83)]],
 "rejuvenation":      [[(67,68),(69,70),(71,72)], [(74,75),(76,77)]],
 "facial-harmonization":[[(8,9),(10,11),(12,13)], [(84,85),(86,87),(88,89),(90,91),(92,93)]],
 "rhinoplasty":       [[(28,29),(30,31)], [(94,95),(96,97),(98,99)]],
 "breast":            [[(107,108),(109,110),(111,112),(113,114)], [(22,23)]],
 "body-remodeling":   [[(40,41),(42,43),(44,45)], [(103,104),(105,106)], [(24,25)]],
 "hair-implants":     [[(32,33),(34,35),(36,37),(38,39)]],
}
def crop(im, bias=0.38):
    w,h=im.size
    if w/h > TARGET:
        nw=int(round(h*TARGET)); x=(w-nw)//2; im=im.crop((x,0,x+nw,h))
    else:
        nh=int(round(w/TARGET)); y=int(round((h-nh)*bias)); im=im.crop((0,y,w,y+nh))
    if im.width>900: im=im.resize((900,1125), Image.LANCZOS)
    return im
for slug, cases in PLAN.items():
    existing=sorted([d for d in os.listdir(os.path.join(BASE,slug))
                     if os.path.isdir(os.path.join(BASE,slug,d))]) if os.path.isdir(os.path.join(BASE,slug)) else []
    n=len(existing)
    for c,angles in enumerate(cases, 1):
        n+=1
        d=os.path.join(BASE,slug,f"caso-{n:02d}")
        if os.path.isdir(d): shutil.rmtree(d)
        os.makedirs(d)
        for k,(a,b) in enumerate(angles,1):
            for tag,i in (("antes",a),("despues",b)):
                crop(Image.open(os.path.join(SRC,f"{i:03d}.jpg")).convert("RGB")) \
                    .save(os.path.join(d,f"{tag}-{k}.jpg"),"JPEG",quality=88,optimize=True)
        print(f"{slug}/caso-{n:02d}: {len(angles)} angulos")
