import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion, useInView } from "framer-motion";
import {
  Menu, X, ChevronDown, ArrowDown, ArrowRight, ArrowLeft, Mail, Instagram, Linkedin,
  Facebook, Youtube, MapPin, Sun, Moon, Languages, Check, Star, Play, Award, FileText, ZoomIn,
} from "lucide-react";
import { UI } from "./i18n.js";
import heroVideo from "./assets/hero-bg.mp4";
import marceloPhoto from "./assets/marcelodimaggio.jpg";
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

/* ------------------------------- COMPONENTS ------------------------------- */

function IconLink({ Icon, href = "#", label, small }) {
  const s = small ? "h-7 w-7" : "h-9 w-9";
  const external = /^https?:|^mailto:/.test(href);
  return (
    <a href={href} aria-label={label} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`${s} flex cursor-pointer items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] transition-all duration-200 hover:border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--surface)]`}>
      <Icon size={small ? 12 : 15} strokeWidth={1.5} />
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
          className="cursor-pointer rounded p-0.5 transition-transform duration-150 hover:scale-110">
          <Star size={20} strokeWidth={1.4}
            className={n <= shown ? "fill-[var(--ink)] text-[var(--ink)]" : "text-[var(--faint)]"} />
        </button>
      ))}
    </div>
  );
}

const Eyebrow = ({ children }) => (
  <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--faint)]">{children}</p>
);

