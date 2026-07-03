import { Setting, Service, Category, Project } from "./types";

export const DEFAULT_SETTINGS: Setting = {
  companyName: "ATELIER CHEZ GERMAIN",
  logoUrl: "/src/assets/images/electronic_welding_logo_1783103948022.jpg",
  phone: "+261 34 57 652 27",
  whatsapp: "+261345765227",
  address: "Mampikony, à côté de l'hôtel Nansica, Madagascar",
  facebookUrl: "https://www.facebook.com/germain.raherimanana.2025?locale=fr_FR",
  instagramUrl: "https://instagram.com/AtelierChezGermain",
  tiktokUrl: "https://tiktok.com/@AtelierChezGermain",
  youtubeUrl: "https://youtube.com/@AtelierChezGermain",
  heroImage: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=1600",
  description: "Spécialiste de la ferronnerie d'art et des ouvrages métalliques à Mampikony. Conception et fabrication sur mesure de portails, charpentes, hangars, escaliers, portes et fenêtres avec une précision artisanale et une robustesse industrielle.",
  hours: "Lundi - Samedi : 07:30 - 17:30 | Dimanche : Fermé",
  primaryColor: "#1565C0"
};

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-1", name: "Portails & Clôtures", slug: "portails-clotures" },
  { id: "cat-2", name: "Charpentes & Hangars", slug: "charpentes-hangars" },
  { id: "cat-3", name: "Escaliers & Garde-corps", slug: "escaliers-garde-corps" },
  { id: "cat-4", name: "Portes & Fenêtres", slug: "portes-fenetres" },
  { id: "cat-5", name: "Sur Mesure", slug: "sur-mesure" }
];

export const DEFAULT_SERVICES: Service[] = [
  {
    id: "srv-1",
    title: "Portails Métalliques",
    description: "Portails battants ou coulissants, motorisés ou manuels, alliant esthétique moderne, sécurité renforcée et robustesse exceptionnelle face aux intempéries.",
    icon: "Fence",
    imageUrl: "https://images.unsplash.com/photo-1549576490-b0b4831da60a?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "srv-2",
    title: "Charpentes Métalliques",
    description: "Calcul, fabrication et montage de charpentes robustes pour habitations, commerces ou bâtiments publics, assurant une longévité inégalée.",
    icon: "Building",
    imageUrl: "https://images.unsplash.com/photo-1513828742140-ccaa34f3bfc1?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "srv-3",
    title: "Hangars & Entrepôts",
    description: "Structures de grande envergure pour le stockage, l'industrie ou l'agriculture. Clé en main de la conception métallique à la couverture.",
    icon: "Warehouse",
    imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "srv-4",
    title: "Escaliers Métalliques",
    description: "Escaliers intérieurs et extérieurs, droits, tournants ou hélicoïdaux. Design épuré, marches en métal ou adaptées pour le bois/béton.",
    icon: "GitCommit", // Will render a nice staircase-like or stairs icon in the UI
    imageUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "srv-5",
    title: "Fenêtres Métalliques",
    description: "Châssis fixes, ouvrants ou coulissants. Excellente étanchéité, sécurité anti-intrusion renforcée et finitions impeccables.",
    icon: "Square",
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "srv-6",
    title: "Portes Métalliques",
    description: "Portes blindées d'entrée, portes de service, grilles de sécurité articulées pour commerces et résidences.",
    icon: "DoorClosed",
    imageUrl: "https://images.unsplash.com/photo-1485081669829-bacb8c7bb1f3?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "srv-7",
    title: "Clôtures de Sécurité",
    description: "Barreaudage de protection, clôtures industrielles et grilles défensives élégantes pour sécuriser vos propriétés.",
    icon: "ShieldAlert",
    imageUrl: "https://images.unsplash.com/photo-1507300971109-1a40954b4074?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "srv-8",
    title: "Grilles & Protections",
    description: "Grilles de protection pour fenêtres et vitrines. Designs classiques ou contemporains sur mesure selon vos contraintes.",
    icon: "Grid",
    imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "srv-9",
    title: "Fabrication Sur Mesure",
    description: "Donnez vie à vos projets les plus audacieux : mobiliers en métal, pièces décoratives, supports industriels spécifiques.",
    icon: "Settings",
    imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "srv-10",
    title: "Soudure Haute Précision",
    description: "Travaux de soudure professionnels (TIG, MIG, Arc) sur acier et métaux divers. Réparations d'urgence et renforcements structurels.",
    icon: "Flame",
    imageUrl: "https://images.unsplash.com/photo-1535813547-99c456a41d4a?auto=format&fit=crop&q=80&w=800"
  }
];

export const DEFAULT_PROJECTS: Project[] = [
  {
    id: "proj-1",
    title: "Grand Portail Moderne Coulissant",
    description: "Conception et fabrication d'un portail de 5 mètres coulissant à barreaudage asymétrique moderne, thermolaqué en noir mat, avec système de guidage robuste et portillon d'accès intégré.",
    category: "portails-clotures",
    date: "2026-05-12",
    photos: [
      "https://images.unsplash.com/photo-1549576490-b0b4831da60a?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1507300971109-1a40954b4074?auto=format&fit=crop&q=80&w=800"
    ],
    videos: [],
    location: "Mampikony",
    client: "Résidence Privée",
    status: "completed"
  },
  {
    id: "proj-2",
    title: "Charpente Métallique pour Hangar Agricole",
    description: "Réalisation d'une structure en acier pour un hangar agricole de 300m². Poutres IPE soudées et traitées contre la corrosion, pannes de toiture C-purlin renforcées pour supporter une toiture en tôle ondulée.",
    category: "charpentes-hangars",
    date: "2026-06-02",
    photos: [
      "https://images.unsplash.com/photo-1513828742140-ccaa34f3bfc1?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800"
    ],
    videos: [
      "https://assets.mixkit.co/videos/preview/mixkit-welder-working-on-a-steel-beam-42045-large.mp4"
    ],
    location: "Mampikony",
    client: "Coopérative Fandrosoana",
    status: "completed"
  },
  {
    id: "proj-3",
    title: "Escalier Double Quart-Tournant Design",
    description: "Escalier intérieur haut de gamme pour une villa. Structure centrale en limon découpé au laser, supports de marches invisibles en acier plein, prêt pour installation de marches en bois précieux.",
    category: "escaliers-garde-corps",
    date: "2026-06-25",
    photos: [
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800"
    ],
    videos: [],
    location: "Mampikony Ville",
    client: "Mr. Jean",
    status: "completed"
  },
  {
    id: "proj-4",
    title: "Châssis Vitrés d'Atelier",
    description: "Série de baies vitrées de style atelier d'artiste en acier thermolaqué noir, verres feuilletés de sécurité. Apporte une luminosité maximale tout en structurant l'espace.",
    category: "portes-fenetres",
    date: "2026-07-01",
    photos: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800"
    ],
    videos: [],
    location: "Mampikony",
    client: "Hôtel Nansica",
    status: "in_progress"
  }
];
