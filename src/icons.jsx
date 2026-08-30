/* Set de iconos propio — reemplaza los genericos de lucide-react en el "chrome"
   mas visible del sitio (toggle de tema/idioma, sedes, servicios incluidos).
   Mismo contrato que lucide: size, strokeWidth, className, stroke=currentColor,
   asi son intercambiables con los componentes que reemplazan. Trazo fino,
   remates y uniones redondeadas — el mismo lenguaje que ya usan los iconos de
   procedimiento (src/assets/proc), asi todo el sistema de iconos queda parejo. */

const base = (size, strokeWidth) => ({
  width: size, height: size, viewBox: "0 0 24 24", fill: "none",
  stroke: "currentColor", strokeWidth, strokeLinecap: "round", strokeLinejoin: "round",
});

export const SunIcon = ({ size = 16, strokeWidth = 1.9, className }) => (
  <svg {...base(size, strokeWidth)} className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.5v2.4M12 19.1v2.4M4.2 12H1.8M22.2 12h-2.4M6 6l-1.6-1.6M19.6 19.6 18 18M18 6l1.6-1.6M4.4 19.6 6 18" />
  </svg>
);

export const MoonIcon = ({ size = 16, strokeWidth = 1.9, className }) => (
  <svg {...base(size, strokeWidth)} className={className} aria-hidden="true">
    <path d="M20.2 14.4A8.6 8.6 0 1 1 9.6 3.8a7 7 0 0 0 10.6 10.6Z" />
  </svg>
);

export const GlobeIcon = ({ size = 16, strokeWidth = 1.9, className }) => (
  <svg {...base(size, strokeWidth)} className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <ellipse cx="12" cy="12" rx="3.6" ry="9" />
    <path d="M3 12h18M4.3 7.5h15.4M4.3 16.5h15.4" />
  </svg>
);

/* --- Sedes: un mark por ciudad en vez del mismo pin repetido cuatro veces --- */

export const ObeliskIcon = ({ size = 16, strokeWidth = 1.9, className }) => ( // Buenos Aires
  <svg {...base(size, strokeWidth)} className={className} aria-hidden="true">
    <path d="M10.6 21V8.2L12 3l1.4 5.2V21" />
    <path d="M9.4 21h5.2M10.1 17.4h3.8M10.4 14.6h3.2" />
  </svg>
);

export const BellTowerIcon = ({ size = 16, strokeWidth = 1.9, className }) => ( // Cordoba
  <svg {...base(size, strokeWidth)} className={className} aria-hidden="true">
    <path d="M9 21V9.5a3 3 0 0 1 6 0V21" />
    <path d="M10.3 9.5V5.8M13.7 9.5V5.8M9 9.5h6" />
    <path d="M12 5.8V2.6M10.4 3.6l1.6-1 1.6 1" />
    <path d="M7.8 21h8.4" />
  </svg>
);

export const SpireIcon = ({ size = 16, strokeWidth = 1.9, className }) => ( // Madrid
  <svg {...base(size, strokeWidth)} className={className} aria-hidden="true">
    <path d="M12 2.4v3.2M9.6 8.4 12 5.6l2.4 2.8" />
    <path d="M10.4 21V8.4h3.2V21" />
    <path d="M8.6 21h6.8M9.4 17.2h5.2M9.7 14h4.6" />
  </svg>
);

export const SkylineIcon = ({ size = 16, strokeWidth = 1.9, className }) => ( // Nueva York
  <svg {...base(size, strokeWidth)} className={className} aria-hidden="true">
    <path d="M4 21V11.5l2.4-1.4V21" />
    <path d="M9.6 21V6.6L12.4 4l2.8 2.6V21" />
    <path d="M11.4 4V1.8M20 21v-8.6l-2.4-1.3V21" />
    <path d="M3 21h18" />
  </svg>
);

/* --- Servicios incluidos --- */

export const PlaneIcon = ({ size = 16, strokeWidth = 1.9, className }) => (
  <svg {...base(size, strokeWidth)} className={className} aria-hidden="true">
    <path d="M21 12.5 13.6 9.8V4.6a1.4 1.4 0 0 0-2.8 0v5.2L3 12.5v2l7.8-2.3v4.6l-2.4 1.7v1.6l3.6-1 3.6 1v-1.6l-2.4-1.7v-4.6L21 14.5v-2Z" />
  </svg>
);

export const StayIcon = ({ size = 16, strokeWidth = 1.9, className }) => (
  <svg {...base(size, strokeWidth)} className={className} aria-hidden="true">
    <path d="M3 19V6M3 13h16a2 2 0 0 1 2 2v4M3 10h6a2 2 0 0 1 2 2v1" />
    <circle cx="6.4" cy="8.6" r="1.1" />
  </svg>
);

export const InterpreterIcon = ({ size = 16, strokeWidth = 1.9, className }) => (
  <svg {...base(size, strokeWidth)} className={className} aria-hidden="true">
    <path d="M8.6 14.2H5.6A2.6 2.6 0 0 1 3 11.6V6.8a2.6 2.6 0 0 1 2.6-2.6h6.4a2.6 2.6 0 0 1 2.6 2.6v1" />
    <path d="M10.4 19.8h3l3.4 2.2-.6-2.4a2.6 2.6 0 0 0 2.8-2.6v-3.2a2.6 2.6 0 0 0-2.6-2.6h-5.6a2.6 2.6 0 0 0-2.6 2.6v3.4a2.6 2.6 0 0 0 2.6 2.6Z" />
  </svg>
);

export const AssuranceIcon = ({ size = 16, strokeWidth = 1.9, className }) => (
  <svg {...base(size, strokeWidth)} className={className} aria-hidden="true">
    <path d="M12 2.6 19.5 6v6c0 5-3.2 8.4-7.5 9.4C7.7 20.4 4.5 17 4.5 12V6Z" />
    <path d="m8.6 12.2 2.3 2.3 4.5-4.7" />
  </svg>
);

export const EnvelopeIcon = ({ size = 16, strokeWidth = 1.9, className }) => (
  <svg {...base(size, strokeWidth)} className={className} aria-hidden="true">
    <rect x="3" y="5.5" width="18" height="13" rx="1.6" />
    <path d="m4 7 8 6 8-6" />
  </svg>
);
