import {
  Aperture, Scan, Triangle, Eye, Flower2, Hexagon, MoveUp, Wind,
  Focus, Circle, Smile, Activity, Feather, PersonStanding, Sparkles, Gem,
  Receipt, Hotel, Plane, Headphones,
} from "lucide-react";

const ART = import.meta.glob("./assets/proc/*.png", { eager: true, import: "default" });
const artFor = (slug) => ART[`./assets/proc/${slug}.png`];

const CERT_IMAGES = import.meta.glob("./assets/certificados/*.{jpg,jpeg,png}", { eager: true, import: "default" });
const PAPER_IMAGES = import.meta.glob("./assets/pappers/*.{jpg,jpeg,png}", { eager: true, import: "default" });

const CASE_IMAGES = import.meta.glob("./assets/procedimientos/*/*/*.{jpg,jpeg,png,webp}", { eager: true, import: "default" });

/* Encuadre de cada foto, calculado con revision3/encuadre.py.
   - fotos:  [ancho, alto, izquierda, arriba] en porcentaje del recuadro. Amplia la foto
             sobre la zona del procedimiento y deja el mismo punto de la cara en el mismo
             lugar del recuadro en el antes y en el despues.
   - marcos: proporcion del recuadro, la de las propias fotos del par, para que no queden
             franjas vacias ni recortes que dejen la foto demasiado cerca.
   - aparte: proporcion exacta de las fotos sueltas, que se muestran enteras.
   El archivo no se toca: el lightbox sigue mostrando la foto original entera. */
import ENCUADRES from "./encuadre.json";
const clave = (slug, caseId, file) => `${slug}/${caseId}/${file}`.normalize("NFC");
const encuadreDe = (slug, caseId, file) => {
  const r = ENCUADRES.fotos[clave(slug, caseId, file)];
  return r ? { width: `${r[0]}%`, height: `${r[1]}%`, left: `${r[2]}%`, top: `${r[3]}%`,
               // el centro del recuadro no se mueve cuando la foto crece con el hover
               transformOrigin: `${((50 - r[2]) / r[0]) * 100}% ${((50 - r[3]) / r[1]) * 100}%` }
            : null;
};
const MARCO_DEFECTO = 4 / 5;
const marcoDe = (slug, caseId, ...files) =>
  files.map((f) => ENCUADRES.marcos[clave(slug, caseId, f)]).find(Boolean) ?? MARCO_DEFECTO;
const aparteDe = (slug, caseId, file) => ENCUADRES.aparte[clave(slug, caseId, file)] ?? MARCO_DEFECTO;

const imageByFile = (globObj, folder) => (file) => globObj[`./assets/${folder}/${file}`];
const certImage = imageByFile(CERT_IMAGES, "certificados");
const paperImage = imageByFile(PAPER_IMAGES, "pappers");

/* Photos live in ./assets/procedimientos/<slug>/<case>/, one folder per case. Inside a case
   folder every file carries an "antes"/"before" or "despues"/"dsp"/"after" token; a case can
   hold several shots of the same patient (antes-1 + despues-1, antes-2 + despues-2 …), which
   the UI shows as switchable angles. Both sides are sorted by name so the angles line up. */
const AFTER_TOKEN = /(despu[eé]s|dsp|after)/;
const BEFORE_TOKEN = /(antes|before)/;
const APART_TOKEN = /aparte/;

/* Only the first cases per procedure are published. */
const MAX_CASES = 40;

/* Punto de interes de cada procedimiento dentro del marco: la foto no se recorta en
   disco, solo se encuadra con object-position para que todas miren lo mismo. */
const FOCO = {
  rhinoplasty: "50% 38%", profiloplasty: "50% 42%",
  "upper-lip-lift": "50% 55%", "eyes-expression": "50% 32%", blepharoplasty: "50% 32%",
  "forehead-orbital": "50% 22%", cheeks: "50% 38%", "chin-jaw": "50% 58%",
  "adams-remodeling": "50% 60%", "hair-implants": "50% 18%",
  breast: "50% 50%", "body-remodeling": "50% 50%",
};
const FOCO_DEFECTO = "50% 35%";   // rostro completo con cuello

