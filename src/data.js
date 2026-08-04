import {
  Aperture, Scan, Triangle, Eye, Flower2, Hexagon, MoveUp, Wind,
  Focus, Circle, Smile, Activity, Feather, PersonStanding,
  Receipt, Hotel, Plane, Headphones,
} from "lucide-react";

const ART = import.meta.glob("./assets/proc/*.png", { eager: true, import: "default" });
const artFor = (slug) => ART[`./assets/proc/${slug}.png`];

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
    es: { name: "Feminización y Rejuvenecimiento", desc: "Plan combinado que suaviza los rasgos y trata los signos de la edad en un mismo tiempo quirúrgico.", duration: "Variable según el plan", recovery: "3 a 4 semanas" },
    en: { name: "Feminization & Rejuvenation", desc: "A combined plan that softens the features and addresses signs of ageing in a single surgical session.", duration: "Varies with the plan", recovery: "3 to 4 weeks" } },
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
  { slug: "body-remodeling", icon: PersonStanding,
    es: { name: "Remodelación Corporal", desc: "Modelado del contorno corporal mediante lipoaspiración, tratamiento de la pared abdominal y remodelación de zonas específicas.", duration: "2 a 5 horas", recovery: "3 a 4 semanas" },
    en: { name: "Body Remodeling", desc: "Body contour shaping through liposuction, abdominal wall treatment and remodeling of specific areas.", duration: "2 to 5 hours", recovery: "3 to 4 weeks" } },
];

export const PROCEDURES = PROCEDURE_LIST.map((p) => ({ ...p, art: artFor(p.slug) }));

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
  { name: "Dr. Roberto Martínez Rinaldi", es: "Equipo MDM Córdoba", en: "MDM Córdoba Team" },
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

const INITIALS = ["M.G.", "L.P.", "A.R.", "S.T.", "C.M.", "J.L.", "V.B.", "N.F.",
                  "D.S.", "R.C.", "P.A.", "E.M.", "F.D.", "K.V.", "T.O.", "B.H.",
                  "G.N.", "H.Q.", "I.W.", "O.Z.", "U.Y.", "X.K."];

export const casesFor = (index, count = 3) =>
  Array.from({ length: count }, (_, k) => ({
    n: String(k + 1).padStart(2, "0"),
    initials: INITIALS[(index * 3 + k) % INITIALS.length],
  }));
