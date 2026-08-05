import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform } from "framer-motion";
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
const DEVELOPER_PORTFOLIO_URL = ""; // TODO: add portfolio link here
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xnpaaroa";
const TEST_PAGE_SIZE = 2;

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
          <Star key={n} size={size} strokeWidth={1.4} aria-hidden="true"
            className={n <= value ? "fill-[var(--ink)] text-[var(--ink)]" : "text-[var(--line)]"} />
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

function Slogan({ text }) {
  const rule = {
    hidden: { scaleX: 0 },
    visible: { scaleX: 1, transition: { duration: 0.9, ease: "easeOut" } },
  };
  const word = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.055, delayChildren: 0.15 } } }}
      className="mt-20 text-center"
    >
      <motion.span variants={rule} className="mx-auto block h-px w-20 origin-center bg-[var(--line)]" />
      <p className="mx-auto mt-8 max-w-2xl font-display text-[22px] font-normal italic leading-snug text-[var(--ink)] sm:text-[28px]">
        {text.split(" ").map((w, i) => (
          <motion.span key={i} variants={word} className="inline-block">
            {w}&nbsp;
          </motion.span>
        ))}
      </p>
      <motion.span variants={rule} className="mx-auto mt-8 block h-px w-20 origin-center bg-[var(--line)]" />
    </motion.div>
  );
}

function RailDecor({ side, progress, dotTop }) {
  return (
    <div className={`pointer-events-none fixed inset-y-0 ${side === "left" ? "left-[17rem]" : "right-8"} z-20 hidden 2xl:block`}>
      <div className="absolute inset-y-0 left-0 w-px bg-[var(--line)]" />
      <motion.div style={{ scaleY: progress }} className="absolute inset-x-0 top-0 h-full w-px origin-top bg-[var(--ink)] opacity-25" />
      <span aria-hidden="true" style={{ writingMode: "vertical-rl" }}
        className="absolute left-1/2 top-16 -translate-x-1/2 whitespace-nowrap text-[9px] uppercase tracking-[0.35em] text-[var(--faint)] opacity-60">
        Surgery &amp; Team
      </span>
      <motion.span aria-hidden="true" style={{ top: dotTop }}
        className="absolute left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-[var(--ink)]" />
    </div>
  );
}