/* The UI draws the MDM logo over every case photo, except the few that still carry a full,
   readable logo of their own — reframing the photos to 4:5 cropped it out of most of them.
   Add a "<slug>/<case>" key here only when a case already shows the complete logo. */
const CASES_WITH_OWN_LOGO = new Set([
  "breast/caso-01",
  "feminization/caso-01",
  "forehead-orbital/caso-01",
]);

const CASES_BY_SLUG = (() => {
  const acc = {};
  for (const [path, image] of Object.entries(CASE_IMAGES)) {
    const match = path.match(/\/procedimientos\/([^/]+)\/([^/]+)\/([^/]+)$/);
    if (!match) continue;
    const [, slug, caseId, file] = match;
    const base = file.replace(/\.\w+$/, "").toLowerCase();
    /* "fotoaparte" es una foto suelta del caso: se muestra sola, sin par. */
    const side = APART_TOKEN.test(base) ? "apart"
               : AFTER_TOKEN.test(base) ? "after"
               : BEFORE_TOKEN.test(base) ? "before" : null;
    if (!side) continue;
    acc[slug] ??= {};
    acc[slug][caseId] ??= { before: [], after: [], apart: [] };
    acc[slug][caseId][side].push({ base, image, file });
  }

  const byBase = (a, b) => a.base.localeCompare(b.base, undefined, { numeric: true });
  return Object.fromEntries(
    Object.entries(acc).map(([slug, cases]) => {
      const list = Object.keys(cases)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        .map((caseId) => {
          const before = cases[caseId].before.sort(byBase);
          const after = cases[caseId].after.sort(byBase);
          // Each angle is one before/after shot of the same patient.
          const angles = Array.from({ length: Math.min(before.length, after.length) }, (_, k) => {
            const beforeFit = encuadreDe(slug, caseId, before[k].file);
            const afterFit = encuadreDe(slug, caseId, after[k].file);
            // Si falta la medida de un lado, los dos vuelven al encuadre por defecto:
            // ampliar solo una mitad del par la dejaria descalzada con la otra.
            const par = beforeFit && afterFit;
            return { before: before[k].image, after: after[k].image,
                     beforeFit: par ? beforeFit : null, afterFit: par ? afterFit : null,
                     frame: marcoDe(slug, caseId, before[k].file, after[k].file) };
          });
          const apart = (cases[caseId].apart ?? []).sort(byBase)
            .map((x) => ({ image: x.image, frame: aparteDe(slug, caseId, x.file) }));
          return { caseId, angles, apart, focus: FOCO[slug] ?? FOCO_DEFECTO,
                   watermark: !CASES_WITH_OWN_LOGO.has(`${slug}/${caseId}`) };
        })
        /* Un caso se publica si tiene un par antes/despues o, al menos, fotos sueltas. */
        .filter((c) => c.angles.length > 0 || c.apart.length > 0)
        .slice(0, MAX_CASES)
        .map((c, i) => ({ ...c, n: String(i + 1).padStart(2, "0") }));
      return [slug, list];
    }),
  );
})();

