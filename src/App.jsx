import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion, useInView, useScroll, useTransform } from "framer-motion";
import {
  Menu, X, ChevronDown, ArrowDown, ArrowRight, ArrowLeft, Instagram, Linkedin,
  Facebook, Youtube, Check, Star, Play, Award, FileText, ZoomIn, Loader2, SlidersHorizontal,
} from "lucide-react";
import {
  SunIcon, MoonIcon, GlobeIcon, ObeliskIcon, SpireIcon, SkylineIcon, EnvelopeIcon, SealIcon,
} from "./icons.jsx";
import { UI } from "./i18n.js";
import heroVideo from "./assets/hero-bg.mp4";
import heroPoster from "./assets/hero-poster.webp";
import heroPosterMobile from "./assets/hero-mobile-poster.webp";
import marceloPhoto from "./assets/marcelodimaggio.webp";
import {
  PROCEDURES, PROCEDURES_WITH_CASES, AREAS, INCLUDED, LEAD, SPECIALISTS, ASSISTANTS,
  LOCATIONS, SEDES, TESTIMONIALS, casesFor, CERTIFICATES, PAPERS,
} from "./data.js";

/* --------------------------------- HELPERS -------------------------------- */

const XLogo = ({ size = 15 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const CONTACT_EMAIL = "info@mdmsurgery.com";
const INSTAGRAM_HANDLE = "@mdmsurgery";
const DEVELOPER_NAME = "Emma A.";
const DEVELOPER_PORTFOLIO_URL = "https://aimettaemma.vercel.app/";
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xnpaaroa";
const TEST_PAGE_SIZE = 2;
// Certificaciones internacionales que se ven de entrada; el resto queda plegado.
const CERTS_PREVIEW = 3;

async function submitToFormspree(payload) {
  const res = await fetch(FORMSPREE_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Formspree request failed");
}

// Full interviews playlist on the MDM Surgery YouTube channel
const INTERVIEWS_PLAYLIST = "https://www.youtube.com/watch?v=WjhflcAPAD0&list=PLfsFc_yQNZ7Y";

const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/mdm.marcelodimaggio",
  x: "https://x.com/DiMaggioM",
  youtube: "https://www.youtube.com/channel/UCQARmZLuKwdXnl_DW5AGLOA",
  instagram: "https://www.instagram.com/mdmsurgery/",
  linkedin: "https://www.linkedin.com/in/marcelo-di-maggio-72712323/",
};

const SOCIALS = [
  { key: "facebook", Icon: Facebook, label: "Facebook", href: SOCIAL_LINKS.facebook },
  { key: "x", Icon: XLogo, label: "X", href: SOCIAL_LINKS.x },
  { key: "youtube", Icon: Youtube, label: "YouTube", href: SOCIAL_LINKS.youtube },
  { key: "instagram", Icon: Instagram, label: "Instagram", href: SOCIAL_LINKS.instagram },
  { key: "linkedin", Icon: Linkedin, label: "LinkedIn", href: SOCIAL_LINKS.linkedin },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};
const container = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const heroFade = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};
/* La fotografia entra distinto del texto: se asienta desde un leve zoom en vez
   de subir desde abajo — "la camara se acomoda", no "el bloque sube". */
const settleIn = {
  hidden: { opacity: 0, scale: 1.06 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
};
/* Contenido que se lee horizontalmente (carruseles) entra desde el costado en
   vez de desde abajo, en la misma direccion en la que se recorre. */
const fadeSide = {
  hidden: { opacity: 0, x: 28 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: "easeOut" } },
};
/* Los titulos de seccion se descubren con una cortina (clip-path) en vez del
   fade+subida generico — mas lento, mas peso, distinto de todo lo demas. */
const titleReveal = {
  hidden: { clipPath: "inset(0 100% 0 0)" },
  visible: { clipPath: "inset(0 0% 0 0)", transition: { duration: 0.9, ease: [0.65, 0, 0.35, 1] } },
};

/* ------------------------------- COMPONENTS ------------------------------- */

/* Un mark por pais en vez del mismo pin generico repetido en las tarjetas.
   El obelisco representa a Argentina entera (Buenos Aires + Córdoba juntas). */
const countryIcon = (country) => {
  if (country.includes("Argentina")) return ObeliskIcon;
  if (country.includes("España")) return SpireIcon;
  return SkylineIcon;
};

/* Iniciales para el avatar circular de especialistas y asistentes — mismo
   patron que ya usan los testimonios, para que "persona" se resuelva igual
   en todo el sitio en vez de a veces con avatar y a veces solo texto. */
const initialsOf = (name) => {
  const words = name.replace(/^(Dra?\.)\s*/i, "").split(" ").filter(Boolean);
  return ((words[0]?.[0] ?? "") + (words[1]?.[0] ?? "")).toUpperCase();
};

function IconLink({ Icon, href = "#", label, small }) {
  const s = small ? "h-7 w-7" : "h-9 w-9";
  const external = /^https?:|^mailto:/.test(href);
  return (
    <a href={href} aria-label={label} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`${s} flex cursor-pointer items-center justify-center rounded-full border-[1.5px] border-[var(--rule)] text-[var(--muted)] transition-all duration-200 hover:border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--surface)] active:scale-90`}>
      <Icon size={small ? 12 : 15} strokeWidth={1.8} />
    </a>
  );
}

function Stars({ value, onChange, t, size = 15 }) {
  const interactive = typeof onChange === "function";
  const [hover, setHover] = useState(0);
  const shown = interactive && hover ? hover : value;
  const label = (n) => `${n} ${n === 1 ? t.test.star : t.test.starsN}`;

  if (!interactive) {
    return (
      <div className="flex gap-0.5" role="img" aria-label={label(value)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Star key={n} size={size} strokeWidth={2} aria-hidden="true"
            className={n <= value ? "fill-[var(--ink)] text-[var(--ink)]" : "text-[var(--muted)]"} />
        ))}
      </div>
    );
  }
  return (
    <div className="flex gap-1" role="radiogroup" aria-label={t.test.rating}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={label(n)}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
          onFocus={() => setHover(n)} onBlur={() => setHover(0)}
          className="cursor-pointer rounded p-0.5 transition-transform duration-150 hover:scale-110 active:scale-95">
          <Star size={20} strokeWidth={1.4}
            className={n <= shown ? "fill-[var(--ink)] text-[var(--ink)]" : "text-[var(--faint)]"} />
        </button>
      ))}
    </div>
  );
}

/* size se agrega en vez de pisar via cascada (dos clases de tamano con la
   misma especificidad no garantizan que la ultima gane) — el default se
   omite del todo cuando el que llama pide un tamano propio. */
const Eyebrow = ({ children, size }) => (
  <p className={`font-medium uppercase tracking-[0.3em] text-[var(--faint)] ${size ?? "text-[10px]"}`}>{children}</p>
);

const SectionTitle = ({ children, size }) => (
  <motion.h2 variants={titleReveal}
    className={`mt-3 font-display font-normal leading-tight text-[var(--ink)] ${size ?? "text-3xl sm:text-4xl"}`}>
    {children}
  </motion.h2>
);

/* Watermark for the case photos that were published without the MDM logo burned in.
   Deliberately faint — readable against the photo without competing with it. */
function Watermark({ size = "md" }) {
  const s = size === "lg"
    ? { pad: "px-6 py-4", mark: "text-5xl", name: "text-[11px]", tag: "text-[10px]" }
    : { pad: "px-4 py-2.5", mark: "text-3xl", name: "text-[7px]", tag: "text-[6px]" };
  return (
    <span aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-[7%] flex -translate-x-1/2 select-none flex-col items-center bg-white/10 text-white opacity-[0.55] mix-blend-luminosity backdrop-blur-[1px]"
      style={{ textShadow: "0 1px 3px rgba(0,0,0,0.35)" }}>
      <span className={`flex flex-col items-center ${s.pad}`}>
        <span className={`font-display font-normal leading-none tracking-[0.02em] ${s.mark}`}>MDM</span>
        <span className={`mt-1 uppercase leading-none tracking-[0.3em] ${s.name}`}>Marcelo Di Maggio</span>
        <span className={`mt-1 lowercase leading-none tracking-[0.42em] ${s.tag}`}>surgery &amp; team</span>
      </span>
    </span>
  );
}

/* La marca "MDM": la misma composicion del hero (la banda con "MARCELO DI MAGGIO"
   atravesando las letras, "surgery & team" mas fino debajo), reutilizada donde antes
   solo se repetia el texto "MDM" suelto — sidebar, loader, footer. El tamano se pasa
   en px via `size`; todo lo demas escala proporcional porque el dibujo es SVG. */
function Wordmark({ size = 48, tagline = true, className = "" }) {
  return (
    <span aria-hidden="true" className={`inline-block select-none ${className}`}>
      <span className="relative block" style={{ fontSize: size }}>
        <span className="font-display block font-normal leading-[0.85] tracking-[0.01em] text-[var(--ink)]">
          MDM
        </span>
        <span className="absolute inset-0 flex items-center" style={{ paddingTop: "5.02%" }}>
          <span className="block w-full bg-[var(--band)]" style={{ padding: "1% 0" }}>
            <svg viewBox="0 0 1000 70" className="block w-full overflow-visible">
              <text x="0" y="52" textLength="1000" lengthAdjust="spacing" fontSize="48"
                fontWeight="400" fill="var(--ink)" fontFamily="Inter, system-ui, sans-serif">
                MARCELO DI MAGGIO
              </text>
            </svg>
          </span>
        </span>
      </span>
      {tagline && (
        <svg viewBox="0 0 1000 50" className="mt-[1%] block overflow-visible"
          style={{ width: 0, minWidth: "100%" }}>
          <text x="0" y="36" textLength="1000" lengthAdjust="spacing" fontSize="32"
            fontWeight="300" fill="var(--faint)" fontFamily="Inter, system-ui, sans-serif">
            surgery &amp; team
          </text>
        </svg>
      )}
    </span>
  );
}

function CarouselArrows({ onPrev, onNext, prevLabel, nextLabel }) {
  const btn = "flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] transition-colors duration-200 hover:border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--surface)] active:scale-90";
  return (
    <div className="mt-6 flex justify-end gap-3">
      <button type="button" onClick={onPrev} aria-label={prevLabel} title={prevLabel} className={btn}>
        <ArrowLeft size={16} strokeWidth={1.5} />
      </button>
      <button type="button" onClick={onNext} aria-label={nextLabel} title={nextLabel} className={btn}>
        <ArrowRight size={16} strokeWidth={1.5} />
      </button>
    </div>
  );
}

