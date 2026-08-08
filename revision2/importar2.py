import os, shutil, json
from PIL import Image
SRC="revision2/todo"; BASE="src/assets/procedimientos"
# (slug, [[(antes,despues), ...ANGULOS...], ...CASOS...])
PLAN = {
 "face-neck-lift": [[(6,7)], [(8,9)]],
 "rhinoplasty":    [[(46,47)], [(48,49)]],
 "feminization":   [[(44,45)]],
 "breast":         [[(1,3)]],
}
def add(slug, cases):
    d0=os.path.join(BASE,slug); os.makedirs(d0, exist_ok=True)
    n=len([x for x in os.listdir(d0) if os.path.isdir(os.path.join(d0,x))])
    for angles in cases:
        n+=1
        d=os.path.join(d0,f"caso-{n:02d}")
        if os.path.isdir(d): shutil.rmtree(d)
        os.makedirs(d)
        for k,(a,b) in enumerate(angles,1):
            for tag,i in (("antes",a),("despues",b)):
                shutil.copy(os.path.join(SRC,f"{i:04d}.jpg"), os.path.join(d,f"{tag}-{k}.jpg"))
        print(f"  {slug}/caso-{n:02d}: {len(angles)} angulo(s)")
for slug,cases in PLAN.items():
    print(slug); add(slug,cases)