const PROCEDURE_LIST = [
  { slug: "facial-harmonization", icon: Aperture,
    es: { name: "Armonización Facial", desc: "Evaluación y remodelación del rostro como conjunto, combinando varios gestos quirúrgicos en un mismo plan para equilibrar las proporciones.", duration: "Variable según el plan", recovery: "2 a 3 semanas" },
    en: { name: "Facial Harmonization", desc: "Assessment and remodeling of the face as a whole, combining several surgical steps in a single plan to balance proportions.", duration: "Varies with the plan", recovery: "2 to 3 weeks" } },
  { slug: "forehead-orbital", icon: Scan,
    es: { name: "Frente y Órbitas", desc: "Remodelación del hueso frontal y del reborde orbitario para modificar la proyección y la forma de la frente.", duration: "2 a 3 horas", recovery: "2 a 3 semanas" },
    en: { name: "Forehead & Orbital", desc: "Remodeling of the frontal bone and orbital rim to change the projection and shape of the forehead.", duration: "2 to 3 hours", recovery: "2 to 3 weeks" } },
  { slug: "chin-jaw", icon: Triangle,
    es: { name: "Remodelación de Mentón y Mandíbula", desc: "Modificación del contorno óseo del mentón y del ángulo mandibular para redefinir el tercio inferior del rostro.", duration: "2 a 4 horas", recovery: "2 a 3 semanas" },
    en: { name: "Chin & Jaw Remodeling", desc: "Reshaping of the bone contour of the chin and jaw angle to redefine the lower third of the face.", duration: "2 to 4 hours", recovery: "2 to 3 weeks" } },
  { slug: "eyes-expression", icon: Eye,
    es: { name: "Expresión de la Mirada", desc: "Conjunto de gestos sobre párpados, cejas y región periorbitaria orientados a modificar la expresión de la mirada.", duration: "1 a 3 horas", recovery: "7 a 14 días" },
    en: { name: "Eyes Expression", desc: "A set of procedures on the eyelids, brows and periorbital area aimed at changing the expression of the gaze.", duration: "1 to 3 hours", recovery: "7 to 14 days" } },
  { slug: "feminization", icon: Flower2,
    es: { name: "Feminización", desc: "Conjunto de gestos quirúrgicos sobre la estructura ósea y los tejidos blandos orientados a suavizar los rasgos del rostro.", duration: "Variable según el plan", recovery: "3 a 4 semanas" },
    en: { name: "Feminization", desc: "A set of surgical steps on the bone structure and soft tissues aimed at softening the features of the face.", duration: "Varies with the plan", recovery: "3 to 4 weeks" } },
  { slug: "rejuvenation", icon: Sparkles,
    es: { name: "Rejuvenecimiento Facial", desc: "Tratamiento de los signos de la edad en el rostro y el cuello, combinando reposición de tejidos y trabajo sobre la calidad de la piel.", duration: "Variable según el plan", recovery: "2 a 3 semanas" },
    en: { name: "Facial Rejuvenation", desc: "Treatment of the signs of ageing in the face and neck, combining tissue repositioning and work on skin quality.", duration: "Varies with the plan", recovery: "2 to 3 weeks" } },
  { slug: "masculinization", icon: Hexagon,
    es: { name: "Masculinización y Antiaging", desc: "Plan combinado que marca los rasgos y trata los signos de la edad en un mismo tiempo quirúrgico.", duration: "Variable según el plan", recovery: "3 a 4 semanas" },
    en: { name: "Masculinization & Antiaging", desc: "A combined plan that strengthens the features and addresses signs of ageing in a single surgical session.", duration: "Varies with the plan", recovery: "3 to 4 weeks" } },
  { slug: "face-neck-lift", icon: MoveUp,
    es: { name: "Lifting Facial y Cervical", desc: "Reposición de los tejidos del rostro y del cuello, con tratamiento del plano muscular y de la piel para redefinir el óvalo facial.", duration: "3 a 5 horas", recovery: "2 a 3 semanas" },
    en: { name: "Face & Neck Lift", desc: "Repositioning of facial and neck tissues, treating the muscular plane and the skin to redefine the facial oval.", duration: "3 to 5 hours", recovery: "2 to 3 weeks" } },
  { slug: "rhinoplasty", icon: Wind,
    es: { name: "Rinoplastia", desc: "Modificación de la estructura ósea y cartilaginosa de la nariz para cambiar su forma, su proyección y su relación con el resto del rostro.", duration: "2 a 3 horas", recovery: "7 a 10 días con férula" },
    en: { name: "Rhinoplasty", desc: "Reshaping of the bone and cartilage structure of the nose to change its shape, projection and relationship with the rest of the face.", duration: "2 to 3 hours", recovery: "7 to 10 days with a splint" } },
  { slug: "blepharoplasty", icon: Focus,
    es: { name: "Blefaroplastia", desc: "Corrección del exceso de piel y de las bolsas de los párpados superiores e inferiores.", duration: "1 a 2 horas", recovery: "7 a 10 días" },
    en: { name: "Blepharoplasty", desc: "Correction of excess skin and fat pads of the upper and lower eyelids.", duration: "1 to 2 hours", recovery: "7 to 10 days" } },
  { slug: "cheeks", icon: Circle,
    es: { name: "Pómulos", desc: "Aumento o redefinición de la proyección malar mediante implantes o relleno estructural.", duration: "1 a 2 horas", recovery: "7 a 14 días" },
    en: { name: "Cheeks", desc: "Augmentation or redefinition of malar projection using implants or structural filling.", duration: "1 to 2 hours", recovery: "7 to 14 days" } },
  { slug: "upper-lip-lift", icon: Smile,
    es: { name: "Lifting de Labio Superior", desc: "Acortamiento de la distancia entre la nariz y el labio para exponer más el bermellón y rejuvenecer el tercio medio.", duration: "Alrededor de 1 hora", recovery: "7 a 10 días" },
    en: { name: "Upper Lip Lift", desc: "Shortening of the distance between nose and lip to expose more vermilion and rejuvenate the middle third.", duration: "About 1 hour", recovery: "7 to 10 days" } },
  { slug: "adams-remodeling", icon: Activity,
    es: { name: "Remodelación de Nuez de Adán", desc: "Reducción del cartílago tiroides para suavizar el relieve del cuello.", duration: "1 a 2 horas", recovery: "7 a 10 días" },
    en: { name: "Adam's Remodeling", desc: "Reduction of the thyroid cartilage to soften the contour of the neck.", duration: "1 to 2 hours", recovery: "7 to 10 days" } },
  { slug: "hair-implants", icon: Feather,
    es: { name: "Implante Capilar", desc: "Redistribución de folículos propios para recomponer la línea de implantación y la densidad del cabello.", duration: "4 a 8 horas", recovery: "5 a 7 días" },
    en: { name: "Hair Implants", desc: "Redistribution of the patient's own follicles to rebuild the hairline and hair density.", duration: "4 to 8 hours", recovery: "5 to 7 days" } },
  { slug: "profiloplasty", icon: Aperture,
    es: { name: "Perfiloplastia", desc: "Trabajo conjunto sobre nariz, mentón y labios para redefinir la línea del perfil como una sola unidad.", duration: "3 a 4 horas", recovery: "2 a 3 semanas" },
    en: { name: "Profiloplasty", desc: "Combined work on nose, chin and lips to redefine the profile line as a single unit.", duration: "3 to 4 hours", recovery: "2 to 3 weeks" } },
  { slug: "tensor-threads", icon: Feather,
    es: { name: "Hilos Tensores", desc: "Reposición de los tejidos del rostro mediante hilos, sin cirugía abierta, para redefinir el contorno.", duration: "Alrededor de 1 hora", recovery: "3 a 7 días" },
    en: { name: "Tensor Threads", desc: "Repositioning of the facial tissues with threads, without open surgery, to redefine the contour.", duration: "About 1 hour", recovery: "3 to 7 days" } },
  { slug: "breast", icon: Gem,
    es: { name: "Mamas", desc: "Aumento, reducción o elevación mamaria, con implantes o tejido propio, según la proporción buscada para el conjunto del cuerpo.", duration: "2 a 3 horas", recovery: "2 a 4 semanas" },
    en: { name: "Breast", desc: "Breast augmentation, reduction or lift, with implants or the patient's own tissue, according to the proportion sought for the whole body.", duration: "2 to 3 hours", recovery: "2 to 4 weeks" } },
  { slug: "body-remodeling", icon: PersonStanding,
    es: { name: "Remodelación Corporal", desc: "Modelado del contorno corporal mediante lipoaspiración, tratamiento de la pared abdominal y remodelación de zonas específicas.", duration: "2 a 5 horas", recovery: "3 a 4 semanas" },
    en: { name: "Body Remodeling", desc: "Body contour shaping through liposuction, abdominal wall treatment and remodeling of specific areas.", duration: "2 to 5 hours", recovery: "3 to 4 weeks" } },
];