/* --accent-soft/--accent en vez de --photo/--photo-ink: ese par se diseño
   como relleno de foto ausente, muy apagado a proposito — bien para un
   placeholder, pero las iniciales de especialistas y testimonios son
   contenido real que hay que poder leer, y se perdian contra el fondo con
   textura en modo claro. */
function PhotoBox({ label, className = "", textClass = "text-2xl" }) {
  return (
    <div className={`flex items-center justify-center bg-[var(--accent-soft)] ${className}`}>
      <span className={`font-display font-medium text-[var(--accent)] ${textClass}`}>{label}</span>
    </div>
  );
}

/* Bloque plegable para las tres partes de Trayectoria & Prensa. */
function Fold({ id, eyebrow, title, body, open, onToggle, children }) {
  // Este acordeon vive directo sobre el fondo con textura de la pagina (no
  // dentro de una tarjeta), asi que sus lineas usan --rule (una superposicion
  // semitransparente) en vez de --line (un gris plano): --rule mantiene el
  // mismo contraste relativo pase lo que pase detras; --line se lava contra
  // la textura.
  return (
    <div id={id} className="scroll-mt-24 border-b-[1.5px] border-[var(--rule)] last:border-0">
      <button type="button" onClick={onToggle} aria-expanded={open}
        className="group flex w-full cursor-pointer items-center gap-5 py-7 text-left active:opacity-70">
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-medium uppercase tracking-[0.3em] text-[var(--faint)]">{eyebrow}</span>
          <span className="mt-2 block font-display text-2xl font-normal leading-tight text-[var(--ink)] sm:text-3xl">{title}</span>
        </span>
        <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors duration-200 ${
          open ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--surface)]" : "border-[var(--rule)] text-[var(--muted)] group-hover:border-[var(--ink)]"}`}>
          <ChevronDown size={17} strokeWidth={1.9}
            className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="c" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: "easeOut" }}
            className="overflow-hidden">
            <div className="pb-10">
              <p className="max-w-2xl text-[14px] leading-relaxed text-[var(--muted)]">{body}</p>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Slogan({ text }) {
  // Driven by useInView rather than whileInView: whileInView latches its `once` flag inside
  // the observer effect, so a remount (StrictMode) or a fast scroll could leave the words
  // stuck at opacity 0. A ref-based check re-evaluates and can't strand the text invisible.
  const wrapRef = useRef(null);
  const textRef = useRef(null);
  const [scale, setScale] = useState(1);
  const reduce = useReducedMotion();
  const inView = useInView(wrapRef, { once: true, amount: 0.4 });
  const show = inView || reduce;

  // El slogan tiene que entrar siempre en un solo renglon, en cualquier
  // idioma y cualquier ancho de pantalla — en vez de adivinar un tamano de
  // fuente que a veces alcanza y a veces no, se mide el ancho real del texto
  // contra el espacio disponible y se achica lo justo y necesario.
  useEffect(() => {
    const fit = () => {
      const text_ = textRef.current, wrap = wrapRef.current;
      if (!text_ || !wrap) return;
      // transform: scale() no afecta el layout — scrollWidth ya da el ancho
      // real del texto sin escalar, no hace falta "deshacer" nada.
      setScale(Math.min(1, wrap.clientWidth / text_.scrollWidth));
    };
    fit();
    // La tipografia (Playfair Display Italic) carga async — si fit() mide
    // antes de que termine de cargar, lo hace con las metricas de la fuente
    // de reemplazo, mas angosta, y el numero queda corto una vez que la
    // fuente real entra (el texto se pasa de largo en movil, que es donde
    // menos margen hay). Se vuelve a medir en cuanto las fuentes confirman
    // que cargaron.
    document.fonts?.ready?.then(fit);
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  // Cada palabra se desenfoca desde un poco de blur y sube en fila — un
  // gesto propio, distinto del resto del sitio (nada mas usa blur).
  const word = {
    hidden: { opacity: 0, y: 10, filter: "blur(6px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
  };
  const words = text.split(" ");

  // Ya no es una cita chica entre dos filetes al final de una seccion: es su
  // propia pausa a todo el ancho, con fondo propio, entre Qué hacemos y Equipo.
  return (
    <section aria-hidden="true" className="overflow-hidden bg-[var(--chip)] py-20 sm:py-28">
      <div ref={wrapRef} className="mx-auto max-w-5xl px-6">
        <motion.p
          ref={textRef}
          initial="hidden"
          animate={show ? "visible" : "hidden"}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
          // scale via el prop corto de motion, no style={{transform:`scale(${scale})`}}:
          // motion.p reescribe su propio transform en cada frame, asi que un transform
          // manual se perdia (texto vuelto a su ancho real, roto en movil).
          style={{ scale }}
          // Una sola linea forzada solo desde sm: en movil, si el calculo por
          // JS llegara a fallar (carrera con la carga de fuente, texto muy
          // largo en otro idioma, etc.), el texto envuelve en vez de
          // desbordar la pantalla — mejor una segunda linea que un corte.
          className="origin-center whitespace-normal text-center font-display italic text-[34px] font-normal leading-snug text-[var(--ink)] sm:whitespace-nowrap sm:text-[44px]"
        >
          {words.map((w, i) => (
            <motion.span key={i} variants={word} className="inline-block">
              {w}
              {i < words.length - 1 ? " " : ""}
            </motion.span>
          ))}
        </motion.p>
      </div>
    </section>
  );
}


function ScrollSideDecor() {
  return (
    <>
    </>
  );
}

/* ---------------------------------- APP ----------------------------------- */

export default function App() {
  const [open, setOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState(() => new Set());
  const [active, setActive] = useState("home");
  const [theme, setTheme] = useState(() => localStorage.getItem("mdm-theme") || "light");
  const [lang, setLang] = useState(() => localStorage.getItem("mdm-lang") || "es");
  const [activeSlug, setActiveSlug] = useState(PROCEDURES_WITH_CASES[0]?.slug);
  const [activeCase, setActiveCase] = useState(0);
  const [activeAngle, setActiveAngle] = useState(0);
  const [cForm, setCForm] = useState({ name: "", email: "", msg: "", proc: "" });
  const [cSent, setCSent] = useState(false);
  const [cSubmitting, setCSubmitting] = useState(false);
  const [cErr, setCErr] = useState("");
  const [testPage, setTestPage] = useState(0);
  const [lightbox, setLightbox] = useState(null);
  const [igHint, setIgHint] = useState(null);
  const [filterPulseKey, setFilterPulseKey] = useState(0);
  const [fabMsgOn, setFabMsgOn] = useState(false);
  const [fabMsgIndex, setFabMsgIndex] = useState(0);
  const papersRef = useRef(null);
  const casesRef = useRef(null);
  const [certsOpen, setCertsOpen] = useState(false);
  const [fold, setFold] = useState(null);
  const [pastHero, setPastHero] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const reduce = useReducedMotion();
  // El listado de procedimientos queda "trabado" en pantalla mientras el riel
  // horizontal recorre todos los procedimientos con el scroll vertical, y
  // recien despues sigue el scroll normal hacia Resultados. El wrapper mide
  // mas alto que la pantalla — ese sobrante es lo que, al scrollear, empuja
  // el riel (position: sticky adentro) de derecha a izquierda o viceversa.
  const procWrapRef = useRef(null);
  const procStickyRef = useRef(null);
  const procViewportRef = useRef(null);
  const procRailRef = useRef(null);
  const [procPanDistance, setProcPanDistance] = useState(0);
  const [procStickyHeight, setProcStickyHeight] = useState(0);
  useEffect(() => {
    // El wrapper tiene que medir exactamente lo que el contenido fijo ocupa
    // mas lo que hay que scrollear para el paneo — antes usaba min-h-screen
    // como supuesto, y si las tarjetas (con texto e idioma variable) quedaban
    // mas bajas que la pantalla, el pin seguia sosteniendose sobre espacio
    // vacio antes de soltar, y el subtitulo de abajo se sentia "lejos" de las
    // tarjetas aunque el margen entre ambos fuera chico.
    const measure = () => {
      const rail = procRailRef.current, viewport = procViewportRef.current, sticky = procStickyRef.current;
      if (!rail || !viewport || !sticky) return;
      setProcPanDistance(Math.max(0, rail.scrollWidth - viewport.clientWidth));
      setProcStickyHeight(sticky.offsetHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [lang]);
  const { scrollYProgress: procScroll } = useScroll({ target: procWrapRef, offset: ["start start", "end end"] });
  const procX = useTransform(procScroll, [0, 1], [0, -procPanDistance]);
  const [loading, setLoading] = useState(true);
  const t = UI[lang];

  // El globo del CTA flotante aparece 2s, se esconde 15s y vuelve — cambiando
  // de frase cada vez — para no ser invasivo pero seguir recordando que ahi
  // se puede consultar. Con motion reducido queda fijo, sin ciclo.
  const fabVisible = pastHero && active !== "contact";
  useEffect(() => {
    if (!fabVisible) { setFabMsgOn(false); return; }
    if (reduce) { setFabMsgOn(true); return; }
    let timer;
    let showing = false;
    const tick = () => {
      showing = !showing;
      if (showing) setFabMsgIndex((i) => (i + 1) % t.contact.fabMessages.length);
      setFabMsgOn(showing);
      timer = setTimeout(tick, showing ? 2200 : 15000);
    };
    timer = setTimeout(tick, 1200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fabVisible, reduce]);

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), reduce ? 0 : 850);
    return () => clearTimeout(id);
  }, [reduce]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("mdm-theme", theme);
  }, [theme]);

  // The 1.3s delay is only for the first page load; afterwards the arrow
  // reappears immediately when scrolling back up.
  useEffect(() => {
    const id = setTimeout(() => setIntroDone(true), 1800);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.55);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem("mdm-lang", lang);
  }, [lang]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => { if (e.key === "Escape") setLightbox(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  // The "visit our Instagram" note next to a procedure without photos: it fades out on
  // the next mouse move (after a short grace period, so the click itself doesn't kill it),
  // on scroll, or on its own after a few seconds.
  useEffect(() => {
    if (!igHint) return;
    const dismiss = () => setIgHint(null);
    const timeout = setTimeout(dismiss, 5000);
    const arm = setTimeout(() => {
      window.addEventListener("pointermove", dismiss, { once: true });
      window.addEventListener("scroll", dismiss, { once: true, passive: true });
      window.addEventListener("keydown", dismiss, { once: true });
    }, 700);
    return () => {
      clearTimeout(timeout);
      clearTimeout(arm);
      window.removeEventListener("pointermove", dismiss);
      window.removeEventListener("scroll", dismiss);
      window.removeEventListener("keydown", dismiss);
    };
  }, [igHint]);

  const scrollTo = (id, closeMenu = true) => {
    // Las tres partes de Trayectoria & Prensa son plegables: al elegirlas en el
    // nav se abre la que corresponde y se cierran las otras.
    const esPliegue = id === "interviews" || id === "certs" || id === "papers";
    if (esPliegue) setFold(id);
    const ir = () => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    };
    // si se despliega un bloque, se espera a que crezca antes de posicionar
    if (esPliegue) setTimeout(ir, 60); else ir();
    if (closeMenu) setOpen(false);
  };

  const askAbout = (label, slug) => {
    setCForm((f) => ({ ...f, msg: t.contact.template.replace("{p}", label), proc: slug ?? f.proc }));
    setCErr("");
    setTimeout(() => {
      scrollTo("contact");
      const el = document.getElementById("contact-msg");
      if (el) el.focus({ preventScroll: true });
    }, 30);
  };

  const submitEnquiry = async (e) => {
    e.preventDefault();
    if (!cForm.name.trim() || !cForm.email.trim() || !cForm.msg.trim()) { setCErr(t.contact.required); return; }
    setCErr("");
    setCSubmitting(true);
    try {
      const chosenProc = PROCEDURES.find((p) => p.slug === cForm.proc);
      await submitToFormspree({
        form: "contact", name: cForm.name.trim(), email: cForm.email.trim(), message: cForm.msg.trim(),
        // El procedimiento es opcional — solo se manda si se eligio uno, para
        // no dejar una linea vacia "Procedimiento: " en cada mail.
        ...(chosenProc ? { procedure: chosenProc[lang].name } : {}),
        // _subject e _replyto son campos especiales que Formspree reconoce:
        // sin esto el asunto queda generico ("New submission from mdmsurgery")
        // y no se distingue de una notificacion automatica cualquiera. Con el
        // nombre real en el asunto, se nota que es una consulta de alguien.
        _subject: `Consulta web de ${cForm.name.trim()}`,
        _replyto: cForm.email.trim(),
      });
      setCSent(true);
      setCForm({ name: "", email: "", msg: "", proc: "" });
    } catch {
      setCErr(t.contact.sendError);
    } finally {
      setCSubmitting(false);
    }
  };

  // Horizontal carousels advance one card at a time (card width + the flex gap)
  const scrollCarousel = (ref, dir) => {
    const el = ref.current;
    if (!el) return;
    const card = el.firstElementChild;
    const step = card ? card.getBoundingClientRect().width + 20 : el.clientWidth * 0.9;
    el.scrollBy({ left: dir * step, behavior: reduce ? "auto" : "smooth" });
  };

  const goToResult = (slug) => {
    if (casesFor(slug).length === 0) { setIgHint(slug); return; }
    setActiveSlug(slug);
    setActiveCase(0);
    setActiveAngle(0);
    setTimeout(() => {
      const el = document.getElementById(`res-${slug}`);
      if (el) el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
      else scrollTo("resultados");
    }, 60);
    // Resalta el selector de procedimiento al llegar, para que quede claro
    // que tambien se puede cambiar de procedimiento desde ahi mismo.
    setTimeout(() => setFilterPulseKey((k) => k + 1), reduce ? 100 : 500);
  };

  const NAV = [
    { id: "home", label: t.nav.home },
    { id: "areas", label: t.nav.areas },
    { id: "procedures", label: t.nav.procedures },
    { id: "resultados", label: t.nav.resultados },
    { id: "team", label: t.nav.team, submenu: [
        { id: "dr-di-maggio", label: t.sub.lead },
        { id: "surgical-team", label: t.sub.team },
        { id: "assistants", label: t.sub.assistants },
      ] },
    { id: "press", label: t.nav.press, submenu: [
        { id: "interviews", label: t.nav.interviews },
        { id: "certs", label: t.nav.certs },
        { id: "papers", label: t.nav.papers },
      ] },
    { id: "testimonios", label: t.nav.testimonios },
    { id: "locations", label: t.nav.locations },
    { id: "contact", label: t.nav.contact },
  ];

  useEffect(() => {
    const ids = ["home", "areas", "procedures", "resultados", "team", "press", "testimonios", "locations", "contact"];
    const subParent = {
      "dr-di-maggio": "team", "surgical-team": "team", "assistants": "team",
      "interviews": "press", "certs": "press", "papers": "press",
    };
    const subs = Object.keys(subParent);
    const ob = new IntersectionObserver(
      (es) => es.forEach((e) => {
        if (!e.isIntersecting) return;
        if (ids.includes(e.target.id)) setActive(e.target.id);
        else if (subParent[e.target.id]) setActive(subParent[e.target.id]);
      }),
      { rootMargin: "-40% 0px -55% 0px" }
    );
    [...ids, ...subs].forEach((id) => {
      const el = document.getElementById(id);
      if (el) ob.observe(el);
    });
    return () => ob.disconnect();
  }, []);

  const Toggles = ({ compact }) => (
    <div className={`flex items-center gap-2 ${compact ? "" : "mt-4"}`}>
      <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        aria-label={t.a11y.theme} title={t.a11y.theme}
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] transition-colors duration-200 hover:border-[var(--ink)] hover:text-[var(--ink)] active:scale-90">
        {theme === "dark" ? <SunIcon size={14} strokeWidth={1.9} /> : <MoonIcon size={14} strokeWidth={1.9} />}
      </button>
      <button onClick={() => setLang(lang === "es" ? "en" : "es")}
        aria-label={t.a11y.lang} title={t.a11y.lang}
        className="flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-[var(--line)] px-2.5 text-[10px] uppercase tracking-[0.14em] text-[var(--muted)] transition-colors duration-200 hover:border-[var(--ink)] hover:text-[var(--ink)] active:scale-95">
        <GlobeIcon size={13} strokeWidth={1.9} />
        {lang === "es" ? "ES" : "EN"}
      </button>
    </div>
  );

  const Sidebar = (
    <div className="flex h-full flex-col">
      <button onClick={() => scrollTo("home")} aria-label={t.a11y.home}
        className="group mb-5 block cursor-pointer text-left active:opacity-70">
        <Wordmark size={32} />
        <span className="mt-2 block h-px w-0 bg-[var(--ink)] transition-all duration-300 group-hover:w-10" />
      </button>

      <Toggles />

      {/* Sin flex-1: que la lista de sedes quede pegada a la nav en vez de
          empujada al fondo del panel, que en el drawer movil (h-screen) dejaba
          un vacio enorme en el medio. */}
      <nav className="mt-6 space-y-0.5">
        {NAV.map((item) => item.submenu ? (
          <div key={item.id}>
            <button onClick={() => {
                setOpenSubmenus((prev) => {
                  const next = new Set(prev);
                  next.has(item.id) ? next.delete(item.id) : next.add(item.id);
                  return next;
                });
                scrollTo(item.id, false);
              }}
              className={`group flex w-full cursor-pointer items-center justify-between px-1 py-2 text-[13px] tracking-wide transition-colors duration-200 active:opacity-60 ${active === item.id ? "font-medium text-[var(--ink)]" : "text-[var(--muted)] hover:text-[var(--ink)]"}`}>
              <span className="relative">
                {item.label}
                <span className={`absolute left-0 -bottom-0.5 h-px bg-[var(--accent)] transition-all duration-300 ${active === item.id ? "w-6" : "w-0 group-hover:w-6"}`} />
              </span>
              <ChevronDown size={14} className={`transition-transform duration-300 ${openSubmenus.has(item.id) ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence initial={false}>
              {openSubmenus.has(item.id) && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="overflow-hidden">
                  <div className="ml-3 mt-1 space-y-0.5 border-l border-[var(--line)] pl-3">
                    {item.submenu.map((s) => (
                      <button key={s.id} onClick={() => scrollTo(s.id)}
                        className="group relative block w-full cursor-pointer py-1.5 text-left text-[12px] text-[var(--faint)] transition-colors duration-200 hover:text-[var(--ink)] active:opacity-60">
                        {s.label}
                        <span className="absolute left-0 bottom-0 h-px w-0 bg-[var(--ink)] transition-all duration-300 group-hover:w-4" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <button key={item.id} onClick={() => scrollTo(item.id)}
            className={`group relative block w-full cursor-pointer px-1 py-2 text-left text-[13px] tracking-wide transition-colors duration-200 active:opacity-60 ${active === item.id ? "font-medium text-[var(--ink)]" : "text-[var(--muted)] hover:text-[var(--ink)]"}`}>
            {item.label}
            <span className={`absolute left-1 -bottom-0.5 h-px bg-[var(--accent)] transition-all duration-300 ${active === item.id ? "w-6" : "w-0 group-hover:w-6"}`} />
          </button>
        ))}
      </nav>

      {/* lg:mt-auto: en el sidebar fijo de escritorio (h-screen) esto empuja
          las sedes al fondo real, como pedido — pero solo a partir de lg,
          para no repetir el vacio enorme que este mismo empuje causaba en el
          drawer movil, mas bajo y ya compacto de por si. */}
      <div className="mt-5 border-t border-[var(--line)] pt-4 lg:mt-auto">
        <ul className="space-y-0.5 text-[11px] leading-relaxed text-[var(--faint)]">
          {SEDES.map((s) => <li key={s}>{s}</li>)}
        </ul>
      </div>
    </div>
  );

  /* Sin bg propio: el fondo (y la textura de body::before) vienen de html/body,
     para que la textura se vea a traves de este contenedor en vez de quedar tapada. */
  return (
    <div className="min-h-screen font-sans text-[var(--muted)] antialiased transition-colors duration-300">
      <style>{`
        .font-display { font-family: 'Playfair Display', Georgia, serif; }
        .font-sans { font-family: 'Inter', system-ui, sans-serif; }
      `}</style>

      <AnimatePresence>
        {loading && (
          <motion.div key="loader" exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.4, ease: "easeInOut" }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-[var(--bg)]">
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduce ? 0 : 0.4, ease: "easeOut" }} className="flex flex-col items-center">
              <Wordmark size={64} />
              <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                transition={{ duration: reduce ? 0 : 0.5, ease: "easeInOut", delay: reduce ? 0 : 0.15 }}
                className="mt-4 h-px w-14 origin-center bg-[var(--ink)]" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ScrollSideDecor />

      {/* Sidebar — always visible on desktop */}
      {/* no-scrollbar: en Windows con la barra clasica (no overlay) cualquier
          contenedor overflow-y-auto que llegue a necesitar aunque sea 1px de
          scroll (por redondeo en alguna altura de ventana puntual) dibuja una
          barra visible al costado — se ve como un bug aunque el contenido
          entre bien en casi todos los casos. Sigue siendo scrolleable con
          rueda/trackpad, solo se le esconde el track. */}
      <aside className="no-scrollbar fixed left-0 top-0 z-30 hidden h-screen w-60 overflow-y-auto border-r border-[var(--line)] bg-[var(--surface)] px-7 py-8 lg:block">
        {Sidebar}
      </aside>

      {/* Mobile topbar */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-[var(--line)] bg-[var(--surface)] px-5 py-3.5 lg:hidden">
        <button onClick={() => scrollTo("home")} aria-label={t.a11y.home} className="flex cursor-pointer items-center gap-2 active:opacity-70">
          <Wordmark size={30} tagline={false} />
          <span className="text-[9px] uppercase tracking-[0.22em] text-[var(--faint)]">Surgery</span>
        </button>
        <div className="flex items-center gap-2">
          <Toggles compact />
          <button onClick={() => setOpen(true)} aria-label={t.a11y.menu} className="cursor-pointer text-[var(--ink)] active:scale-90">
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-black/40 lg:hidden" />
            <motion.aside initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="no-scrollbar fixed left-0 top-0 z-50 h-screen w-72 overflow-y-auto bg-[var(--surface)] px-7 py-8 lg:hidden">
              <button onClick={() => setOpen(false)} aria-label={t.a11y.close}
                className="absolute right-5 top-5 cursor-pointer text-[var(--muted)] active:scale-90">
                <X size={20} />
              </button>
              {Sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Floating consultation CTA — hidden en el hero y tambien en la propia
          seccion de Contacto, donde ya estas viendo el formulario que promete.
          El globo aparece 2s como si saliera del sobre (escala chica y
          pegado al boton, hacia su tamano y posicion final) y se esconde 15s,
          cambiando de frase cada vez que vuelve. En escritorio el boton
          tambien crece un poco; en movil el tamano ya estaba bien. */}
      <motion.div initial={false}
        animate={{ opacity: fabVisible ? 1 : 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        style={{ pointerEvents: fabVisible ? "auto" : "none" }}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 sm:bottom-8 sm:right-8">
        <motion.span aria-hidden="true"
          initial={false}
          animate={fabMsgOn ? { opacity: 1, scale: 1, x: 0 } : { opacity: 0, scale: 0.25, x: 26 }}
          transition={reduce ? { duration: 0 } : { duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
          style={{ transformOrigin: "right center" }}
          className="whitespace-nowrap rounded-full bg-[var(--ink)] px-3.5 py-2 text-[11px] text-[var(--surface)] shadow-[0_4px_14px_var(--shadow)]">
          {t.contact.fabMessages[fabMsgIndex]}
        </motion.span>
        <button type="button" onClick={() => scrollTo("contact")}
          aria-label={t.contact.cta} title={t.contact.cta} aria-hidden={!fabVisible}
          className="flex h-12 w-12 flex-shrink-0 cursor-pointer items-center justify-center rounded-full border border-[var(--accent)]/45 bg-[var(--surface)] text-[var(--accent)] shadow-[0_8px_24px_var(--shadow)] transition-colors duration-200 hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--surface)] active:scale-90 sm:h-14 sm:w-14">
          <EnvelopeIcon size={18} strokeWidth={1.9} className="sm:hidden" />
          <EnvelopeIcon size={22} strokeWidth={1.8} className="hidden sm:block" />
        </button>
      </motion.div>

      {/* Lightbox — certificates & papers */}
      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[100] flex cursor-zoom-out items-center justify-center bg-black/85 p-6">
            <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex max-h-full max-w-full cursor-zoom-out">
              <img src={lightbox.src} alt={lightbox.alt}
                className="max-h-full max-w-full rounded-lg object-contain shadow-2xl" />
              {lightbox.watermark && <Watermark size="lg" />}
            </motion.div>
            <button onClick={() => setLightbox(null)} aria-label={t.a11y.close}
              className="absolute right-5 top-5 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-200 hover:bg-white/20 active:scale-90">
              <X size={20} strokeWidth={1.5} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="lg:pl-60">
        {/* ============ HERO ============ */}
        {/* El hero ya no centra el texto: el bloque se ancla abajo a la izquierda,
            el video respira del lado derecho. Rompe la composicion mas predecible
            que existe (todo centrado) sin sacar el video ni el scrim. */}
        <section id="home" className="relative flex min-h-screen w-full items-center overflow-hidden px-6 pb-24 pt-28 lg:items-end lg:px-10 lg:pb-28 lg:pt-24">
          {/* Background video — scoped to this section, sits inside main's lg:pl-60 so it never covers the sidebar */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            {/* poster nativo no permite recorte responsivo (retrato en movil,
                horizontal en escritorio) — en su lugar, dos imagenes fijas en
                la misma posicion que el video: en conexiones lentas evitan el
                fondo en blanco antes de que cargue el primer frame, y el
                video (opaco en cuanto pinta) las tapa solo sin JS extra. */}
            <img src={heroPosterMobile} alt="" aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover md:hidden" />
            <img src={heroPoster} alt="" aria-hidden="true"
              className="absolute inset-0 hidden h-full w-full object-cover md:block" />
            {/* One video for every breakpoint — it is framed to survive the portrait crop.
                With prefers-reduced-motion it stays on its first frame instead of looping. */}
            <video
              className="absolute inset-0 h-full w-full object-cover"
              src={heroVideo}
              autoPlay={!reduce}
              loop={!reduce}
              muted
              playsInline
              preload="auto"
              tabIndex={-1}
            />

            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 68% 75% at 30% 62%, var(--scrim-core) 0%, var(--scrim-core) 50%, var(--scrim-edge) 100%)",
              }}
            />
          </div>

          <motion.div initial="hidden" animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: reduce ? 0 : 0.12, delayChildren: 0.1 } } }}
            className="relative z-10 w-full max-w-3xl text-center lg:text-left">
            <div className="flex justify-center lg:justify-start">
              <div className="inline-block">
                <div className="relative">
                  <motion.h1 variants={heroFade}
                    className="hero-mark font-display font-normal leading-[0.85] tracking-[0.01em] text-[var(--ink)]"
                    style={{ fontSize: "clamp(4.5rem, 16vw, 11rem)" }}>
                    <span className="sr-only">Marcelo Di Maggio — Surgery &amp; Team</span>
                    <span aria-hidden="true">MDM</span>
                  </motion.h1>
                  <motion.div variants={heroFade} aria-hidden="true"
                    className="absolute inset-0 flex items-center" style={{ paddingTop: "5.02%" }}>
                    {/* Mascara con fade en los bordes: sin esto el rectangulo de la banda
                        se ve pegado encima de la foto, como una etiqueta y no como parte
                        del mismo diseño. */}
                    <div className="w-full bg-[var(--band)] py-[1%]"
                      style={{
                        WebkitMaskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
                        maskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
                      }}>
                      <svg viewBox="0 0 1000 70" className="block w-full overflow-visible">
                        <text x="0" y="52" textLength="1000" lengthAdjust="spacing" fontSize="48"
                          fontWeight="400" fill="var(--ink)" fontFamily="Inter, system-ui, sans-serif">
                          MARCELO DI MAGGIO
                        </text>
                      </svg>
                    </div>
                  </motion.div>
                </div>
                <motion.svg variants={heroFade} aria-hidden="true" viewBox="0 0 1000 50"
                  className="mt-[1%] block overflow-visible" style={{ width: 0, minWidth: "100%" }}>
                  <text x="0" y="36" textLength="1000" lengthAdjust="spacing" fontSize="32"
                    fontWeight="300" fill="var(--faint)" fontFamily="Inter, system-ui, sans-serif">
                    surgery &amp; team
                  </text>
                </motion.svg>
              </div>
            </div>

            <motion.p variants={heroFade} className="hero-text mx-auto mt-10 max-w-lg text-[17px] font-normal leading-relaxed text-[var(--hero-body)] sm:text-[19px] lg:mx-0">
              {t.hero.intro}
            </motion.p>
            <motion.div variants={heroFade} className="mt-9">
              {/* La unica accion del sitio con esta interaccion: la flecha vive oculta
                  a la izquierda del texto y entra en escena solo en este boton.
                  Relleno solido en --accent: es la unica accion de conversion real
                  del hero y antes competia mal, en outline fino, contra la foto. */}
              <button onClick={() => scrollTo("contact")}
                className="group inline-flex cursor-pointer items-center gap-0 border border-[var(--accent)] bg-[var(--accent)] px-9 py-4 font-sans text-[10px] font-medium uppercase text-[var(--surface)] shadow-[0_4px_20px_var(--shadow)] transition-opacity duration-200 hover:opacity-90 active:scale-[0.97] sm:text-[11px]"
                style={{ letterSpacing: "0.28em" }}>
                <ArrowRight size={13} strokeWidth={1.8}
                  className="w-0 flex-shrink-0 -translate-x-2 text-[var(--surface)] opacity-0 transition-all duration-300 ease-out group-hover:w-[15px] group-hover:translate-x-0 group-hover:opacity-100 group-hover:mr-2.5" />
                {t.hero.cta}
              </button>
            </motion.div>
          </motion.div>

          <motion.button onClick={() => scrollTo("areas")} aria-label={t.hero.arrow}
            initial={{ opacity: 0 }}
            animate={{ opacity: pastHero ? 0 : 1 }}
            transition={{ duration: 0.4, delay: pastHero || introDone ? 0 : 1.3 }}
            style={{ pointerEvents: pastHero ? "none" : "auto" }}
            aria-hidden={pastHero}
            className="absolute bottom-8 left-1/2 z-10 flex h-11 w-11 -translate-x-1/2 cursor-pointer items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] transition-colors duration-200 hover:border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--surface)] active:scale-90 lg:left-auto lg:right-10 lg:translate-x-0">
            <motion.span animate={reduce ? {} : { y: [0, 4, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}>
              <ArrowDown size={17} strokeWidth={1.5} />
            </motion.span>
          </motion.button>
        </section>

        <div className="mx-auto max-w-5xl px-6 pb-20 sm:px-10 xl:max-w-6xl 2xl:max-w-7xl">
          {/* ============ AREAS ============ */}
          <section id="areas" className="scroll-mt-24 pt-24">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
              <Eyebrow>{t.areas.eyebrow}</Eyebrow>
              <SectionTitle>{t.areas.title}</SectionTitle>
              <p className="mt-5 max-w-2xl text-[14px] leading-relaxed text-[var(--muted)]">{t.areas.body}</p>
            </motion.div>
            {/* Lista numerada en vez de grid de cajas: la primera seccion despues
                del hero no puede resolver otra vez con el mismo molde de tarjeta
                con borde que usa el resto del sitio. */}
            <motion.div variants={container} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
              className="mt-12 border-t border-[var(--line)]">
              {AREAS.map((a) => (
                <motion.div key={a.en.t} variants={fadeUp}
                  className="grid grid-cols-[2.75rem_1fr] gap-x-6 border-b border-[var(--line)] py-7 sm:grid-cols-[3.5rem_1fr]">
                  <span className="pt-2.5"><span className="block h-2.5 w-2.5 rounded-full bg-[var(--accent)]" /></span>
                  <div>
                    <h3 className="font-display text-xl font-normal text-[var(--ink)]">{a[lang].t}</h3>
                    <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-[var(--muted)]">{a[lang].d}</p>
                    {/* Para quien es cada categoria — antes solo vivia en el
                        parrafo introductorio de la seccion, sin distinguir
                        una de otra. */}
                    {a[lang].who && (
                      <p className="mt-2 max-w-lg text-[12px] leading-relaxed text-[var(--faint)]">{a[lang].who}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
            <motion.div variants={container} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
              className="mt-12 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-8">
              <motion.p variants={fadeUp} className="text-[10px] uppercase tracking-[0.3em] text-[var(--faint)]">
                {t.areas.included}
              </motion.p>
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                {INCLUDED.map((i) => (
                  <motion.div key={i.en} variants={fadeUp} className="flex items-start gap-3">
                    <i.icon size={17} strokeWidth={1.9} className="mt-0.5 flex-shrink-0 text-[var(--muted)]" />
                    <span className="text-[13px] leading-relaxed text-[var(--muted)]">{i[lang]}</span>
                  </motion.div>
                ))}
              </div>
              <motion.p variants={fadeUp} className="mt-6 border-t border-[var(--line)] pt-5 text-[12px] leading-relaxed text-[var(--faint)]">
                {t.areas.includedNote}
              </motion.p>
            </motion.div>
          </section>
        </div>

        {/* El slogan ya no es una cita chica al final de "Qué hacemos": es su
            propia pausa, a todo el ancho, entre esa seccion y el equipo. */}
        <Slogan text={t.areas.slogan} />

        <div className="mx-auto max-w-5xl px-6 pb-20 sm:px-10 xl:max-w-6xl 2xl:max-w-7xl">
          {/* ============ PROCEDURES ============ */}
          {/* El riel de tarjetas queda trabado en pantalla (position: sticky
              dentro de un wrapper mas alto que el viewport) mientras el scroll
              vertical lo recorre de punta a punta; recien al llegar al final
              sigue el scroll normal hacia Resultados. Con prefers-reduced-motion
              no se infla el alto: el riel vuelve a ser un scroll horizontal
              comun, arrastrable con el dedo o el mouse. */}
          <section id="procedures" className="scroll-mt-24">
            <div ref={procWrapRef} style={reduce ? undefined : { height: procStickyHeight ? `${procStickyHeight + procPanDistance}px` : "100vh" }}>
              {/* Altura exacta del contenido medida por ref, no min-h-screen:
                  con min-h-screen, si el titulo+riel median menos que la
                  pantalla el pin seguia sosteniendose sobre puro espacio
                  vacio antes de soltar — el subtitulo de abajo quedaba
                  "lejos" de las tarjetas aunque el margen fuera chico. Sin
                  altura minima forzada, el pin suelta apenas termina el
                  contenido real. */}
              <div ref={procStickyRef} className="sticky top-0 flex flex-col justify-start py-16 sm:py-24">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
                  <Eyebrow size="text-[12px]">{t.proc.eyebrow}</Eyebrow>
                  <SectionTitle size="text-4xl sm:text-5xl">{t.proc.title}</SectionTitle>
                </motion.div>

                {/* Riel horizontal de tarjetas — cada una es su propia ficha
                    completa (descripcion, duracion/recuperacion y acciones),
                    no solo un selector que manda el detalle a otro lado. */}
                <div ref={procViewportRef}
                  className={`-mx-6 mt-10 px-6 sm:-mx-10 sm:px-10 ${reduce ? "no-scrollbar overflow-x-auto" : "overflow-hidden"}`}>
                  <motion.div ref={procRailRef} style={{ x: reduce ? 0 : procX }}
                    className={`flex items-stretch gap-5 pb-2 sm:gap-6 ${reduce ? "snap-x snap-mandatory scroll-pl-6 sm:scroll-pl-10" : ""}`}>
                    {PROCEDURES.map((x) => (
                      <div key={x.slug}
                        className={`flex w-[320px] flex-shrink-0 flex-col gap-5 border border-[var(--line)] bg-[var(--surface)] p-7 text-left sm:w-[380px] sm:p-8 ${reduce ? "snap-start" : ""}`}>
                        <div className="flex items-center gap-4">
                          {x.art ? (
                            <img src={x.art} alt="" aria-hidden="true" className="proc-art h-10 w-10 flex-shrink-0 object-contain" />
                          ) : (
                            <x.icon size={26} strokeWidth={1.3} aria-hidden="true" className="h-10 w-10 flex-shrink-0 text-[var(--ink)]" />
                          )}
                          <h3 className="font-display text-[19px] font-normal leading-snug text-[var(--ink)] sm:text-[21px]">
                            {x[lang].name}
                          </h3>
                        </div>
                        <p className="text-[14px] leading-relaxed text-[var(--muted)]">{x[lang].desc}</p>

                        <dl className="space-y-2.5 border-t border-[var(--line)] pt-5 text-[14px]">
                          <div className="flex justify-between gap-4">
                            <dt className="text-[var(--faint)]">{t.proc.duration}</dt>
                            <dd className="text-right text-[var(--ink)]">{x[lang].duration}</dd>
                          </div>
                          <div className="flex justify-between gap-4">
                            <dt className="text-[var(--faint)]">{t.proc.recovery}</dt>
                            <dd className="text-right text-[var(--ink)]">{x[lang].recovery}</dd>
                          </div>
                        </dl>

                        <div className="mt-auto space-y-2.5 pt-1">
                          <button type="button" onClick={() => askAbout(x[lang].name, x.slug)}
                            className="w-full cursor-pointer border border-[var(--accent)] bg-[var(--accent)] px-4 py-3.5 text-[11px] uppercase tracking-[0.16em] text-[var(--surface)] transition-opacity duration-200 hover:opacity-85 active:scale-[0.98]">
                            {t.proc.ask}
                          </button>
                          <button type="button" onClick={() => goToResult(x.slug)}
                            className="flex w-full cursor-pointer items-center justify-center gap-2 border border-[var(--line)] px-4 py-3 text-[11px] uppercase tracking-[0.16em] text-[var(--ink)] transition-colors duration-200 hover:border-[var(--ink)] hover:bg-[var(--chip)] active:scale-[0.98]">
                            {t.proc.cta}
                            <ArrowRight size={14} strokeWidth={1.5} />
                          </button>
                          <AnimatePresence>
                            {igHint === x.slug && (
                              <motion.a key="ig-hint" href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer"
                                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                transition={{ duration: 0.25, ease: "easeOut" }}
                                className="flex items-center justify-center gap-2 text-[12px] leading-snug text-[var(--faint)] transition-colors hover:text-[var(--ink)]">
                                <Instagram size={14} strokeWidth={1.5} className="flex-shrink-0" />
                                {t.proc.noResults}
                              </motion.a>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </div>

                {/* Adentro del bloque fijo, no despues: asi queda pineado
                    junto con las tarjetas mientras dura el paneo, no aparece
                    recien cuando el pin suelta. */}
                <p className="mt-6 max-w-2xl text-[12px] leading-relaxed text-[var(--faint)]">{t.proc.note}</p>
              </div>
            </div>
          </section>

          {/* ============ RESULTADOS ============ */}
          {/* One gallery block: procedure tabs on top, then the cases of whichever is
              selected. The frame keeps a fixed height so the page never jumps. */}
          {/* Segundo bloque que rompe el ancho de columna: es la seccion de prueba
              visual (fotos de pacientes), se beneficia de mas aire que el resto. */}
          <section id="resultados" className="scroll-mt-24 pt-24 2xl:-mx-16">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
              <Eyebrow>{t.res.eyebrow}</Eyebrow>
              <SectionTitle>{t.res.title}</SectionTitle>
              <p className="mt-5 max-w-2xl text-[14px] leading-relaxed text-[var(--muted)]">{t.res.body}</p>
            </motion.div>

            {(() => {
              const proc = PROCEDURES_WITH_CASES.find((x) => x.slug === activeSlug) ?? PROCEDURES_WITH_CASES[0];
              const cases = casesFor(proc.slug);
              const ci = Math.min(activeCase, cases.length - 1);
              const kase = cases[ci];
              const ai = Math.min(activeAngle, kase.angles.length - 1);
              const angle = kase.angles[ai];
              /* Casos con par: arriba el antes y el despues, y las fotos sueltas debajo.
                 Casos que solo tienen fotos sueltas: esas fotos ocupan el lugar del par. */
              const marcos = angle
                ? [{ caption: t.res.before, src: angle.before, fit: angle.beforeFit, frame: angle.frame },
                   { caption: t.res.after, src: angle.after, fit: angle.afterFit, frame: angle.frame }]
                : kase.apart.slice(0, 2).map((x, k) => ({ caption: `${t.res.angle} ${k + 1}`,
                    src: x.image, frame: x.frame, fit: null, entera: true }));
              const sueltas = angle ? kase.apart : kase.apart.slice(2);
              return (
                <>
                  <div id={`res-${proc.slug}`} className="mt-10 scroll-mt-24 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-7">
                    {/* Selector de procedimiento — chico, en el lugar donde antes
                        iba el nombre en texto plano, no una caja aparte arriba
                        de toda la seccion. Con --accent en vez de --line para
                        que se note que es interactivo, y un anillo que hace
                        ping cada vez que se llega desde "Ver resultados" de
                        otra tarjeta — asi queda claro que el procedimiento
                        tambien se puede cambiar desde aca. */}
                    <div className="relative inline-block max-w-full">
                      {filterPulseKey > 0 && (
                        <motion.span key={filterPulseKey} aria-hidden="true"
                          initial={{ opacity: 0.9, scale: 1 }}
                          animate={{ opacity: 0, scale: 1.4 }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="pointer-events-none absolute -inset-2 rounded-lg border-2 border-[var(--accent)]" />
                      )}
                      <label htmlFor="res-filtro" className="sr-only">{t.res.filter}</label>
                      <SlidersHorizontal size={13} strokeWidth={2} aria-hidden="true"
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--accent)]" />
                      <select id="res-filtro" value={proc.slug}
                        onChange={(e) => { setActiveSlug(e.target.value); setActiveCase(0); setActiveAngle(0); }}
                        className="relative w-full max-w-full cursor-pointer appearance-none truncate rounded-md border-[1.5px] border-[var(--accent)] bg-[var(--accent-soft)] py-2.5 pl-9 pr-9 text-[12px] font-medium uppercase tracking-[0.18em] text-[var(--ink)] transition-opacity duration-200 hover:opacity-85">
                        {PROCEDURES_WITH_CASES.map((x) => (
                          <option key={x.slug} value={x.slug}>{x[lang].name}</option>
                        ))}
                      </select>
                      <ChevronDown size={15} strokeWidth={1.8} aria-hidden="true"
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink)]" />
                    </div>
                    <div className="mt-3 flex h-[34px] items-center gap-3">
                      {/* Con menos de 10 casos no hay flechas, pero si igual no
                          entran todos en el ancho visible se puede arrastrar —
                          sin ninguna pista, eso no se nota. El degrade a la
                          derecha (visible solo cuando el contenido de verdad
                          desborda, porque min-w-0 deja que el flex se achique
                          antes que el degrade) avisa que hay mas para el lado. */}
                      <div className="relative min-w-0 flex-1">
                        <div ref={casesRef} className="no-scrollbar flex items-center gap-2 overflow-x-auto">
                          {cases.map((c, k) => (
                            <button key={c.n} type="button" aria-pressed={k === ci}
                              onClick={() => { setActiveCase(k); setActiveAngle(0); }}
                              className={`flex-shrink-0 cursor-pointer rounded-full border px-4 py-1.5 text-[11px] uppercase tracking-[0.16em] transition-colors duration-200 active:scale-95 ${
                                k === ci
                                  ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--surface)]"
                                  : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--ink)] hover:text-[var(--ink)]"}`}>
                              {t.res.case} {c.n}
                            </button>
                          ))}
                        </div>
                        {cases.length > 1 && cases.length < 10 && (
                          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-8"
                            style={{ background: "linear-gradient(to right, transparent, var(--surface))" }} />
                        )}
                      </div>
                      {cases.length >= 10 && (
                        <div className="flex flex-shrink-0 items-center gap-1.5">
                          <button type="button" aria-label={t.res.prevCase} title={t.res.prevCase}
                            onClick={() => scrollCarousel(casesRef, -1)}
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] transition-colors duration-200 hover:border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--surface)] active:scale-90">
                            <ArrowLeft size={14} strokeWidth={1.5} />
                          </button>
                          <button type="button" aria-label={t.res.nextCase} title={t.res.nextCase}
                            onClick={() => scrollCarousel(casesRef, 1)}
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] transition-colors duration-200 hover:border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--surface)] active:scale-90">
                            <ArrowRight size={14} strokeWidth={1.5} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Before / after */}
                    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {marcos.map(({ caption, src, fit, entera, frame }) => (
                        <figure key={caption} className="overflow-hidden rounded-lg border border-[var(--line)]">
                          <button type="button"
                            onClick={() => setLightbox({ src, alt: `${proc[lang].name} · ${caption}`, watermark: kase.watermark })}
                            style={{ aspectRatio: frame }}
                            className="group relative block w-full cursor-zoom-in overflow-hidden bg-[var(--photo)]">
                            {/* La foto se agranda sobre la zona del procedimiento y se apoya en
                                el mismo punto de la cara que su par, asi el antes y el despues
                                quedan alineados. El archivo no se recorta: al hacer click el
                                lightbox lo muestra entero. */}
                            <img key={src} src={src} alt={`${proc[lang].name} · ${caption}`} loading="lazy"
                              style={fit ?? (entera ? undefined : { objectPosition: kase.focus })}
                              className={`transition-transform duration-300 group-hover:scale-[1.03] ${
                                fit ? "absolute max-w-none object-cover"
                                    : entera ? "h-full w-full object-contain" : "h-full w-full object-cover"}`} />
                            {kase.watermark && <Watermark />}
                            <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/20">
                              <ZoomIn size={22} strokeWidth={1.5} className="text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                            </span>
                          </button>
                          <figcaption className="border-t border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
                            {caption}
                          </figcaption>
                        </figure>
                      ))}
                    </div>

                    {/* Otras tomas del mismo paciente. La fila solo existe si hay mas de
                        una: nada de alto reservado, para no dejar un hueco vacio. */}
                    {kase.angles.length > 1 && (
                      <div className="mt-5">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--faint)]">{t.res.angles}</p>
                        <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto">
                          {kase.angles.map((a, k) => (
                            <button key={k} type="button" onClick={() => setActiveAngle(k)}
                              aria-pressed={k === ai} aria-label={`${t.res.angle} ${k + 1}`}
                              className={`relative h-16 w-16 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border transition-colors duration-200 active:scale-95 ${
                                k === ai ? "border-[var(--ink)]" : "border-[var(--line)] opacity-70 hover:opacity-100"}`}>
                              <img src={a.after} alt="" aria-hidden="true" loading="lazy"
                                className="h-full w-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Fotos sueltas del caso: no tienen par, se muestran solas y enteras. */}
                    {sueltas.length > 0 && (
                      <div className="mt-5">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--faint)]">{t.res.apart}</p>
                        <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto">
                          {sueltas.map(({ image, frame }, k) => (
                            <button key={k} type="button"
                              onClick={() => setLightbox({ src: image, alt: `${proc[lang].name} · ${t.res.apart}`, watermark: kase.watermark })}
                              aria-label={`${t.res.apart} ${k + 1}`}
                              style={{ aspectRatio: frame }}
                              className="group relative h-[132px] flex-shrink-0 cursor-zoom-in overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--photo)]">
                              <img src={image} alt="" aria-hidden="true" loading="lazy"
                                className="h-full w-full object-cover" />
                              <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/20">
                                <ZoomIn size={18} strokeWidth={1.5} className="text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer"
                      className="group mt-6 flex items-center justify-between gap-4 rounded-lg border border-[var(--line)] px-5 py-4 transition-[border-color,box-shadow] duration-300 ease-out hover:border-[var(--rule)] hover:shadow-[0_10px_26px_var(--shadow)]">
                      <span className="flex items-center gap-3">
                        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] transition-colors duration-300 group-hover:border-[var(--rule)] group-hover:bg-[var(--chip)] group-hover:text-[var(--ink)]">
                          <Instagram size={17} strokeWidth={1.5} />
                        </span>
                        <span className="font-display text-[16px] leading-snug text-[var(--ink)] sm:text-[18px]">
                          {t.res.viewIg}
                        </span>
                      </span>
                      <ArrowRight size={18} strokeWidth={1.4}
                        className="flex-shrink-0 text-[var(--faint)] transition-[transform,color] duration-300 ease-out group-hover:translate-x-1.5 group-hover:text-[var(--ink)]" />
                    </a>

                    <p className="mt-5 text-[11px] leading-relaxed text-[var(--faint)]">{t.res.disclaimer}</p>
                  </div>
                </>
              );
            })()}
          </section>

          {/* ============ TEAM ============ */}
          {/* Unica seccion que no abre con eyebrow+titulo: la cita lidera, el
              titulo queda como rotulo de apoyo debajo. */}
          <section id="team" className="scroll-mt-24 pt-32">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
              <Eyebrow>{t.team.eyebrow}</Eyebrow>
              <p className="mt-4 max-w-3xl font-display text-[26px] font-normal italic leading-snug text-[var(--ink)] sm:text-[32px]">
                “{t.team.quote}”
              </p>
              <h2 className="mt-6 font-display text-lg font-normal text-[var(--ink)]">{t.team.title}</h2>
              <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-[var(--muted)]">{t.team.body}</p>
            </motion.div>

            {/* Unico bloque que rompe el ancho de columna del resto de la pagina:
                la foto del cirujano se agranda y el grid respira mas alla del
                max-w-5xl que envuelve todo lo demas. */}
            <motion.div id="dr-di-maggio" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}
              variants={container} className="mt-12 grid scroll-mt-24 grid-cols-1 gap-8 md:grid-cols-[minmax(0,340px)_1fr] md:items-center lg:grid-cols-[380px_1fr] lg:gap-12 2xl:-mx-20 2xl:grid-cols-[460px_1fr]">
              <motion.div variants={settleIn} className="overflow-hidden rounded-2xl">
                <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.4, ease: "easeOut" }}>
                  <img src={marceloPhoto} alt={LEAD.name} className="h-[26rem] w-full object-cover sm:h-[32rem]" />
                </motion.div>
              </motion.div>
              <motion.div variants={fadeUp}>
                <div className="flex flex-wrap items-baseline gap-3">
                  <h3 className="font-display text-3xl font-normal text-[var(--ink)] sm:text-4xl">{LEAD.name}</h3>
                  <span className="text-[13px] tracking-wide text-[var(--faint)]">{LEAD[lang].years}</span>
                </div>
                <p className="mt-2 text-[13px] uppercase tracking-[0.12em] text-[var(--muted)] sm:text-[14px]">{LEAD[lang].role}</p>
                <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-[var(--muted)] sm:text-[17px]">{LEAD[lang].bio}</p>
                {/* Sello en vez del punto liso: son las credenciales que mas
                    pesan para la confianza, justo donde se presenta al
                    doctor — vale la pena que se noten de un vistazo. */}
                <ul className="mt-6 space-y-2.5">
                  {LEAD[lang].creds.map((c) => (
                    <li key={c} className="flex items-start gap-2.5 text-[14px] text-[var(--muted)]">
                      <SealIcon size={14} strokeWidth={1.7} className="mt-0.5 flex-shrink-0 text-[var(--accent)]" />{c}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-wrap gap-2">
                  <IconLink Icon={EnvelopeIcon} label="Email" href={`mailto:${CONTACT_EMAIL}`} />
                  <IconLink Icon={Facebook} label="Facebook" href={SOCIAL_LINKS.facebook} />
                  <IconLink Icon={XLogo} label="X" href={SOCIAL_LINKS.x} />
                  <IconLink Icon={Instagram} label="Instagram" href={SOCIAL_LINKS.instagram} />
                  <IconLink Icon={Linkedin} label="LinkedIn" href={SOCIAL_LINKS.linkedin} />
                </div>
              </motion.div>
            </motion.div>

            <div id="surgical-team" className="scroll-mt-24 pt-20">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
                <Eyebrow>{t.team.specEyebrow}</Eyebrow>
                <SectionTitle>{t.team.specTitle}</SectionTitle>
                <p className="mt-5 max-w-2xl text-[14px] leading-relaxed text-[var(--muted)]">{t.team.specBody}</p>
              </motion.div>
              {/* Nomina en lista, no grid de tarjetas: son nombres y roles, no
                  contenido que necesite quedar contenido en una caja propia. */}
              {/* gap-x real, no solo padding: sin un corte entre columnas los
                  bordes de dos filas vecinas quedaban pegados borde a borde y
                  se leian como una sola linea corrida (mas visible en oscuro,
                  donde --line tiene mas contraste). */}
              <motion.div variants={container} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}
                className="mt-10 grid grid-cols-1 border-t border-[var(--line)] sm:grid-cols-2 sm:gap-x-10">
                {SPECIALISTS.map((sp) => (
                  <motion.div key={sp.name} variants={fadeUp}
                    className="flex items-center gap-4 border-b border-[var(--line)] py-5">
                    <PhotoBox label={initialsOf(sp.name)} className="h-11 w-11 flex-shrink-0 rounded-full" textClass="text-sm" />
                    <div className="min-w-0">
                      <h3 className="font-display text-lg font-normal text-[var(--ink)]">{sp.name}</h3>
                      <p className="mt-0.5 text-[12px] leading-relaxed text-[var(--muted)]">{sp[lang]}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <div id="assistants" className="scroll-mt-24 pt-20">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
                <Eyebrow>{t.team.asstEyebrow}</Eyebrow>
                <SectionTitle>{t.team.asstTitle}</SectionTitle>
              </motion.div>
              <motion.div variants={container} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
                className="mt-10 grid grid-cols-1 divide-y divide-[var(--line)] border-t border-[var(--line)] sm:grid-cols-3 sm:divide-y-0 sm:divide-x sm:border-t-0">
                {ASSISTANTS.map((a) => (
                  <motion.div key={a.name} variants={fadeUp}
                    className="flex items-center gap-4 py-5 sm:px-6 sm:first:pl-0 sm:last:pr-0">
                    <PhotoBox label={initialsOf(a.name)} className="h-11 w-11 flex-shrink-0 rounded-full" textClass="text-sm" />
                    <div className="min-w-0">
                      <h3 className="font-display text-lg font-normal text-[var(--ink)]">{a.name}</h3>
                      <p className="mt-1.5 text-[12px] leading-relaxed text-[var(--muted)]">{a[lang]}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* ============ TRAYECTORIA & PRENSA ============ */}
          <section id="press" className="scroll-mt-24 pt-24">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
              <Eyebrow>{t.press.eyebrow}</Eyebrow>
              <SectionTitle>{t.press.title}</SectionTitle>
              <p className="mt-5 max-w-2xl text-[14px] leading-relaxed text-[var(--muted)]">{t.press.body}</p>
            </motion.div>

            <div className="mt-10 border-t border-[var(--line)]">
            <Fold id="interviews" eyebrow={t.interviews.eyebrow} title={t.interviews.title} body={t.interviews.body}
              open={fold === "interviews"} onToggle={() => setFold(fold === "interviews" ? null : "interviews")}>
              <motion.a initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}
                whileHover={{ y: -3 }} transition={{ duration: 0.25, ease: "easeOut" }}
                href={INTERVIEWS_PLAYLIST} target="_blank" rel="noopener noreferrer"
                className="group mt-8 flex flex-wrap items-center gap-5 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6 transition-[border-color,box-shadow] duration-300 ease-out hover:border-[var(--rule)] hover:shadow-[0_14px_32px_var(--shadow)] sm:p-8">
                <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] transition-colors duration-300 ease-out group-hover:border-[var(--rule)] group-hover:bg-[var(--chip)] group-hover:text-[var(--ink)]">
                  <Play size={20} strokeWidth={1.4} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[20px] font-normal leading-snug text-[var(--ink)] sm:text-[24px]">
                    {t.interviews.cta}
                  </span>
                  <span className="mt-2 block text-[11px] uppercase tracking-[0.14em] text-[var(--faint)]">
                    {t.interviews.watch}
                  </span>
                </span>
                <ArrowRight size={20} strokeWidth={1.4}
                  className="flex-shrink-0 text-[var(--faint)] transition-[transform,color] duration-300 ease-out group-hover:translate-x-1.5 group-hover:text-[var(--ink)]" />
              </motion.a>

            </Fold>
            <Fold id="certs" eyebrow={t.certs.eyebrow} title={t.certs.title} body={t.certs.body}
              open={fold === "certs"} onToggle={() => setFold(fold === "certs" ? null : "certs")}>
              <motion.ul variants={container} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}
                className="mt-10 border-t border-[var(--line)]">
                {CERTIFICATES.slice(0, certsOpen ? undefined : CERTS_PREVIEW).map((c, i) => (
                  <motion.li key={c.slug}
                    variants={i < CERTS_PREVIEW ? fadeUp : undefined}
                    {...(i < CERTS_PREVIEW ? {} : {
                      initial: { opacity: 0, y: -6 },
                      animate: { opacity: 1, y: 0 },
                      transition: { duration: 0.35, ease: "easeOut", delay: (i - CERTS_PREVIEW) * 0.05 },
                    })}
                    className="grid grid-cols-1 gap-x-8 gap-y-2 border-b border-[var(--line)] py-6 sm:grid-cols-[5rem_1fr_auto] sm:items-baseline">
                    <span className="font-display text-[15px] text-[var(--faint)]">{c.year}</span>
                    <div>
                      <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.24em] text-[var(--faint)]">
                        <SealIcon size={13} strokeWidth={1.7} className="flex-shrink-0 text-[var(--accent)]" />
                        {c.institution}
                      </p>
                      <h3 className="mt-2 font-display text-[19px] font-normal leading-snug text-[var(--ink)] sm:text-[21px]">
                        {c[lang].title}
                      </h3>
                      {c[lang].meta && (
                        <p className="mt-1.5 text-[12px] text-[var(--muted)]">{c[lang].meta}</p>
                      )}
                    </div>
                    {c.image && (
                      <button type="button" onClick={() => setLightbox({ src: c.image, alt: c[lang].title })}
                        className="flex cursor-zoom-in items-center gap-1.5 justify-self-start text-[11px] uppercase tracking-[0.14em] text-[var(--faint)] transition-colors duration-200 hover:text-[var(--ink)] sm:justify-self-end">
                        <ZoomIn size={13} strokeWidth={1.5} />
                        {t.certs.view}
                      </button>
                    )}
                  </motion.li>
                ))}
              </motion.ul>

              {CERTIFICATES.length > CERTS_PREVIEW && (
                <button type="button" onClick={() => setCertsOpen((v) => !v)}
                  aria-expanded={certsOpen}
                  className="group mt-6 flex cursor-pointer items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[var(--faint)] transition-colors duration-200 hover:text-[var(--ink)] active:opacity-60">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--line)] transition-colors duration-200 group-hover:border-[var(--ink)]">
                    <ChevronDown size={13} strokeWidth={1.6}
                      className={`transition-transform duration-300 ${certsOpen ? "rotate-180" : ""}`} />
                  </span>
                  {certsOpen ? t.certs.less : t.certs.more.replace("{n}", CERTIFICATES.length - CERTS_PREVIEW)}
                </button>
              )}

            </Fold>
            <Fold id="papers" eyebrow={t.papers.eyebrow} title={t.papers.title} body={t.papers.body}
              open={fold === "papers"} onToggle={() => setFold(fold === "papers" ? null : "papers")}>
              <CarouselArrows prevLabel={t.papers.prev} nextLabel={t.papers.next}
                onPrev={() => scrollCarousel(papersRef, -1)} onNext={() => scrollCarousel(papersRef, 1)} />

              <motion.div ref={papersRef} variants={container} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}
                className="no-scrollbar -mx-6 mt-4 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-pl-6 px-6 pb-2 sm:-mx-8 sm:scroll-pl-8 sm:px-8">
                {PAPERS.map((p) => (
                  <motion.article key={p.slug} variants={fadeSide}
                    className="flex w-[85vw] max-w-[560px] flex-shrink-0 snap-start flex-col border border-[var(--line)] bg-[var(--surface)] p-6 sm:w-[60vw] sm:p-7 lg:w-[38vw]">
                    <div className="flex items-start gap-2.5">
                      {p.kind === "board"
                        ? <Award size={15} strokeWidth={1.4} className="mt-0.5 flex-shrink-0 text-[var(--faint)]" />
                        : <FileText size={15} strokeWidth={1.4} className="mt-0.5 flex-shrink-0 text-[var(--faint)]" />}
                      <p className="text-[10px] uppercase leading-relaxed tracking-[0.22em] text-[var(--faint)]">
                        {p.kind === "board" ? `${t.papers.board} · ${p.publisher}` : p.publisher}
                      </p>
                    </div>

                    <h3 className="mt-4 font-display text-[20px] font-normal leading-snug text-[var(--ink)] sm:text-[23px]">
                      {p.title}
                    </h3>

                    <p className="mt-3 text-[13px] leading-relaxed text-[var(--muted)]">{p.authors}</p>
                    <p className="mt-1 mb-6 text-[12px] text-[var(--faint)]">{p[lang].ref}</p>

                    <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[var(--line)] pt-5 text-[11px] uppercase tracking-[0.14em]">
                      {p.url && (
                        <a href={p.url} target="_blank" rel="noopener noreferrer"
                          className="text-[var(--faint)] transition-colors duration-200 hover:text-[var(--ink)]">
                          {t.papers.doi}
                        </a>
                      )}
                      {p.cover && (
                        <button type="button" onClick={() => setLightbox({ src: p.cover, alt: p.title })}
                          className="flex cursor-zoom-in items-center gap-1.5 uppercase text-[var(--faint)] transition-colors duration-200 hover:text-[var(--ink)]">
                          <ZoomIn size={13} strokeWidth={1.5} />
                          {p.kind === "board" ? t.papers.viewDoc : t.papers.view}
                        </button>
                      )}
                    </div>
                  </motion.article>
                ))}
              </motion.div>
            </Fold>
            </div>
          </section>

          {/* ============ TESTIMONIOS ============ */}
          <section id="testimonios" className="scroll-mt-24 pt-24">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
              <Eyebrow>{t.test.eyebrow}</Eyebrow>
              <SectionTitle>{t.test.title}</SectionTitle>
            </motion.div>

            {(() => {
              const all = TESTIMONIALS.map((x) => ({ initials: x.initials, place: x.place, stars: x.stars, ...x[lang] }));
              const totalPages = Math.max(1, Math.ceil(all.length / TEST_PAGE_SIZE));
              const page = ((testPage % totalPages) + totalPages) % totalPages;
              const visible = all.slice(page * TEST_PAGE_SIZE, page * TEST_PAGE_SIZE + TEST_PAGE_SIZE);
              return (
                <>
                  <motion.div key={page} variants={container} initial="hidden" animate="visible"
                    className="mt-10 grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2">
                    {visible.map((x, i) => (
                      <motion.figure key={`${x.initials}-${page}-${i}`} variants={fadeUp}
                        className="border border-[var(--line)] bg-[var(--surface)] p-6">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full">
                            <PhotoBox label={x.initials} className="h-full w-full" textClass="text-sm" />
                          </div>
                          <figcaption>
                            <p className="font-display text-[16px] font-normal text-[var(--ink)]">{x.initials}</p>
                            {x.place && <p className="text-[11px] text-[var(--faint)]">{x.place}</p>}
                          </figcaption>
                        </div>
                        <div className="mt-4"><Stars value={x.stars ?? 5} t={t} /></div>
                        <blockquote className="mt-3 text-[13px] leading-relaxed italic text-[var(--muted)]">“{x.text}”</blockquote>
                        {/* Procedimiento + tiempo transcurrido: un testimonio suelto
                            sin ese contexto pesa mucho menos que uno anclado a un
                            caso y un momento concretos. */}
                        {(x.proc || x.time) && (
                          <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-[var(--faint)]">
                            {[x.proc, x.time].filter(Boolean).join(" · ")}
                          </p>
                        )}
                      </motion.figure>
                    ))}
                  </motion.div>
                  {totalPages > 1 && (
                    <div className="mt-5 flex items-center justify-end gap-3">
                      <button type="button" onClick={() => setTestPage((p) => p - 1)}
                        aria-label={t.test.prev} title={t.test.prev}
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-[1.5px] border-[var(--rule)] text-[var(--muted)] transition-colors duration-200 hover:border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--surface)] active:scale-90">
                        <ArrowLeft size={16} strokeWidth={1.9} />
                      </button>
                      <span className="text-[11px] tracking-wide text-[var(--faint)]">{page + 1} / {totalPages}</span>
                      <button type="button" onClick={() => setTestPage((p) => p + 1)}
                        aria-label={t.test.next} title={t.test.next}
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-[1.5px] border-[var(--rule)] text-[var(--muted)] transition-colors duration-200 hover:border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--surface)] active:scale-90">
                        <ArrowRight size={16} strokeWidth={1.9} />
                      </button>
                    </div>
                  )}
                </>
              );
            })()}

          </section>

          {/* ============ LOCATIONS ============ */}
          <section id="locations" className="scroll-mt-24 pt-24">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
              <Eyebrow>{t.loc.eyebrow}</Eyebrow>
              <SectionTitle>{t.loc.title}</SectionTitle>
            </motion.div>
            <motion.div variants={container} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
              className="mt-10 grid grid-cols-1 items-start gap-x-4 gap-y-10 md:grid-cols-3">
              {LOCATIONS.map((group) => {
                const CountryIcon = countryIcon(group.country.es);
                return (
                <motion.div key={group.country.es} variants={fadeUp}
                  className="border border-[var(--line)] bg-[var(--surface)] p-7">
                  <div className="flex items-center gap-2">
                    <CountryIcon size={17} strokeWidth={1.9} className="text-[var(--accent)]" />
                    <h3 className="font-display text-xl font-normal text-[var(--ink)]">{group.country[lang]}</h3>
                  </div>
                  <div className="mt-4 space-y-3">
                    {group.cities.map((c) => (
                      <div key={c.city.es} className="rounded-lg border border-[var(--line)] p-4">
                        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--faint)]">{c.city[lang]}</p>
                        <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--muted)]">{c[lang]}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
                );
              })}
            </motion.div>
          </section>

          {/* ============ CONTACT ============ */}
          <section id="contact" className="scroll-mt-24 pt-24">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}
              className="rounded-2xl bg-[var(--contact-bg)] px-8 py-12 sm:px-12">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--contact-ink)] opacity-50">{t.contact.eyebrow}</p>
              <h2 className="mt-3 font-display text-3xl font-normal text-[var(--contact-ink)] sm:text-4xl">{t.contact.title}</h2>
              <p className="mt-4 max-w-md text-[14px] leading-relaxed text-[var(--contact-ink)] opacity-70">{t.contact.body}</p>
              <p className="mt-3 max-w-md text-[13px] leading-relaxed text-[var(--contact-ink)] opacity-60">{t.contact.process}</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px] text-[var(--contact-ink)] opacity-80">
                <a href={`mailto:${CONTACT_EMAIL}`} className="transition-opacity hover:opacity-100">{CONTACT_EMAIL}</a>
                <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-100">{INSTAGRAM_HANDLE}</a>
              </div>
              <form onSubmit={submitEnquiry} className="mt-8 max-w-xl space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--contact-ink)] opacity-60">{t.contact.fName}</span>
                    <input type="text" value={cForm.name} placeholder={t.contact.fNamePh} maxLength={60}
                      onChange={(e) => setCForm({ ...cForm, name: e.target.value })}
                      className="mt-2 w-full rounded-lg border border-[var(--contact-ink)]/25 bg-transparent px-3 py-2.5 text-[13px] text-[var(--contact-ink)] transition-colors placeholder:text-[var(--contact-ink)]/35 focus:border-[var(--contact-ink)]" />
                  </label>
                  <label className="block">
                    <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--contact-ink)] opacity-60">{t.contact.fEmail}</span>
                    <input type="email" value={cForm.email} placeholder={t.contact.fEmailPh} maxLength={90}
                      onChange={(e) => setCForm({ ...cForm, email: e.target.value })}
                      className="mt-2 w-full rounded-lg border border-[var(--contact-ink)]/25 bg-transparent px-3 py-2.5 text-[13px] text-[var(--contact-ink)] transition-colors placeholder:text-[var(--contact-ink)]/35 focus:border-[var(--contact-ink)]" />
                  </label>
                </div>
                <label className="block">
                  <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--contact-ink)] opacity-60">{t.contact.fProc}</span>
                  <select value={cForm.proc}
                    onChange={(e) => setCForm({ ...cForm, proc: e.target.value })}
                    className="mt-2 w-full cursor-pointer rounded-lg border border-[var(--contact-ink)]/25 bg-transparent px-3 py-2.5 text-[13px] text-[var(--contact-ink)] transition-colors focus:border-[var(--contact-ink)]">
                    <option value="" className="text-[var(--contact-bg)]">{t.contact.fProcPh}</option>
                    {PROCEDURES.map((p) => (
                      <option key={p.slug} value={p.slug} className="text-[var(--contact-bg)]">{p[lang].name}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--contact-ink)] opacity-60">{t.contact.fMsg}</span>
                  <textarea id="contact-msg" rows={4} value={cForm.msg} placeholder={t.contact.fMsgPh} maxLength={800}
                    onChange={(e) => setCForm({ ...cForm, msg: e.target.value })}
                    className="mt-2 w-full resize-y rounded-lg border border-[var(--contact-ink)]/25 bg-transparent px-3 py-2.5 text-[13px] text-[var(--contact-ink)] transition-colors placeholder:text-[var(--contact-ink)]/35 focus:border-[var(--contact-ink)]" />
                </label>
                {cErr && <p className="text-[12px] text-[#E0908D]">{cErr}</p>}
                <div className="flex flex-wrap items-center gap-4">
                  <button type="submit" disabled={cSubmitting}
                    className="flex cursor-pointer items-center gap-2.5 bg-[var(--contact-ink)] px-8 py-3.5 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--contact-bg)] transition-opacity duration-200 hover:opacity-85 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70">
                    {cSubmitting && <Loader2 size={14} strokeWidth={2} className="animate-spin" />}
                    {cSubmitting ? t.contact.sending : t.contact.send}
                  </button>
                </div>
                <p className="text-[11px] leading-relaxed text-[var(--contact-ink)] opacity-45">{t.contact.note}</p>
              </form>
            </motion.div>
          </section>

          {/* Consulta enviada — reemplaza el texto inline de antes, que se
              perdia facil al lado del boton. Un cartel aparte no deja dudas
              de que se envio, y con boton propio en vez de auto-ocultarse
              solo a los 6s. */}
          <AnimatePresence>
            {cSent && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setCSent(false)} role="dialog" aria-modal="true"
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-6">
                <motion.div initial={{ opacity: 0, scale: 0.94, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative w-full max-w-sm rounded-2xl bg-[var(--surface)] p-8 text-center shadow-[0_20px_60px_var(--shadow)]">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                    <Check size={22} strokeWidth={2} />
                  </span>
                  <h3 className="mt-5 font-display text-[22px] font-normal text-[var(--ink)]">{t.contact.sentTitle}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-[var(--muted)]">{t.contact.sentBody}</p>
                  <button type="button" onClick={() => setCSent(false)}
                    className="mt-7 w-full cursor-pointer border border-[var(--ink)] bg-[var(--ink)] px-4 py-3 text-[10px] uppercase tracking-[0.16em] text-[var(--surface)] transition-opacity duration-200 hover:opacity-85 active:scale-[0.98]">
                    {t.contact.close}
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ============ FOOTER ============ */}
          <footer className="mt-24 border-t border-[var(--line)] pt-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div>
                <button onClick={() => scrollTo("home")} aria-label={t.a11y.home} className="cursor-pointer text-left active:opacity-70">
                  <Wordmark size={58} />
                </button>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--faint)]">{t.footer.where}</p>
                <ul className="mt-3 space-y-0.5 text-[13px] leading-relaxed text-[var(--muted)]">
                  {SEDES.map((s) => <li key={s}>{s}</li>)}
                </ul>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--faint)]">{t.footer.follow}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {SOCIALS.map((s) => <IconLink key={s.key} Icon={s.Icon} label={s.label} href={s.href} />)}
                </div>
                <a href={`mailto:${CONTACT_EMAIL}`} className="mt-4 block text-[13px] text-[var(--muted)] transition-colors hover:text-[var(--ink)]">
                  {CONTACT_EMAIL}
                </a>
                <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer"
                  className="mt-1 block text-[13px] text-[var(--muted)] transition-colors hover:text-[var(--ink)]">
                  {INSTAGRAM_HANDLE}
                </a>
              </div>
            </div>
            <p className="mt-6 text-[11px] tracking-wide text-[var(--faint)]">
              © {new Date().getFullYear()} MDM Surgery — Marcelo Di Maggio &amp; Team.
            </p>
            <p className="mt-2 text-[11px] tracking-wide text-[var(--faint)]">
              {t.footer.madeBy}:{" "}
              <a href={DEVELOPER_PORTFOLIO_URL} target="_blank" rel="noopener noreferrer"
                className="underline decoration-dotted underline-offset-2 transition-colors hover:text-[var(--ink)]">
                {DEVELOPER_NAME}
              </a>
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
