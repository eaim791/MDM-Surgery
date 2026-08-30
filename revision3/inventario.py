import os, collections

EXT = (".jpg", ".jpeg", ".png", ".webp", ".avif", ".heic", ".gif", ".bmp", ".tif", ".tiff", ".jfif")

tot, size, n, bytes_ = collections.Counter(), collections.Counter(), 0, 0
grandes = []
for base in ("src/assets", "public"):
    for r, ds, fs in os.walk(base):
        for f in fs:
            if os.path.splitext(f)[1].lower() not in EXT:
                continue
            p = os.path.join(r, f)
            s = os.path.getsize(p)
            g = r.replace(os.sep, "/")
            tot[g] += 1
            size[g] += s
            n += 1
            bytes_ += s
            if s > 200_000:
                grandes.append(s)

print(f"TOTAL {n} imagenes  {bytes_ / 1e6:.1f} MB   ({len(grandes)} pasan de 200 KB)\n")
agg, cnt = collections.Counter(), collections.Counter()
for g in tot:
    k = "/".join(g.split("/")[:3])
    agg[k] += size[g]
    cnt[k] += tot[g]
for k in sorted(agg, key=lambda x: -agg[x]):
    print(f"  {k:44s} {cnt[k]:4d}  {agg[k] / 1e6:7.1f} MB")

ext = collections.Counter()
for base in ("src/assets", "public"):
    for r, ds, fs in os.walk(base):
        for f in fs:
            e = os.path.splitext(f)[1].lower()
            if e in EXT:
                ext[e] += 1
print("\nextensiones:", dict(ext))