function ScrollSideDecor() {
  const { scrollYProgress } = useScroll();
  const dotTop = useTransform(scrollYProgress, [0, 1], ["4%", "92%"]);
  return (
    <>
      <RailDecor side="left" progress={scrollYProgress} dotTop={dotTop} />
      <RailDecor side="right" progress={scrollYProgress} dotTop={dotTop} />
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
  const [openCase, setOpenCase] = useState({});
  const [extra, setExtra] = useState([]);
  const [form, setForm] = useState({ initials: "", place: "", msg: "", stars: 5 });
  const [cForm, setCForm] = useState({ name: "", email: "", msg: "" });
  const [cSent, setCSent] = useState(false);
  const [cErr, setCErr] = useState("");
  const [sent, setSent] = useState(false);
  const [testPage, setTestPage] = useState(0);
  const [lightbox, setLightbox] = useState(null);
  const [igHint, setIgHint] = useState(null);
  const papersRef = useRef(null);
  const [pastHero, setPastHero] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [formErr, setFormErr] = useState("");
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
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
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
    setOpenCase((p) => ({ ...p, [slug]: p[slug] ?? 0 }));
    setTimeout(() => scrollTo(`res-${slug}`), 30);
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

  const submitTestimonial = async (e) => {
    e.preventDefault();
    if (!form.initials.trim() || !form.msg.trim()) { setFormErr(t.test.required); return; }
    setFormErr("");
    const entry = { initials: form.initials.trim().toUpperCase(), place: form.place.trim(), text: form.msg.trim(), stars: form.stars };
    setExtra((p) => [...p, entry]);
    setTestPage(Math.floor((TESTIMONIALS.length + extra.length) / TEST_PAGE_SIZE));
    setForm({ initials: "", place: "", msg: "", stars: 5 });
    setSent(true);
    setTimeout(() => setSent(false), 6000);
    try {
      await submitToFormspree({ form: "testimonial", initials: entry.initials, place: entry.place, message: entry.text, stars: entry.stars });
    } catch {
      // Shown locally regardless; the email notification is best-effort.
    }
  };

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
            <motion.img initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              src={lightbox.src} alt={lightbox.alt} onClick={(e) => e.stopPropagation()}
              className="max-h-full max-w-full cursor-zoom-out rounded-lg object-contain shadow-2xl" />
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
                    className="font-display font-normal leading-[0.85] tracking-[0.01em] text-[var(--ink)]"
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

            <motion.p variants={heroFade} className="mx-auto mt-10 max-w-lg text-[13px] leading-relaxed text-[var(--hero-body)] sm:text-[14px]">
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
          <section id="procedures" className="scroll-mt-24 pt-24">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
              <Eyebrow>{t.proc.eyebrow}</Eyebrow>
              <SectionTitle>{t.proc.title}</SectionTitle>
            </motion.div>
            <motion.div variants={container} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}
              className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {PROCEDURES.map((p) => (
                <motion.div key={p.slug} variants={fadeUp} whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}
                  className="group relative flex flex-col overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6 transition-shadow duration-200 hover:shadow-[0_10px_30px_var(--shadow)]">

                  {/* Artwork revealed faintly on hover */}
                  <img src={p.art} alt="" aria-hidden="true"
                    className="proc-art pointer-events-none absolute -bottom-6 -right-6 w-44 opacity-0 transition-opacity duration-500 group-hover:opacity-[0.09]" />

                  <div className="relative flex flex-1 flex-col">
                    <img src={p.art} alt="" aria-hidden="true"
                      className="proc-art h-14 w-auto max-w-[72px] object-contain object-left" />
                    <h3 className="mt-4 font-display text-[18px] font-normal leading-snug text-[var(--ink)]">{p[lang].name}</h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-[var(--muted)]">{p[lang].desc}</p>

                    <dl className="mt-4 space-y-1.5 border-t border-[var(--line)] pt-4 text-[12px]">
                      <div className="flex justify-between gap-3">
                        <dt className="text-[var(--faint)]">{t.proc.duration}</dt>
                        <dd className="text-right text-[var(--ink)]">{p[lang].duration}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-[var(--faint)]">{t.proc.recovery}</dt>
                        <dd className="text-right text-[var(--ink)]">{p[lang].recovery}</dd>
                      </div>
                    </dl>

                    <div className="mt-5 flex flex-1 flex-col justify-end gap-2">
                      <button type="button" onClick={() => goToResult(p.slug)}
                        className="w-full cursor-pointer border border-[var(--line)] px-4 py-2.5 text-[10px] uppercase tracking-[0.16em] text-[var(--ink)] transition-colors duration-200 hover:border-[var(--ink)]">
                        {t.proc.cta}
                      </button>
                      <AnimatePresence>
                        {igHint === p.slug && (
                          <motion.a key="ig-hint" href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer"
                            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="-mt-1 flex items-center gap-2 text-[11px] leading-snug text-[var(--faint)] transition-colors hover:text-[var(--ink)]">
                            <Instagram size={13} strokeWidth={1.5} className="flex-shrink-0" />
                            {t.proc.noResults}
                          </motion.a>
                        )}
                      </AnimatePresence>
                      <button type="button" onClick={() => askAbout(p[lang].name)}
                        className="w-full cursor-pointer border border-[var(--ink)] bg-[var(--ink)] px-4 py-2.5 text-[10px] uppercase tracking-[0.16em] text-[var(--surface)] transition-opacity duration-200 hover:opacity-85">
                        {t.proc.ask}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <p className="mt-6 max-w-2xl text-[12px] leading-relaxed text-[var(--faint)]">{t.proc.note}</p>
          </section>

          {/* ============ RESULTADOS ============ */}
          <section id="resultados" className="scroll-mt-24 pt-24">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
              <Eyebrow>{t.res.eyebrow}</Eyebrow>
              <SectionTitle>{t.res.title}</SectionTitle>
              <p className="mt-5 max-w-2xl text-[14px] leading-relaxed text-[var(--muted)]">{t.res.body}</p>
            </motion.div>

            <div className="mt-10 space-y-10">
              {PROCEDURES_WITH_CASES.map((p) => {
                const cases = casesFor(p.slug);
                const sel = openCase[p.slug];
                return (
                  <motion.div key={p.slug} id={`res-${p.slug}`} initial="hidden" whileInView="visible"
                    viewport={{ once: true, amount: 0.15 }} variants={fadeUp}
                    className="scroll-mt-24 border-b border-[var(--line)] pb-10 last:border-0">
                    <h3 className="font-display text-2xl font-normal text-[var(--ink)]">{p[lang].name}</h3>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {cases.map((c, ci) => (
                        <button key={c.n}
                          onClick={() => setOpenCase((prev) => ({ ...prev, [p.slug]: prev[p.slug] === ci ? undefined : ci }))}
                          aria-pressed={sel === ci}
                          className={`cursor-pointer rounded-full border px-4 py-1.5 text-[11px] uppercase tracking-[0.16em] transition-colors duration-200 ${
                            sel === ci
                              ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--surface)]"
                              : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--ink)] hover:text-[var(--ink)]"}`}>
                          {t.res.case} {c.n}
                        </button>
                      ))}
                    </div>

                    <AnimatePresence initial={false} mode="wait">
                      {sel !== undefined && cases[sel] && (
                        <motion.div key={sel} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: "easeOut" }}
                          className="overflow-hidden">
                          <div className="pt-6">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <p className="text-[12px] uppercase tracking-[0.18em] text-[var(--faint)]">
                                {t.res.case} {cases[sel].n} · {p[lang].name}
                              </p>
                              <button onClick={() => setOpenCase((prev) => ({ ...prev, [p.slug]: undefined }))}
                                className="cursor-pointer text-[11px] uppercase tracking-[0.16em] text-[var(--faint)] transition-colors hover:text-[var(--ink)]">
                                {t.res.close}
                              </button>
                            </div>
                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                              {[
                                { caption: t.res.before, src: cases[sel].before },
                                { caption: t.res.after, src: cases[sel].after },
                              ].map(({ caption, src }) => (
                                <figure key={caption} className="overflow-hidden rounded-xl border border-[var(--line)]">
                                  <button type="button" onClick={() => setLightbox({ src, alt: `${p[lang].name} · ${caption}` })}
                                    className="group relative block h-64 w-full cursor-zoom-in overflow-hidden bg-[var(--photo)] sm:h-96">
                                    <img src={src} alt={`${p[lang].name} · ${caption}`} loading="lazy"
                                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
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
                            <div className="mt-3 text-right">
                              <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer"
                                className="text-[11px] text-[var(--faint)] transition-colors hover:text-[var(--ink)]">
                                {t.res.viewIg}
                              </a>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {sel === undefined && (
                      <p className="mt-3 text-[12px] text-[var(--faint)]">{t.res.pick}</p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* ============ TRAYECTORIA & PRENSA ============ */}
          <section id="press" className="scroll-mt-24 pt-24">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
              <Eyebrow>{t.press.eyebrow}</Eyebrow>
              <SectionTitle>{t.press.title}</SectionTitle>
              <p className="mt-5 max-w-2xl text-[14px] leading-relaxed text-[var(--muted)]">{t.press.body}</p>
            </motion.div>

            <div id="interviews" className="scroll-mt-24 pt-12">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
                <Eyebrow>{t.interviews.eyebrow}</Eyebrow>
                <SectionTitle>{t.interviews.title}</SectionTitle>
                <p className="mt-5 max-w-2xl text-[14px] leading-relaxed text-[var(--muted)]">{t.interviews.body}</p>
              </motion.div>
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
            </div>

            <div id="certs" className="scroll-mt-24 pt-20">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
                <Eyebrow>{t.certs.eyebrow}</Eyebrow>
                <SectionTitle>{t.certs.title}</SectionTitle>
                <p className="mt-5 max-w-2xl text-[14px] leading-relaxed text-[var(--muted)]">{t.certs.body}</p>
              </motion.div>
              <motion.ul variants={container} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}
                className="mt-10 border-t border-[var(--line)]">
                {CERTIFICATES.map((c) => (
                  <motion.li key={c.slug} variants={fadeUp}
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
            </div>

            <div id="papers" className="scroll-mt-24 pt-20">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
                <Eyebrow>{t.papers.eyebrow}</Eyebrow>
                <SectionTitle>{t.papers.title}</SectionTitle>
                <p className="mt-5 max-w-2xl text-[14px] leading-relaxed text-[var(--muted)]">{t.papers.body}</p>
              </motion.div>
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
            </div>
          </section>

          {/* ============ TESTIMONIOS ============ */}
          <section id="testimonios" className="scroll-mt-24 pt-24">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUp}>
              <Eyebrow>{t.test.eyebrow}</Eyebrow>
              <SectionTitle>{t.test.title}</SectionTitle>
            </motion.div>

            {(() => {
              const all = [...TESTIMONIALS.map((x) => ({ initials: x.initials, place: x.place, text: x[lang], stars: x.stars })), ...extra];
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

            {/* Form */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={fadeUp}
              className="mt-10 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-8">
              <h3 className="font-display text-xl font-normal text-[var(--ink)]">{t.test.formTitle}</h3>
              <form onSubmit={submitTestimonial} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--faint)]">{t.test.name}</span>
                    <input type="text" value={form.initials} maxLength={8} placeholder={t.test.namePh}
                      onChange={(e) => setForm({ ...form, initials: e.target.value })}
                      className="mt-2 w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-[13px] text-[var(--ink)] outline-none transition-colors focus:border-[var(--ink)]" />
                  </label>
                  <label className="block">
                    <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--faint)]">{t.test.place}</span>
                    <input type="text" value={form.place} maxLength={40} placeholder={t.test.placePh}
                      onChange={(e) => setForm({ ...form, place: e.target.value })}
                      className="mt-2 w-full rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-[13px] text-[var(--ink)] outline-none transition-colors focus:border-[var(--ink)]" />
                  </label>
                </div>
                <label className="block">
                  <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--faint)]">{t.test.msg}</span>
                  <textarea rows={4} value={form.msg} maxLength={500} placeholder={t.test.msgPh}
                    onChange={(e) => setForm({ ...form, msg: e.target.value })}
                    className="mt-2 w-full resize-y rounded-lg border border-[var(--line)] bg-[var(--bg)] px-3 py-2.5 text-[13px] text-[var(--ink)] outline-none transition-colors focus:border-[var(--ink)]" />
                </label>
                <div>
                  <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--faint)]">{t.test.rating}</span>
                  <div className="mt-2">
                    <Stars value={form.stars} onChange={(n) => setForm({ ...form, stars: n })} t={t} />
                  </div>
                </div>
                {formErr && <p className="text-[12px] text-[#C0524F]">{formErr}</p>}
                <div className="flex flex-wrap items-center gap-4">
                  <button type="submit"
                    className="cursor-pointer border border-[var(--ink)] bg-[var(--ink)] px-8 py-3 text-[10px] uppercase tracking-[0.24em] text-[var(--surface)] transition-opacity duration-200 hover:opacity-85">
                    {t.test.send}
                  </button>
                  {sent && (
                    <span className="flex items-center gap-1.5 text-[12px] text-[var(--muted)]">
                      <Check size={14} strokeWidth={1.6} /> {t.test.thanks}
                    </span>
                  )}
                </div>
                <p className="text-[11px] leading-relaxed text-[var(--faint)]">{t.test.note}</p>
              </form>
            </motion.div>
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
              className="rounded-2xl bg-[var(--inv-bg)] px-8 py-12 sm:px-12">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--inv-ink)] opacity-50">{t.contact.eyebrow}</p>
              <h2 className="mt-3 font-display text-3xl font-normal text-[var(--inv-ink)] sm:text-4xl">{t.contact.title}</h2>
              <p className="mt-4 max-w-md text-[14px] leading-relaxed text-[var(--inv-ink)] opacity-70">{t.contact.body}</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px] text-[var(--inv-ink)] opacity-80">
                <a href={`mailto:${CONTACT_EMAIL}`} className="transition-opacity hover:opacity-100">{CONTACT_EMAIL}</a>
                <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-100">{INSTAGRAM_HANDLE}</a>
              </div>
              <form onSubmit={submitEnquiry} className="mt-8 max-w-xl space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--inv-ink)] opacity-60">{t.contact.fName}</span>
                    <input type="text" value={cForm.name} placeholder={t.contact.fNamePh} maxLength={60}
                      onChange={(e) => setCForm({ ...cForm, name: e.target.value })}
                      className="mt-2 w-full rounded-lg border border-[var(--inv-ink)]/25 bg-transparent px-3 py-2.5 text-[13px] text-[var(--inv-ink)] outline-none transition-colors placeholder:text-[var(--inv-ink)]/35 focus:border-[var(--inv-ink)]" />
                  </label>
                  <label className="block">
                    <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--inv-ink)] opacity-60">{t.contact.fEmail}</span>
                    <input type="email" value={cForm.email} placeholder={t.contact.fEmailPh} maxLength={90}
                      onChange={(e) => setCForm({ ...cForm, email: e.target.value })}
                      className="mt-2 w-full rounded-lg border border-[var(--inv-ink)]/25 bg-transparent px-3 py-2.5 text-[13px] text-[var(--inv-ink)] outline-none transition-colors placeholder:text-[var(--inv-ink)]/35 focus:border-[var(--inv-ink)]" />
                  </label>
                </div>
                <label className="block">
                  <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--inv-ink)] opacity-60">{t.contact.fMsg}</span>
                  <textarea id="contact-msg" rows={4} value={cForm.msg} placeholder={t.contact.fMsgPh} maxLength={800}
                    onChange={(e) => setCForm({ ...cForm, msg: e.target.value })}
                    className="mt-2 w-full resize-y rounded-lg border border-[var(--inv-ink)]/25 bg-transparent px-3 py-2.5 text-[13px] text-[var(--inv-ink)] outline-none transition-colors placeholder:text-[var(--inv-ink)]/35 focus:border-[var(--inv-ink)]" />
                </label>
                {cErr && <p className="text-[12px] text-[#E0908D]">{cErr}</p>}
                <div className="flex flex-wrap items-center gap-4">
                  <button type="submit"
                    className="cursor-pointer bg-[var(--inv-ink)] px-8 py-3.5 text-[11px] uppercase tracking-[0.22em] text-[var(--inv-bg)] transition-opacity duration-200 hover:opacity-85">
                    {t.contact.send}
                  </button>
                  {cSent && (
                    <span className="flex items-center gap-1.5 text-[12px] text-[var(--inv-ink)] opacity-80">
                      <Check size={14} strokeWidth={1.6} /> {t.contact.thanks}
                    </span>
                  )}
                </div>
                <p className="text-[11px] leading-relaxed text-[var(--inv-ink)] opacity-45">{t.contact.note}</p>
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
              © 2026 MDM Surgery — Marcelo Di Maggio &amp; Team.
            </p>
            <p className="mt-2 text-[11px] tracking-wide text-[var(--faint)]">
              {t.footer.madeBy}:{" "}
              {DEVELOPER_PORTFOLIO_URL ? (
                <a href={DEVELOPER_PORTFOLIO_URL} target="_blank" rel="noopener noreferrer"
                  className="underline decoration-dotted underline-offset-2 transition-colors hover:text-[var(--ink)]">
                  Portfolio
                </a>
              ) : (
                <span className="italic opacity-70">Portfolio (próximamente)</span>
              )}
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