export const PROCEDURES = PROCEDURE_LIST.map((p) => ({ ...p, art: artFor(p.slug) }));

/* Zonas del cuerpo con las que se agrupa el listado de procedimientos. */
const GROUP_LIST = [
  { id: "facial", es: "Facial y Estructura Ósea", en: "Facial & Bone Structure",
    slugs: ["facial-harmonization", "forehead-orbital", "chin-jaw", "cheeks", "profiloplasty", "tensor-threads"] },
  { id: "detail", es: "Ojos, Nariz y Detalle", en: "Eyes, Nose & Detail",
    slugs: ["eyes-expression", "rhinoplasty", "blepharoplasty", "upper-lip-lift"] },
  { id: "lifting", es: "Rejuvenecimiento y Lifting", en: "Rejuvenation & Lifting",
    slugs: ["rejuvenation", "face-neck-lift"] },
  { id: "gender", es: "Género e Identidad", en: "Gender & Identity",
    slugs: ["feminization", "masculinization", "adams-remodeling"] },
  { id: "body", es: "Corporal y Capilar", en: "Body & Hair",
    slugs: ["breast", "body-remodeling", "hair-implants"] },
];

const bySlug = Object.fromEntries(PROCEDURES.map((p) => [p.slug, p]));
export const PROCEDURE_GROUPS = GROUP_LIST.map((g) => ({
  ...g,
  items: g.slugs.map((s) => bySlug[s]).filter(Boolean),
}));