const SectionTitle = ({ children }) => (
  <h2 className="mt-3 font-display text-3xl font-normal leading-tight text-[var(--ink)] sm:text-4xl">
    {children}
  </h2>
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

function CarouselArrows({ onPrev, onNext, prevLabel, nextLabel }) {
  const btn = "flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] transition-colors duration-200 hover:border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--surface)]";
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

function PhotoBox({ label, className = "", textClass = "text-2xl" }) {
  return (
    <div className={`flex items-center justify-center bg-[var(--photo)] ${className}`}>
      <span className={`font-display font-normal text-[var(--photo-ink)] ${textClass}`}>{label}</span>
    </div>
  );
}

/* Bloque plegable para las tres partes de Trayectoria & Prensa. */
function Fold({ id, eyebrow, title, body, open, onToggle, children }) {
  return (
    <div id={id} className="scroll-mt-24 border-b border-[var(--line)] last:border-0">
      <button type="button" onClick={onToggle} aria-expanded={open}
        className="group flex w-full cursor-pointer items-center gap-5 py-7 text-left">
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] uppercase tracking-[0.3em] text-[var(--faint)]">{eyebrow}</span>
          <span className="mt-2 block font-display text-2xl font-normal leading-tight text-[var(--ink)] sm:text-3xl">{title}</span>
        </span>
        <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border transition-colors duration-200 ${
          open ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--surface)]" : "border-[var(--line)] text-[var(--muted)] group-hover:border-[var(--ink)]"}`}>
          <ChevronDown size={17} strokeWidth={1.5}
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
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const show = inView || reduce;

  const rule = {
    hidden: { scaleX: 0 },
    visible: { scaleX: 1, transition: { duration: 0.9, ease: "easeOut" } },
  };
  // El slogan se lee en dos tiempos: cada mitad entra por separado, con un
  // retraso corto entre una y otra, para dar ritmo a la lectura.
  const half = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
  };
  const corte = text.indexOf(",");
  const mitades = corte > 0
    ? [text.slice(0, corte + 1), text.slice(corte + 1).trim()]
    : [text];
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={show ? "visible" : "hidden"}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.45, delayChildren: 0.2 } } }}
      className="relative mt-20 text-center"
    >
      <motion.span variants={rule} className="mx-auto block h-px w-20 origin-center bg-[var(--line)]" />
      <p className="mx-auto mt-8 max-w-2xl font-display text-[22px] font-normal italic leading-snug text-[var(--ink)] sm:text-[28px]">
        {mitades.map((frag, i) => (
          <motion.span key={i} variants={half} className="inline">
            {i > 0 ? " " : ""}{frag}
          </motion.span>
        ))}
      </p>
      <motion.span variants={rule} className="mx-auto mt-8 block h-px w-20 origin-center bg-[var(--line)]" />
    </motion.div>
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
  const [cForm, setCForm] = useState({ name: "", email: "", msg: "" });
  const [cSent, setCSent] = useState(false);
  const [cErr, setCErr] = useState("");
  const [testPage, setTestPage] = useState(0);
  const [lightbox, setLightbox] = useState(null);
  const [igHint, setIgHint] = useState(null);
  const papersRef = useRef(null);
  const casesRef = useRef(null);
  const [activeProc, setActiveProc] = useState("facial-harmonization");
  const [procModal, setProcModal] = useState(false);
  const [certsOpen, setCertsOpen] = useState(false);
  const [fold, setFold] = useState(null);
  const [pastHero, setPastHero] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const reduce = useReducedMotion();
  const [loading, setLoading] = useState(true);
  const t = UI[lang];

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
    if (!procModal) return;
    const onKey = (e) => { if (e.key === "Escape") setProcModal(false); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [procModal]);

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

  const askAbout = (label) => {
    setCForm((f) => ({ ...f, msg: t.contact.template.replace("{p}", label) }));
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
    try {
      await submitToFormspree({ form: "contact", name: cForm.name.trim(), email: cForm.email.trim(), message: cForm.msg.trim() });
      setCSent(true);
      setCForm({ name: "", email: "", msg: "" });
      setTimeout(() => setCSent(false), 6000);
    } catch {
      setCErr(t.contact.sendError);
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
  };

  const NAV = [
    { id: "home", label: t.nav.home },
    { id: "areas", label: t.nav.areas },
    { id: "team", label: t.nav.team, submenu: [
        { id: "dr-di-maggio", label: t.sub.lead },
        { id: "surgical-team", label: t.sub.team },
        { id: "assistants", label: t.sub.assistants },
      ] },
    { id: "procedures", label: t.nav.procedures },
    { id: "resultados", label: t.nav.resultados },
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
    const ids = ["home", "areas", "team", "procedures", "resultados", "press", "testimonios", "locations", "contact"];
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
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] transition-colors duration-200 hover:border-[var(--ink)] hover:text-[var(--ink)]">
        {theme === "dark" ? <Sun size={14} strokeWidth={1.5} /> : <Moon size={14} strokeWidth={1.5} />}
      </button>
      <button onClick={() => setLang(lang === "es" ? "en" : "es")}
        aria-label={t.a11y.lang} title={t.a11y.lang}
        className="flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-[var(--line)] px-2.5 text-[10px] uppercase tracking-[0.14em] text-[var(--muted)] transition-colors duration-200 hover:border-[var(--ink)] hover:text-[var(--ink)]">
        <Languages size={13} strokeWidth={1.5} />
        {lang === "es" ? "ES" : "EN"}
      </button>
    </div>
  );

  const Sidebar = (
    <div className="flex h-full flex-col">
      <button onClick={() => scrollTo("home")} aria-label={t.a11y.home}
        className="group mb-8 block cursor-pointer text-left">
        <span className="font-display text-2xl font-normal tracking-wide text-[var(--ink)]">MDM</span>
        <span className="mt-1 block text-[9px] uppercase tracking-[0.26em] text-[var(--faint)]">Marcelo Di Maggio</span>
        <span className="mt-0.5 block text-[9px] uppercase tracking-[0.26em] text-[var(--faint)] opacity-70">Surgery &amp; Team</span>
        <span className="mt-2 block h-px w-0 bg-[var(--ink)] transition-all duration-300 group-hover:w-10" />
      </button>

      <nav className="flex-1 space-y-0.5 overflow-y-auto">
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
              className={`group flex w-full cursor-pointer items-center justify-between px-1 py-2 text-[13px] tracking-wide transition-colors duration-200 ${active === item.id ? "text-[var(--ink)]" : "text-[var(--muted)] hover:text-[var(--ink)]"}`}>
              <span className="relative">
                {item.label}
                <span className={`absolute left-0 -bottom-0.5 h-px bg-[var(--ink)] transition-all duration-300 ${active === item.id ? "w-6" : "w-0 group-hover:w-6"}`} />
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
                        className="group relative block w-full cursor-pointer py-1.5 text-left text-[12px] text-[var(--faint)] transition-colors duration-200 hover:text-[var(--ink)]">
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
            className={`group relative block w-full cursor-pointer px-1 py-2 text-left text-[13px] tracking-wide transition-colors duration-200 ${active === item.id ? "text-[var(--ink)]" : "text-[var(--muted)] hover:text-[var(--ink)]"}`}>
            {item.label}
            <span className={`absolute left-1 -bottom-0.5 h-px bg-[var(--ink)] transition-all duration-300 ${active === item.id ? "w-6" : "w-0 group-hover:w-6"}`} />
          </button>
        ))}
      </nav>

      <div className="mt-5 border-t border-[var(--line)] pt-4">
        <ul className="space-y-0.5 text-[11px] leading-relaxed text-[var(--faint)]">
          {SEDES.map((s) => <li key={s}>{s}</li>)}
        </ul>
        <Toggles />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg)] font-sans text-[var(--muted)] antialiased transition-colors duration-300">
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
              <span className="font-display text-3xl font-normal tracking-[0.1em] text-[var(--ink)]">MDM</span>
              <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                transition={{ duration: reduce ? 0 : 0.5, ease: "easeInOut", delay: reduce ? 0 : 0.15 }}
                className="mt-3 h-px w-14 origin-center bg-[var(--ink)]" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ScrollSideDecor />

      {/* Sidebar — always visible on desktop */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-60 overflow-y-auto border-r border-[var(--line)] bg-[var(--surface)] px-7 py-8 lg:block">
        {Sidebar}
      </aside>

      {/* Mobile topbar */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-[var(--line)] bg-[var(--surface)] px-5 py-3.5 lg:hidden">
        <button onClick={() => scrollTo("home")} aria-label={t.a11y.home} className="flex cursor-pointer items-baseline gap-2">
          <span className="font-display text-lg font-normal tracking-wide text-[var(--ink)]">MDM</span>
          <span className="text-[9px] uppercase tracking-[0.22em] text-[var(--faint)]">Surgery</span>
        </button>
        <div className="flex items-center gap-2">
          <Toggles compact />
          <button onClick={() => setOpen(true)} aria-label={t.a11y.menu} className="cursor-pointer text-[var(--ink)]">
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
              className="fixed left-0 top-0 z-50 h-screen w-72 overflow-y-auto bg-[var(--surface)] px-7 py-8 lg:hidden">
              <button onClick={() => setOpen(false)} aria-label={t.a11y.close}
                className="absolute right-5 top-5 cursor-pointer text-[var(--muted)]">
                <X size={20} />
              </button>
              {Sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Floating consultation CTA — hidden on the home/hero section */}
      <motion.button type="button" onClick={() => scrollTo("contact")}
        aria-label={t.contact.cta} title={t.contact.cta} aria-hidden={!pastHero}
        initial={false}
        animate={{ opacity: pastHero ? 1 : 0, scale: pastHero ? 1 : 0.8 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        style={{ pointerEvents: pastHero ? "auto" : "none" }}
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] shadow-[0_8px_24px_var(--shadow)] transition-colors duration-200 hover:border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--surface)] sm:bottom-8 sm:right-8">
        <Mail size={18} strokeWidth={1.5} />
      </motion.button>

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
              className="absolute right-5 top-5 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-200 hover:bg-white/20">
              <X size={20} strokeWidth={1.5} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="lg:pl-60">
        {/* ============ HERO ============ */}
        <section id="home" className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-6 pb-24 pt-28 lg:pt-24">
          {/* Background video — scoped to this section, sits inside main's lg:pl-60 so it never covers the sidebar */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
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
                  "radial-gradient(ellipse 72% 80% at 50% 50%, var(--scrim-core) 0%, var(--scrim-core) 52%, var(--scrim-edge) 100%)",
              }}
            />
          </div>

          <motion.div initial="hidden" animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: reduce ? 0 : 0.12, delayChildren: 0.1 } } }}
            className="relative z-10 mx-auto w-full max-w-3xl text-center">
            <div className="flex justify-center">
              <div className="inline-block">
                <div className="relative">
                  <motion.h1 variants={heroFade}
                    className="hero-mark font-display font-normal leading-[0.85] tracking-[0.01em] text-[var(--ink)]"
                    style={{ fontSize: "clamp(5rem, 20vw, 14rem)" }}>
                    <span className="sr-only">Marcelo Di Maggio — Surgery &amp; Team</span>
                    <span aria-hidden="true">MDM</span>
                  </motion.h1>
                  <motion.div variants={heroFade} aria-hidden="true"
                    className="absolute inset-0 flex items-center" style={{ paddingTop: "5.02%" }}>
                    <div className="w-full bg-[var(--band)] py-[1%]">
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
                  className="mt-[1%] block w-full overflow-visible">
                  <text x="0" y="36" textLength="1000" lengthAdjust="spacing" fontSize="32"
                    fontWeight="300" fill="var(--faint)" fontFamily="Inter, system-ui, sans-serif">
                    surgery &amp; team
                  </text>
                </motion.svg>
              </div>
            </div>

            <motion.p variants={heroFade} className="hero-text mx-auto mt-10 max-w-lg text-[13px] leading-relaxed text-[var(--hero-body)] sm:text-[14px]">
              {t.hero.intro}
            </motion.p>
            <motion.div variants={heroFade} className="mt-9">
              <button onClick={() => scrollTo("contact")}
                className="cursor-pointer border border-[var(--ink)] bg-[var(--surface)] px-9 py-4 font-sans text-[10px] uppercase text-[var(--ink)] shadow-[0_2px_14px_var(--shadow)] transition-colors duration-200 hover:bg-[var(--ink)] hover:text-[var(--surface)] sm:text-[11px]"
                style={{ letterSpacing: "0.28em" }}>
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
            className="absolute bottom-8 left-1/2 z-10 flex h-11 w-11 -translate-x-1/2 cursor-pointer items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] transition-colors duration-200 hover:border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--surface)]">
            <motion.span animate={reduce ? {} : { y: [0, 4, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}>
              <ArrowDown size={17} strokeWidth={1.5} />
            </motion.span>
          </motion.button>
        </section>

        <div className="mx-auto max-w-5xl px-6 pb-20 sm:px-10">
          {/* ============ AREAS ============ */}
          <section id="areas" className="scroll-mt-24 pt-24">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
              <Eyebrow>{t.areas.eyebrow}</Eyebrow>
              <SectionTitle>{t.areas.title}</SectionTitle>
              <p className="mt-5 max-w-2xl text-[14px] leading-relaxed text-[var(--muted)]">{t.areas.body}</p>
            </motion.div>
            <motion.div variants={container} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
              className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {AREAS.map((a) => (
                <motion.div key={a.en.t} variants={fadeUp} whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}
                  className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-7 transition-shadow duration-200 hover:shadow-[0_10px_30px_var(--shadow)]">
                  <h3 className="font-display text-xl font-normal text-[var(--ink)]">{a[lang].t}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-[var(--muted)]">{a[lang].d}</p>
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
                    <i.icon size={17} strokeWidth={1.4} className="mt-0.5 flex-shrink-0 text-[var(--faint)]" />
                    <span className="text-[13px] leading-relaxed text-[var(--muted)]">{i[lang]}</span>
                  </motion.div>
                ))}
              </div>
              <motion.p variants={fadeUp} className="mt-6 border-t border-[var(--line)] pt-5 text-[12px] leading-relaxed text-[var(--faint)]">
                {t.areas.includedNote}
              </motion.p>
            </motion.div>

            <Slogan text={t.areas.slogan} />
          </section>

          {/* ============ TEAM ============ */}
          <section id="team" className="scroll-mt-24 pt-24">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
              <Eyebrow>{t.team.eyebrow}</Eyebrow>
              <SectionTitle>{t.team.title}</SectionTitle>
              <p className="mt-5 max-w-2xl text-[14px] leading-relaxed text-[var(--muted)]">{t.team.body}</p>
              <p className="mt-6 font-display text-xl font-normal italic text-[var(--ink)]">“{t.team.quote}”</p>
            </motion.div>

            <motion.div id="dr-di-maggio" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}
              variants={container} className="mt-12 grid scroll-mt-24 grid-cols-1 gap-8 md:grid-cols-[minmax(0,340px)_1fr] md:items-center">
              <motion.div variants={fadeUp} className="overflow-hidden rounded-2xl">
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
                <ul className="mt-6 space-y-2">
                  {LEAD[lang].creds.map((c) => (
                    <li key={c} className="flex items-start gap-2 text-[14px] text-[var(--muted)]">
                      <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-[var(--faint)]" />{c}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-wrap gap-2">
                  <IconLink Icon={Mail} label="Email" href={`mailto:${CONTACT_EMAIL}`} />
                  <IconLink Icon={Facebook} label="Facebook" href={SOCIAL_LINKS.facebook} />
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
              <motion.div variants={container} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}
                className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {SPECIALISTS.map((sp) => (
                  <motion.div key={sp.name} variants={fadeUp} whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}
                    className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6 transition-shadow duration-200 hover:shadow-[0_10px_30px_var(--shadow)]">
                    <h3 className="font-display text-lg font-normal text-[var(--ink)]">{sp.name}</h3>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-[var(--muted)]">{sp[lang]}</p>
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
                className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {ASSISTANTS.map((a) => (
                  <motion.div key={a.name} variants={fadeUp} whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}
                    className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6 transition-shadow duration-200 hover:shadow-[0_10px_30px_var(--shadow)]">
                    <h3 className="font-display text-lg font-normal text-[var(--ink)]">{a.name}</h3>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-[var(--muted)]">{a[lang]}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* ============ PROCEDURES ============ */}
          {/* Vista partida: a la izquierda solo los nombres, a la derecha una ficha
              fija que sigue al cursor por la lista. */}
          <section id="procedures" className="scroll-mt-24 pt-24">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
              <Eyebrow>{t.proc.eyebrow}</Eyebrow>
              <SectionTitle>{t.proc.title}</SectionTitle>
            </motion.div>

            {(() => {
              const p = PROCEDURES.find((x) => x.slug === activeProc) ?? PROCEDURES[0];
              return (
                <div className="mt-10 rounded-xl border border-[var(--line)] p-5 sm:p-7">
                  <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
                  {/* Lista de nombres */}
                  <motion.ul variants={container} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}
                    className="border-t border-[var(--line)]">
                    {PROCEDURES.map((x) => {
                      const on = x.slug === p.slug;
                      return (
                        <motion.li key={x.slug} variants={fadeUp} className="border-b border-[var(--line)]">
                          <button type="button"
                            onClick={() => { setActiveProc(x.slug); if (window.matchMedia("(max-width: 1023px)").matches) setProcModal(true); }}
                            aria-current={on}
                            className="group flex w-full cursor-pointer items-center gap-4 py-4 text-left transition-colors duration-200">
                            {x.art ? (
                              <img src={x.art} alt="" aria-hidden="true"
                                className={`proc-art h-6 w-6 flex-shrink-0 object-contain transition-opacity duration-200 ${on ? "opacity-100" : "opacity-45 group-hover:opacity-70"}`} />
                            ) : (
                              <x.icon size={17} strokeWidth={1.3} aria-hidden="true"
                                className={`h-6 w-6 flex-shrink-0 transition-colors duration-200 ${on ? "text-[var(--ink)]" : "text-[var(--faint)] group-hover:text-[var(--muted)]"}`} />
                            )}
                            <span className={`font-display text-[17px] font-normal leading-snug transition-colors duration-200 sm:text-[19px] ${on ? "text-[var(--ink)]" : "text-[var(--muted)] group-hover:text-[var(--ink)]"}`}>
                              {x[lang].name}
                            </span>
                            <ArrowRight size={16} strokeWidth={1.4}
                              className={`ml-auto flex-shrink-0 transition-all duration-200 ${on ? "translate-x-0 text-[var(--ink)] opacity-100" : "-translate-x-2 text-[var(--faint)] opacity-0"}`} />
                          </button>
                        </motion.li>
                      );
                    })}
                  </motion.ul>

                  {/* Ficha fija */}
                  <div className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
                    <motion.article key={p.slug}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.28, ease: "easeOut" }}
                      className="relative flex flex-col overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] p-7 sm:p-8">
                      {p.art && (
                        <img src={p.art} alt="" aria-hidden="true"
                          className="proc-art pointer-events-none absolute -bottom-8 -right-8 w-52 opacity-[0.07]" />
                      )}
                      <div className="relative">
                        {p.art ? (
                          <img src={p.art} alt="" aria-hidden="true"
                            className="proc-art h-12 w-auto max-w-[64px] object-contain object-left" />
                        ) : (
                          <p.icon size={28} strokeWidth={1.2} aria-hidden="true" className="h-12 text-[var(--ink)]" />
                        )}
                        <h3 className="mt-5 font-display text-[24px] font-normal leading-snug text-[var(--ink)] sm:text-[28px]">
                          {p[lang].name}
                        </h3>
                        <p className="mt-3 text-[14px] leading-relaxed text-[var(--muted)]">{p[lang].desc}</p>

                        <dl className="mt-6 space-y-2 border-t border-[var(--line)] pt-5 text-[13px]">
                          <div className="flex justify-between gap-4">
                            <dt className="text-[var(--faint)]">{t.proc.duration}</dt>
                            <dd className="text-right text-[var(--ink)]">{p[lang].duration}</dd>
                          </div>
                          <div className="flex justify-between gap-4">
                            <dt className="text-[var(--faint)]">{t.proc.recovery}</dt>
                            <dd className="text-right text-[var(--ink)]">{p[lang].recovery}</dd>
                          </div>
                        </dl>

                        <button type="button" onClick={() => askAbout(p[lang].name)}
                          className="mt-7 w-full cursor-pointer border border-[var(--ink)] bg-[var(--ink)] px-4 py-3 text-[10px] uppercase tracking-[0.16em] text-[var(--surface)] transition-opacity duration-200 hover:opacity-85">
                          {t.proc.ask}
                        </button>

                        <button type="button" onClick={() => goToResult(p.slug)}
                          className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 border border-[var(--line)] px-4 py-2.5 text-[10px] uppercase tracking-[0.16em] text-[var(--ink)] transition-colors duration-200 hover:border-[var(--ink)] hover:bg-[var(--chip)]">
                          {t.proc.cta}
                          <ArrowRight size={13} strokeWidth={1.5} />
                        </button>
                        <AnimatePresence>
                          {igHint === p.slug && (
                            <motion.a key="ig-hint" href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer"
                              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                              transition={{ duration: 0.25, ease: "easeOut" }}
                              className="mt-2 flex items-center justify-center gap-2 text-[11px] leading-snug text-[var(--faint)] transition-colors hover:text-[var(--ink)]">
                              <Instagram size={13} strokeWidth={1.5} className="flex-shrink-0" />
                              {t.proc.noResults}
                            </motion.a>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.article>
                  </div>
                  </div>

                  {/* Movil: la ficha se abre como ventana emergente sobre la pagina */}
                  <AnimatePresence>
                    {procModal && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setProcModal(false)} role="dialog" aria-modal="true"
                        className="fixed inset-0 z-[90] flex items-end justify-center bg-black/45 p-4 backdrop-blur-md lg:hidden">
                        <motion.div onClick={(e) => e.stopPropagation()}
                          initial={{ y: 28, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 28, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="relative max-h-[86vh] w-full overflow-y-auto rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 pb-8 shadow-[0_20px_60px_var(--shadow)]">
                          <button type="button" onClick={() => setProcModal(false)} aria-label={t.a11y.close}
                            className="absolute right-4 top-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] transition-colors duration-200 hover:border-[var(--ink)] hover:text-[var(--ink)]">
                            <X size={17} strokeWidth={1.6} />
                          </button>
                          {p.art ? (
                            <img src={p.art} alt="" aria-hidden="true" className="proc-art h-11 w-auto max-w-[60px] object-contain object-left" />
                          ) : (
                            <p.icon size={26} strokeWidth={1.2} aria-hidden="true" className="h-11 text-[var(--ink)]" />
                          )}
                          <h3 className="mt-4 max-w-[85%] font-display text-[23px] font-normal leading-snug text-[var(--ink)]">
                            {p[lang].name}
                          </h3>
                          <p className="mt-3 text-[14px] leading-relaxed text-[var(--muted)]">{p[lang].desc}</p>
                          <dl className="mt-5 space-y-2 border-t border-[var(--line)] pt-4 text-[13px]">
                            <div className="flex justify-between gap-4">
                              <dt className="text-[var(--faint)]">{t.proc.duration}</dt>
                              <dd className="text-right text-[var(--ink)]">{p[lang].duration}</dd>
                            </div>
                            <div className="flex justify-between gap-4">
                              <dt className="text-[var(--faint)]">{t.proc.recovery}</dt>
                              <dd className="text-right text-[var(--ink)]">{p[lang].recovery}</dd>
                            </div>
                          </dl>
                          <button type="button" onClick={() => { setProcModal(false); askAbout(p[lang].name); }}
                            className="mt-6 w-full cursor-pointer border border-[var(--ink)] bg-[var(--ink)] px-4 py-3 text-[10px] uppercase tracking-[0.16em] text-[var(--surface)] transition-opacity duration-200 hover:opacity-85">
                            {t.proc.ask}
                          </button>
                          <button type="button" onClick={() => { setProcModal(false); goToResult(p.slug); }}
                            className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 border border-[var(--line)] px-4 py-2.5 text-[10px] uppercase tracking-[0.16em] text-[var(--ink)] transition-colors duration-200 hover:border-[var(--ink)]">
                            {t.proc.cta}
                            <ArrowRight size={13} strokeWidth={1.5} />
                          </button>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })()}

            <p className="mt-8 max-w-2xl text-[12px] leading-relaxed text-[var(--faint)]">{t.proc.note}</p>
          </section>

          {/* ============ RESULTADOS ============ */}
          {/* One gallery block: procedure tabs on top, then the cases of whichever is
              selected. The frame keeps a fixed height so the page never jumps. */}
          <section id="resultados" className="scroll-mt-24 pt-24">
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
                  {/* Procedure filter */}
                  {/* Selector de procedimiento: una sola linea en vez de la fila de fichas */}
                  <div className="mt-10 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[0_6px_20px_var(--shadow)] sm:p-5">
                    <label htmlFor="res-filtro" className="block text-[10px] uppercase tracking-[0.26em] text-[var(--faint)]">
                      {t.res.filter}
                    </label>
                    <div className="relative mt-2">
                      <select id="res-filtro" value={proc.slug}
                        onChange={(e) => { setActiveSlug(e.target.value); setActiveCase(0); setActiveAngle(0); }}
                        className="w-full cursor-pointer appearance-none rounded-lg border-2 border-[var(--ink)] bg-[var(--ink)] py-3.5 pl-5 pr-12 font-display text-[19px] text-[var(--surface)] transition-opacity duration-200 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--rule)] sm:text-[22px]">
                        {PROCEDURES_WITH_CASES.map((x) => (
                          <option key={x.slug} value={x.slug}>{x[lang].name}</option>
                        ))}
                      </select>
                      <ChevronDown size={20} strokeWidth={1.6} aria-hidden="true"
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--surface)]" />
                    </div>
                  </div>

                  <div id={`res-${proc.slug}`} className="mt-8 scroll-mt-24 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-7">
                    {/* Case selector */}
                    <p className="truncate text-[11px] uppercase tracking-[0.18em] text-[var(--faint)]">{proc[lang].name}</p>
                    <div className="mt-3 flex h-[34px] items-center gap-3">
                      <div ref={casesRef} className="no-scrollbar flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
                        {cases.map((c, k) => (
                          <button key={c.n} type="button" aria-pressed={k === ci}
                            onClick={() => { setActiveCase(k); setActiveAngle(0); }}
                            className={`flex-shrink-0 cursor-pointer rounded-full border px-4 py-1.5 text-[11px] uppercase tracking-[0.16em] transition-colors duration-200 ${
                              k === ci
                                ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--surface)]"
                                : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--ink)] hover:text-[var(--ink)]"}`}>
                            {t.res.case} {c.n}
                          </button>
                        ))}
                      </div>
                      {cases.length > 4 && (
                        <div className="flex flex-shrink-0 items-center gap-1.5">
                          <button type="button" aria-label={t.res.prevCase} title={t.res.prevCase}
                            onClick={() => scrollCarousel(casesRef, -1)}
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] transition-colors duration-200 hover:border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--surface)]">
                            <ArrowLeft size={14} strokeWidth={1.5} />
                          </button>
                          <button type="button" aria-label={t.res.nextCase} title={t.res.nextCase}
                            onClick={() => scrollCarousel(casesRef, 1)}
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] transition-colors duration-200 hover:border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--surface)]">
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
                              className={`relative h-16 w-16 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border transition-colors duration-200 ${
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
                  </div>
                </>
              );
            })()}
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
                      <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--faint)]">{c.institution}</p>
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
                  className="group mt-6 flex cursor-pointer items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[var(--faint)] transition-colors duration-200 hover:text-[var(--ink)]">
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
                  <motion.article key={p.slug} variants={fadeUp}
                    className="flex w-[85vw] max-w-[560px] flex-shrink-0 snap-start flex-col rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6 transition-shadow duration-200 hover:shadow-[0_10px_30px_var(--shadow)] sm:w-[60vw] sm:p-7 lg:w-[38vw]">
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
              const all = TESTIMONIALS.map((x) => ({ initials: x.initials, place: x.place, text: x[lang], stars: x.stars }));
              const totalPages = Math.max(1, Math.ceil(all.length / TEST_PAGE_SIZE));
              const page = ((testPage % totalPages) + totalPages) % totalPages;
              const visible = all.slice(page * TEST_PAGE_SIZE, page * TEST_PAGE_SIZE + TEST_PAGE_SIZE);
              return (
                <>
                  <motion.div key={page} variants={container} initial="hidden" animate="visible"
                    className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {visible.map((x, i) => (
                      <motion.figure key={`${x.initials}-${page}-${i}`} variants={fadeUp}
                        className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6">
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
                      </motion.figure>
                    ))}
                  </motion.div>
                  {totalPages > 1 && (
                    <div className="mt-5 flex items-center justify-end gap-3">
                      <button type="button" onClick={() => setTestPage((p) => p - 1)}
                        aria-label={t.test.prev} title={t.test.prev}
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] transition-colors duration-200 hover:border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--surface)]">
                        <ArrowLeft size={16} strokeWidth={1.5} />
                      </button>
                      <span className="text-[11px] tracking-wide text-[var(--faint)]">{page + 1} / {totalPages}</span>
                      <button type="button" onClick={() => setTestPage((p) => p + 1)}
                        aria-label={t.test.next} title={t.test.next}
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)] transition-colors duration-200 hover:border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--surface)]">
                        <ArrowRight size={16} strokeWidth={1.5} />
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
              className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
              {LOCATIONS.map((l) => (
                <motion.div key={l.city} variants={fadeUp}
                  className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-7">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} strokeWidth={1.4} className="text-[var(--faint)]" />
                    <h3 className="font-display text-xl font-normal text-[var(--ink)]">{l.city}</h3>
                  </div>
                  <p className="mt-3 text-[13px] leading-relaxed text-[var(--muted)]">{l[lang]}</p>
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* ============ CONTACT ============ */}
          <section id="contact" className="scroll-mt-24 pt-24">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}
              className="rounded-2xl bg-[var(--contact-bg)] px-8 py-12 sm:px-12">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--contact-ink)] opacity-50">{t.contact.eyebrow}</p>
              <h2 className="mt-3 font-display text-3xl font-normal text-[var(--contact-ink)] sm:text-4xl">{t.contact.title}</h2>
              <p className="mt-4 max-w-md text-[14px] leading-relaxed text-[var(--contact-ink)] opacity-70">{t.contact.body}</p>
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
                      className="mt-2 w-full rounded-lg border border-[var(--contact-ink)]/25 bg-transparent px-3 py-2.5 text-[13px] text-[var(--contact-ink)] outline-none transition-colors placeholder:text-[var(--contact-ink)]/35 focus:border-[var(--contact-ink)]" />
                  </label>
                  <label className="block">
                    <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--contact-ink)] opacity-60">{t.contact.fEmail}</span>
                    <input type="email" value={cForm.email} placeholder={t.contact.fEmailPh} maxLength={90}
                      onChange={(e) => setCForm({ ...cForm, email: e.target.value })}
                      className="mt-2 w-full rounded-lg border border-[var(--contact-ink)]/25 bg-transparent px-3 py-2.5 text-[13px] text-[var(--contact-ink)] outline-none transition-colors placeholder:text-[var(--contact-ink)]/35 focus:border-[var(--contact-ink)]" />
                  </label>
                </div>
                <label className="block">
                  <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--contact-ink)] opacity-60">{t.contact.fMsg}</span>
                  <textarea id="contact-msg" rows={4} value={cForm.msg} placeholder={t.contact.fMsgPh} maxLength={800}
                    onChange={(e) => setCForm({ ...cForm, msg: e.target.value })}
                    className="mt-2 w-full resize-y rounded-lg border border-[var(--contact-ink)]/25 bg-transparent px-3 py-2.5 text-[13px] text-[var(--contact-ink)] outline-none transition-colors placeholder:text-[var(--contact-ink)]/35 focus:border-[var(--contact-ink)]" />
                </label>
                {cErr && <p className="text-[12px] text-[#E0908D]">{cErr}</p>}
                <div className="flex flex-wrap items-center gap-4">
                  <button type="submit"
                    className="cursor-pointer bg-[var(--contact-ink)] px-8 py-3.5 text-[11px] uppercase tracking-[0.22em] text-[var(--contact-bg)] transition-opacity duration-200 hover:opacity-85">
                    {t.contact.send}
                  </button>
                  {cSent && (
                    <span className="flex items-center gap-1.5 text-[12px] text-[var(--contact-ink)] opacity-80">
                      <Check size={14} strokeWidth={1.6} /> {t.contact.thanks}
                    </span>
                  )}
                </div>
                <p className="text-[11px] leading-relaxed text-[var(--contact-ink)] opacity-45">{t.contact.note}</p>
              </form>
            </motion.div>
          </section>

          {/* ============ FOOTER ============ */}
          <footer className="mt-24 border-t border-[var(--line)] pt-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div>
                <button onClick={() => scrollTo("home")} aria-label={t.a11y.home} className="cursor-pointer text-left">
                  <span className="font-display text-xl font-normal tracking-wide text-[var(--ink)]">MDM</span>
                </button>
                <p className="mt-1 text-[9px] uppercase tracking-[0.26em] text-[var(--faint)]">
                  Marcelo Di Maggio · Surgery &amp; Team
                </p>
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
            <p className="mt-10 text-[11px] tracking-wide text-[var(--faint)]">
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
