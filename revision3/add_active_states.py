# -*- coding: utf-8 -*-
"""Agrega estados :active a los elementos cursor-pointer del sitio.
Cada entrada es (buscar, reemplazar, veces_esperadas) — se verifica el conteo
real contra el esperado antes de guardar nada."""
import io

p = "src/App.jsx"
s = io.open(p, encoding="utf-8").read()

REPLACEMENTS = [
    # IconLink (redes sociales)
    ('rounded-full border border-[var(--line)] text-[var(--muted)] transition-all duration-200 hover:border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--surface)]`}',
     'rounded-full border border-[var(--line)] text-[var(--muted)] transition-all duration-200 hover:border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--surface)] active:scale-90`}', 1),
    # Stars (radio de calificacion)
    ('"cursor-pointer rounded p-0.5 transition-transform duration-150 hover:scale-110"',
     '"cursor-pointer rounded p-0.5 transition-transform duration-150 hover:scale-110 active:scale-95"', 1),
    # CarouselArrows + testimonios (mismo string, h-10 w-10, se repite 3 veces)
    ('"flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] transition-colors duration-200 hover:border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--surface)]"',
     '"flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] transition-colors duration-200 hover:border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--surface)] active:scale-90"', 3),
    # Fold (acordeon de prensa)
    ('"group flex w-full cursor-pointer items-center gap-5 py-7 text-left"',
     '"group flex w-full cursor-pointer items-center gap-5 py-7 text-left active:opacity-70"', 1),
    # Toggle de tema
    ('"flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] transition-colors duration-200 hover:border-[var(--ink)] hover:text-[var(--ink)]"',
     '"flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] transition-colors duration-200 hover:border-[var(--ink)] hover:text-[var(--ink)] active:scale-90"', 1),
    # Toggle de idioma
    ('"flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-[var(--line)] px-2.5 text-[10px] uppercase tracking-[0.14em] text-[var(--muted)] transition-colors duration-200 hover:border-[var(--ink)] hover:text-[var(--ink)]"',
     '"flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-[var(--line)] px-2.5 text-[10px] uppercase tracking-[0.14em] text-[var(--muted)] transition-colors duration-200 hover:border-[var(--ink)] hover:text-[var(--ink)] active:scale-95"', 1),
    # Logo del sidebar
    ('"group mb-8 block cursor-pointer text-left"',
     '"group mb-8 block cursor-pointer text-left active:opacity-70"', 1),
    # Item de nav con submenu
    ('className={`group flex w-full cursor-pointer items-center justify-between px-1 py-2 text-[13px] tracking-wide transition-colors duration-200 ${active === item.id',
     'className={`group flex w-full cursor-pointer items-center justify-between px-1 py-2 text-[13px] tracking-wide transition-colors duration-200 active:opacity-60 ${active === item.id', 1),
    # Item de submenu
    ('"group relative block w-full cursor-pointer py-1.5 text-left text-[12px] text-[var(--faint)] transition-colors duration-200 hover:text-[var(--ink)]"',
     '"group relative block w-full cursor-pointer py-1.5 text-left text-[12px] text-[var(--faint)] transition-colors duration-200 hover:text-[var(--ink)] active:opacity-60"', 1),
    # Item de nav sin submenu
    ('className={`group relative block w-full cursor-pointer px-1 py-2 text-left text-[13px] tracking-wide transition-colors duration-200 ${active === item.id',
     'className={`group relative block w-full cursor-pointer px-1 py-2 text-left text-[13px] tracking-wide transition-colors duration-200 active:opacity-60 ${active === item.id', 1),
    # Logo topbar movil
    ('<button onClick={() => scrollTo("home")} aria-label={t.a11y.home} className="flex cursor-pointer items-center gap-2">',
     '<button onClick={() => scrollTo("home")} aria-label={t.a11y.home} className="flex cursor-pointer items-center gap-2 active:opacity-70">', 1),
    # Hamburguesa
    ('<button onClick={() => setOpen(true)} aria-label={t.a11y.menu} className="cursor-pointer text-[var(--ink)]">',
     '<button onClick={() => setOpen(true)} aria-label={t.a11y.menu} className="cursor-pointer text-[var(--ink)] active:scale-90">', 1),
    # Cerrar menu movil (X)
    ('"absolute right-5 top-5 cursor-pointer text-[var(--muted)]"',
     '"absolute right-5 top-5 cursor-pointer text-[var(--muted)] active:scale-90"', 1),
    # Boton flotante volver arriba
    ('"fixed bottom-6 right-6 z-40 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] shadow-[0_8px_24px_var(--shadow)] transition-colors duration-200 hover:border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--surface)] sm:bottom-8 sm:right-8"',
     '"fixed bottom-6 right-6 z-40 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] shadow-[0_8px_24px_var(--shadow)] transition-colors duration-200 hover:border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--surface)] active:scale-90 sm:bottom-8 sm:right-8"', 1),
    # Cerrar lightbox
    ('"absolute right-5 top-5 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-200 hover:bg-white/20"',
     '"absolute right-5 top-5 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-200 hover:bg-white/20 active:scale-90"', 1),
    # CTA del hero
    ('"cursor-pointer border border-[var(--ink)] bg-[var(--surface)] px-9 py-4 font-sans text-[10px] uppercase text-[var(--ink)] shadow-[0_2px_14px_var(--shadow)] transition-colors duration-200 hover:bg-[var(--ink)] hover:text-[var(--surface)] sm:text-[11px]"',
     '"cursor-pointer border border-[var(--ink)] bg-[var(--surface)] px-9 py-4 font-sans text-[10px] uppercase text-[var(--ink)] shadow-[0_2px_14px_var(--shadow)] transition-colors duration-200 hover:bg-[var(--ink)] hover:text-[var(--surface)] active:scale-[0.97] sm:text-[11px]"', 1),
    # Flecha de scroll del hero
    ('"absolute bottom-8 left-1/2 z-10 flex h-11 w-11 -translate-x-1/2 cursor-pointer items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] transition-colors duration-200 hover:border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--surface)]"',
     '"absolute bottom-8 left-1/2 z-10 flex h-11 w-11 -translate-x-1/2 cursor-pointer items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] transition-colors duration-200 hover:border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--surface)] active:scale-90"', 1),
    # Fila de la lista de procedimientos
    ('"group flex w-full cursor-pointer items-center gap-4 py-4 text-left transition-colors duration-200"',
     '"group flex w-full cursor-pointer items-center gap-4 py-4 text-left transition-colors duration-200 active:opacity-70"', 1),
    # Boton "Consultar" (ficha escritorio)
    ('"mt-7 w-full cursor-pointer border border-[var(--ink)] bg-[var(--ink)] px-4 py-3 text-[10px] uppercase tracking-[0.16em] text-[var(--surface)] transition-opacity duration-200 hover:opacity-85"',
     '"mt-7 w-full cursor-pointer border border-[var(--ink)] bg-[var(--ink)] px-4 py-3 text-[10px] uppercase tracking-[0.16em] text-[var(--surface)] transition-opacity duration-200 hover:opacity-85 active:scale-[0.98]"', 1),
    # Boton "Ver resultados" (ficha escritorio)
    ('"mt-3 flex w-full cursor-pointer items-center justify-center gap-2 border border-[var(--line)] px-4 py-2.5 text-[10px] uppercase tracking-[0.16em] text-[var(--ink)] transition-colors duration-200 hover:border-[var(--ink)] hover:bg-[var(--chip)]"',
     '"mt-3 flex w-full cursor-pointer items-center justify-center gap-2 border border-[var(--line)] px-4 py-2.5 text-[10px] uppercase tracking-[0.16em] text-[var(--ink)] transition-colors duration-200 hover:border-[var(--ink)] hover:bg-[var(--chip)] active:scale-[0.98]"', 1),
    # Cerrar modal de procedimiento (movil)
    ('"absolute right-4 top-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] transition-colors duration-200 hover:border-[var(--ink)] hover:text-[var(--ink)]"',
     '"absolute right-4 top-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] transition-colors duration-200 hover:border-[var(--ink)] hover:text-[var(--ink)] active:scale-90"', 1),
    # Boton "Consultar" (modal movil)
    ('"mt-6 w-full cursor-pointer border border-[var(--ink)] bg-[var(--ink)] px-4 py-3 text-[10px] uppercase tracking-[0.16em] text-[var(--surface)] transition-opacity duration-200 hover:opacity-85"',
     '"mt-6 w-full cursor-pointer border border-[var(--ink)] bg-[var(--ink)] px-4 py-3 text-[10px] uppercase tracking-[0.16em] text-[var(--surface)] transition-opacity duration-200 hover:opacity-85 active:scale-[0.98]"', 1),
    # Boton "Ver resultados" (modal movil)
    ('"mt-3 flex w-full cursor-pointer items-center justify-center gap-2 border border-[var(--line)] px-4 py-2.5 text-[10px] uppercase tracking-[0.16em] text-[var(--ink)] transition-colors duration-200 hover:border-[var(--ink)]"',
     '"mt-3 flex w-full cursor-pointer items-center justify-center gap-2 border border-[var(--line)] px-4 py-2.5 text-[10px] uppercase tracking-[0.16em] text-[var(--ink)] transition-colors duration-200 hover:border-[var(--ink)] active:scale-[0.98]"', 1),
    # Select del filtro de resultados
    ('"w-full cursor-pointer appearance-none rounded-lg border-2 border-[var(--ink)] bg-[var(--ink)] py-3.5 pl-5 pr-12 font-display text-[19px] text-[var(--surface)] transition-opacity duration-200 hover:opacity-90 sm:text-[22px]"',
     '"w-full cursor-pointer appearance-none rounded-lg border-2 border-[var(--ink)] bg-[var(--ink)] py-3.5 pl-5 pr-12 font-display text-[19px] text-[var(--surface)] transition-opacity duration-200 hover:opacity-90 active:scale-[0.99] sm:text-[22px]"', 1),
    # Chip de caso (Caso 01, 02...)
    ('className={`flex-shrink-0 cursor-pointer rounded-full border px-4 py-1.5 text-[11px] uppercase tracking-[0.16em] transition-colors duration-200 ${',
     'className={`flex-shrink-0 cursor-pointer rounded-full border px-4 py-1.5 text-[11px] uppercase tracking-[0.16em] transition-colors duration-200 active:scale-95 ${', 1),
    # Flechas de navegacion de casos (resultados)
    ('"flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] transition-colors duration-200 hover:border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--surface)]"',
     '"flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] transition-colors duration-200 hover:border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--surface)] active:scale-90"', 2),
    # Thumbnail de angulo
    ('className={`relative h-16 w-16 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border transition-colors duration-200 ${',
     'className={`relative h-16 w-16 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border transition-colors duration-200 active:scale-95 ${', 1),
    # Link "Ver documento / publicacion" (papers)
    ('"group mt-6 flex cursor-pointer items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[var(--faint)] transition-colors duration-200 hover:text-[var(--ink)]"',
     '"group mt-6 flex cursor-pointer items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[var(--faint)] transition-colors duration-200 hover:text-[var(--ink)] active:opacity-60"', 1),
    # Enviar consulta (contacto)
    ('"cursor-pointer bg-[var(--contact-ink)] px-8 py-3.5 text-[11px] uppercase tracking-[0.22em] text-[var(--contact-bg)] transition-opacity duration-200 hover:opacity-85"',
     '"cursor-pointer bg-[var(--contact-ink)] px-8 py-3.5 text-[11px] uppercase tracking-[0.22em] text-[var(--contact-bg)] transition-opacity duration-200 hover:opacity-85 active:scale-[0.98]"', 1),
    # Logo del footer
    ('<button onClick={() => scrollTo("home")} aria-label={t.a11y.home} className="cursor-pointer text-left">',
     '<button onClick={() => scrollTo("home")} aria-label={t.a11y.home} className="cursor-pointer text-left active:opacity-70">', 1),
]

ok, fail = 0, []
for search, replacement, expected in REPLACEMENTS:
    n = s.count(search)
    if n != expected:
        fail.append((search[:70], expected, n))
        continue
    s = s.replace(search, replacement)
    ok += 1

print(f"{ok}/{len(REPLACEMENTS)} reemplazos aplicados")
if fail:
    print("FALLOS (conteo inesperado):")
    for f in fail:
        print(" ", f)
else:
    io.open(p, "w", encoding="utf-8").write(s)
    print("guardado")