export const AREAS = [
  { es: { t: "Feminización Facial", d: "Estética facial completa orientada a la feminización." },
    en: { t: "Facial Feminization", d: "Full-face aesthetics oriented toward feminization." } },
  { es: { t: "Masculinización Facial", d: "Estética facial completa orientada a la masculinización." },
    en: { t: "Facial Masculinization", d: "Full-face aesthetics oriented toward masculinization." } },
  { es: { t: "Armonización de Rasgos", d: "Remodelación de las estructuras faciales como conjunto." },
    en: { t: "Facial Features Harmonization", d: "Remodeling of the facial structures as a whole." } },
  { es: { t: "Cirugía Corporal", d: "Modelado y remodelación estética del cuerpo." },
    en: { t: "Body Surgery", d: "Aesthetic body shaping and remodeling." } },
];

export const INCLUDED = [
  { icon: Receipt, es: "Todos los gastos médicos y administrativos", en: "All medical and administrative expenses" },
  { icon: Hotel, es: "Una noche de internación con intérpretes", en: "A night in the hospital with interpreters" },
  { icon: Plane, es: "Traslado desde y hacia el aeropuerto con asistente", en: "Pick up from and to the airport with assistant" },
  { icon: Headphones, es: "Contacto y soporte 24/7", en: "Contact and support 24/7" },
];

export const LEAD = {
  name: "Dr. Marcelo Di Maggio",
  es: {
    role: "Cirugía Plástica, Estética, Reconstructiva y Craneofacial",
    bio: "El Dr. Marcelo Di Maggio es uno de los cirujanos plásticos más reconocidos del mundo. Su trayectoria y prestigio en Cirugía Plástica y Estética Facial y Corporal está ampliamente documentada. Pionero en técnicas quirúrgicas de Armonización y Remodelación Facial y Corporal.",
    years: "25+ años de experiencia",
    creds: [
      "Especialista en Cirugía Plástica Estética y Reconstructiva",
      "Especialista en Cirugía Craneomaxilofacial",
      "Especialista en Cirugía de Cabeza y Cuello",
      "Especialista en Cirugía General",
      "Matrícula Nacional Argentina · M.N. 78898",
      "Matrícula y Board del Estado de Nueva York",
      "Matrícula y Board de España",
      "Matrícula y Board de Asistente Quirúrgico · SA-C",
    ],
  },
  en: {
    role: "Plastic, Aesthetic, Reconstructive & Craniofacial Surgery",
    bio: "Dr. Marcelo Di Maggio is one of the most recognized Plastic Surgeons in the world. His career and prestige in Plastic Surgery, Facial and Body Aesthetics is widely documented. Pioneer in surgical techniques of Facial and Body Harmonization and Remodeling.",
    years: "25+ years of experience",
    creds: [
      "Specialist in Aesthetic and Reconstructive Plastic Surgery",
      "Specialist in Craniomaxillofacial Surgery",
      "Specialist in Head and Neck Surgery",
      "Specialist in General Surgery",
      "Argentina Medical License · M.N. 78898",
      "New York State Board and Medical License",
      "Spain Board and Medical License",
      "Surgical Assistant Board and License · SA-C",
    ],
  },
};

