"""Genera public/og-image.jpg (1200x630): la misma composicion del wordmark
del hero (MDM + banda "MARCELO DI MAGGIO" + "surgery & team"), como imagen
estatica para que compartir el link muestre algo en vez de una tarjeta vacia.
"""
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
INK = (30, 36, 39)          # --ink
PAPER = (244, 244, 245)     # --bg
FAINT = (150, 156, 161)
ACCENT = (201, 166, 107)    # --accent en modo oscuro (contraste sobre fondo oscuro)

im = Image.new("RGB", (W, H), PAPER)
dr = ImageDraw.Draw(im)

mdm = ImageFont.truetype("revision3/ogfonts/playfair-500.ttf", 300)
band_font = ImageFont.truetype("revision3/ogfonts/inter-400.ttf", 42)
tag_font = ImageFont.truetype("revision3/ogfonts/inter-300.ttf", 26)
foot_font = ImageFont.truetype("revision3/ogfonts/inter-500.ttf", 20)

def spaced(txt, gap=" "):
    return gap.join(list(txt))

# --- MDM ---
mdm_txt = "MDM"
bbox = dr.textbbox((0, 0), mdm_txt, font=mdm)
mw, mh = bbox[2] - bbox[0], bbox[3] - bbox[1]
mx = (W - mw) / 2 - bbox[0]
my = 118 - bbox[1]
dr.text((mx, my), mdm_txt, font=mdm, fill=INK)

glyph_top, glyph_bottom = my + bbox[1], my + bbox[3]
glyph_h = glyph_bottom - glyph_top

# --- banda "MARCELO DI MAGGIO" ---
band_txt = spaced("MARCELO DI MAGGIO", "  ")
bb = dr.textbbox((0, 0), band_txt, font=band_font)
bw, bh = bb[2] - bb[0], bb[3] - bb[1]
band_cy = glyph_top + glyph_h * 0.545
band_h = 74
band_top = band_cy - band_h / 2
dr.rectangle([0, band_top, W, band_top + band_h], fill=PAPER)
by = band_top + band_h / 2 - bh / 2 - bb[1]
bx = (W - bw) / 2 - bb[0]
dr.text((bx, by), band_txt, font=band_font, fill=INK)

# --- "surgery & team" ---
tag_txt = spaced("surgery & team", " ")
tb = dr.textbbox((0, 0), tag_txt, font=tag_font)
tw, th = tb[2] - tb[0], tb[3] - tb[1]
ty = glyph_bottom + 6
dr.text(((W - tw) / 2 - tb[0], ty), tag_txt, font=tag_font, fill=FAINT)

# --- acento: una linea fina color bronce, el unico detalle de color de todo el sitio ---
line_y = ty + th + 46
dr.rectangle([W / 2 - 34, line_y, W / 2 + 34, line_y + 2], fill=ACCENT)

# --- pie: sedes ---
foot_txt = spaced("BUENOS AIRES", " ") + "   ·   " + spaced("CÓRDOBA", " ") + "   ·   " + spaced("MADRID", " ") + "   ·   " + spaced("NEW YORK", " ")
fb = dr.textbbox((0, 0), foot_txt, font=foot_font)
fw = fb[2] - fb[0]
dr.text(((W - fw) / 2 - fb[0], line_y + 26), foot_txt, font=foot_font, fill=FAINT)

im.save("public/og-image.jpg", quality=90)
print("public/og-image.jpg", im.size)