export const SPECIALISTS = [
  { name: "Dra. Soledad Marziglia", es: "Anestesia", en: "Anesthesia" },
  { name: "Dra. Natalia Sio", es: "Anestesia", en: "Anesthesia" },
  { name: "Dr. Juan Cruz Dobarro", es: "Cirugía Plástica, Estética y Reconstructiva", en: "Plastic, Aesthetic & Reconstructive Surgery" },
  { name: "Dr. Roberto Martinez", es: "Cirugía Plástica, Estética y Reconstructiva", en: "Plastic, Aesthetic & Reconstructive Surgery" },
  { name: "Dr. Alejandro Beltrami y equipo", es: "Cirugía Plástica, Estética y Reconstructiva", en: "Plastic, Aesthetic & Reconstructive Surgery" },
  { name: "Dr. Laura Adduci", es: "Neurocirugía", en: "Neurosurgery" },
  { name: "Dr. Agustín Mendilharzu", es: "Otorrinolaringología", en: "ENT" },
  { name: "Dr. Daniel Roscher", es: "Cirugía Ortognática", en: "Orthognathic Surgery" },
  { name: "Dr. Javier Belinky", es: "Cirugía de reasignación sexual · Buenos Aires", en: "Sex reassignment surgery · Buenos Aires" },
  { name: "Dr. Maximiliano Scime", es: "Odontología · Implantes", en: "Dentistry · Implants" },
];

export const ASSISTANTS = [
  { name: "Leticia Martinez", es: "Manager y Asistente MDM", en: "Manager & MDM Assistant" },
  { name: "Charis Delacroix", es: "Asistente Quirúrgico MDM", en: "MDM Surgical Assistant" },
  { name: "Mónica Prata", es: "Especialista en Expresión de Género", en: "Gender Expression Specialist" },
];

export const LOCATIONS = [
  { city: "Buenos Aires",
    es: "El consultorio del Dr. Di Maggio está en la zona de Belgrano. Las cirugías se realizan en clínicas y hospitales de máxima complejidad médica: Trinidad Medical Center de Palermo y San Isidro, Clínica Bazterrica y Sanatorio Güemes.",
    en: "Dr. Di Maggio's office is located in the Belgrano area. Surgeries are performed in clinics and hospitals of the highest medical complexity: Trinidad Medical Center in Palermo & San Isidro, Clínica Bazterrica and Sanatorio Güemes." },
  { city: "Córdoba",
    es: "El Dr. Marcelo Di Maggio trabaja junto al Dr. Roberto Martínez Rinaldi y todo el equipo profesional de MDM Surgery, enfocados en la armonización facial y corporal.",
    en: "Dr. Marcelo Di Maggio works together with Dr. Roberto Martínez Rinaldi and all the professional members of MDM Surgery, focused on facial and body harmonization." },
  { city: "Madrid · New York",
    es: "El Dr. Di Maggio tiene matrícula médica en Nueva York y España, y realiza consultas y cirugías en Madrid y Nueva York. También atiende con frecuencia en San Diego, Los Ángeles y Chicago.",
    en: "Dr. Di Maggio holds medical licenses in New York and Spain, and consults and operates in Madrid and New York. He also consults frequently in San Diego, Los Angeles and Chicago." },
];

export const SEDES = [
  "Buenos Aires, Argentina",
  "Córdoba, Argentina",
  "Madrid, España",
  "New York, USA",
];

/* Each entry is transcribed from the certificate it links to. `institution` is what the
   list shows; the image is only opened on demand through the lightbox. */
const CERTIFICATE_LIST = [
  { file: "Licencia new york.jpeg", year: "2018",
    institution: "The University of the State of New York · Education Department",
    es: { title: "Licencia para ejercer Medicina y Cirugía en el Estado de Nueva York", meta: "Licencia N.º 296483" },
    en: { title: "License to practice Medicine and Surgery in the State of New York", meta: "License No. 296483" } },
  { file: "Licencia espana.jpeg", year: "2021",
    institution: "Ministerio de Universidades · Reino de España",
    es: { title: "Homologación del título de Médico en España", meta: "Credencial /2021/H02075 · Madrid" },
    en: { title: "Recognition of the medical degree in Spain", meta: "Credential /2021/H02075 · Madrid" } },
  { file: "10.jpeg", year: "2025",
    institution: "American Society of Plastic Surgeons",
    es: { title: "Miembro · 10 años de membresía", meta: "Reconocimiento por trayectoria y estándares profesionales" },
    en: { title: "Member · 10 years of membership", meta: "Recognition for career and professional standards" } },
  { file: "5.jpeg", year: "2018",
    institution: "New York State Board of Regents · Committee on the Professions",
    es: { title: "Homologación de la matrícula médica argentina en Nueva York", meta: "Licencia por endorsement" },
    en: { title: "Endorsement of the Argentine medical license in New York", meta: "Licensure by endorsement" } },
  { file: "6.jpeg", year: "2016",
    institution: "Mount Sinai Beth Israel · New York",
    es: { title: "Medical Staff · Assistant Attending, Departamento de Cirugía", meta: "Privilegios en Cirugía Plástica y Reconstructiva" },
    en: { title: "Medical Staff · Assistant Attending, Department of Surgery", meta: "Plastic and Reconstructive Surgery privileges" } },
  { file: "1.jpg", year: "2017",
    institution: "Universidad de Buenos Aires · Facultad de Medicina",
    es: { title: "Recertificación del título de Especialista en Cirugía Plástica Reparadora", meta: "Res. C.D. N.º 1406/02 · Res. C.S. N.º 4171/04" },
    en: { title: "Recertification as Specialist in Reconstructive Plastic Surgery", meta: "Res. C.D. No. 1406/02 · Res. C.S. No. 4171/04" } },
  { file: "11.jpeg", year: "2005",
    institution: "Sociedad Argentina de Cirugía Plástica, Estética y Reparadora · SACPER",
    es: { title: "Miembro Titular", meta: "Asociación Médica Argentina · Buenos Aires" },
    en: { title: "Full Member", meta: "Argentine Medical Association · Buenos Aires" } },
  { file: "12.jpeg", year: "1996",
    institution: "Sociedad de Cirugía Plástica de Buenos Aires · AMA",
    es: { title: "Miembro Titular", meta: "Asociación Médica Argentina · Buenos Aires" },
    en: { title: "Full Member", meta: "Argentine Medical Association · Buenos Aires" } },
  { file: "2.jpeg", year: "2021",
    institution: "The American Board of Surgical Assistants",
    es: { title: "Surgical Assistant · Certified (SA-C)", meta: "Certificación N.º 21-776" },
    en: { title: "Surgical Assistant · Certified (SA-C)", meta: "Certification No. 21-776" } },
];

export const CERTIFICATES = CERTIFICATE_LIST.map((c, i) => ({
  slug: `certificate-${i + 1}`,
  image: certImage(c.file),
  institution: c.institution,
  year: c.year,
  es: c.es,
  en: c.en,
}));

/* Publications and the editorial-board appointment, transcribed from the scans in
   ./assets/pappers. Several scans document the same article; each one appears once here. */
const PAPER_LIST = [
  { file: "1.jpeg", publisher: "Facial Plastic Surgery Clinics of North America · Elsevier",
    title: "Forehead and Orbital Rim Remodeling",
    authors: "Marcelo Di Maggio, MD",
    ref: "Vol. 27, N.º 2 · 2019 · pp. 207–220",
    doi: "10.1016/j.fsc.2019.01.007" },
  { file: "9.jpeg", publisher: "The Journal of Craniofacial Surgery · Wolters Kluwer",
    title: "Surgical Management of the Nose in Relation With the Fronto-Orbital Area to Change and Feminize the Eyes’ Expression",
    authors: "M. R. Di Maggio, J. Nazar Anchorena, J. C. Dobarro",
    ref: "2019 · Original Article",
    doi: "10.1097/SCS.0000000000005411" },
  { file: "3.jpeg", publisher: "The Journal of Craniofacial Surgery · Wolters Kluwer",
    title: "Surgical Management of the Superior Lip as a Complement in Facial Features Remodeling Surgery",
    authors: "M. Di Maggio, J. C. Dobarro, J. Nazar Anchorena",
    ref: "2019 · Technical Strategy",
    doi: "10.1097/SCS.0000000000005382" },
  { file: "4.jpeg", publisher: "Aesthetic Surgery Journal · Oxford University Press",
    title: "Facial Feminization Surgery Changes Perception of Patient Gender",
    authors: "M. Fisher, S. M. Lu, K. Chen, B. Zhang, M. Di Maggio, J. P. Bradley",
    ref: "Vol. 40, N.º 7 · Julio 2020 · pp. 703–709 · Editor’s Choice",
    refEn: "Vol. 40, No. 7 · July 2020 · pp. 703–709 · Editor’s Choice",
    doi: "10.1093/asj/sjz303" },
  { file: "8.jpeg", publisher: "Plastic and Reconstructive Surgery · ASPS",
    title: "Facial Recognition Neural Networks Confirm Success of Facial Feminization Surgery",
    authors: "K. Chen, S. M. Lu, R. Cheng, M. Fisher, B. H. Zhang, M. Di Maggio, J. P. Bradley",
    ref: "Vol. 145 · 2020 · p. 203",
    doi: null },
  { file: "10.jpeg", publisher: "Plastic and Reconstructive Surgery · Global Open",
    title: "Evaluating the Success of Facial Feminization Surgery Through Artificial and Human Intelligence",
    authors: "S. M. Lu, K. Chen, M. Fisher, R. Cheng, B. H. Zhang, M. Di Maggio, J. P. Bradley",
    ref: "Vol. 7, N.º 8S-1 · Agosto 2019 · pp. 47–48",
    refEn: "Vol. 7, No. 8S-1 · August 2019 · pp. 47–48",
    doi: "10.1097/01.GOX.0000584468.14112.e3" },
  { file: "5.jpeg", publisher: "Atlas of Operative Techniques in Gender Confirmation Surgery · Elsevier",
    title: "Facial features remodeling and affirming surgery (FFRS)",
    authors: "M. Di Maggio, E. Elena Scarafoni",
    ref: "Capítulo 12 · 2023 · pp. 183–210",
    refEn: "Chapter 12 · 2023 · pp. 183–210",
    doi: "10.1016/B978-0-323-98377-8.00014-2" },
  { file: "11.jpeg", publisher: "Plastic and Reconstructive Surgery · ASPS",
    kind: "board",
    title: "Partner Society Associate Editor · Editorial Board",
    authors: "Marcelo Di Maggio, MD",
    ref: "Tercer mandato · 2023–2026",
    refEn: "Third term · 2023–2026",
    doi: null },
];

export const PAPERS = PAPER_LIST.map((p, i) => ({
  slug: `paper-${i + 1}`,
  cover: paperImage(p.file),
  kind: p.kind ?? "article",
  publisher: p.publisher,
  title: p.title,
  authors: p.authors,
  doi: p.doi,
  url: p.doi ? `https://doi.org/${p.doi}` : null,
  es: { ref: p.ref },
  en: { ref: p.refEn ?? p.ref },
}));

export const TESTIMONIALS = [
  { initials: "M.G.", place: "Buenos Aires", stars: 5,
    es: "Mi experiencia fue maravillosa. El acompañamiento antes y después de la cirugía fue constante.",
    en: "My experience was wonderful. The support before and after surgery was constant." },
  { initials: "L.P.", place: "Madrid", stars: 5,
    es: "Vas a encontrar una respuesta profesional y los resultados se ven naturales.",
    en: "You are going to find a professional answer and the results look natural." },
  { initials: "A.R.", place: "New York", stars: 5,
    es: "¡Son el mejor equipo! Me sentí cuidada en cada paso del proceso.",
    en: "You guys are the best team ever! I felt looked after at every step." },
  { initials: "C.M.", place: "Córdoba", stars: 4,
    es: "Se tomaron el tiempo de explicarme todo. El resultado superó lo que esperaba.",
    en: "They took the time to explain everything. The result exceeded what I expected." },
];

/* Only the cases that actually have a before/after pair on disk. */
export const casesFor = (slug) => CASES_BY_SLUG[slug] ?? [];

export const PROCEDURES_WITH_CASES = PROCEDURES.filter((p) => casesFor(p.slug).length > 0);
