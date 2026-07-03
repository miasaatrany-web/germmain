import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Fence, 
  Building, 
  Warehouse, 
  Flame, 
  Square, 
  DoorClosed, 
  ShieldAlert, 
  Grid, 
  Settings, 
  Wrench, 
  Search, 
  Share2, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  Lock, 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  CheckCircle2, 
  Clock3,
  ExternalLink
} from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { addMessage } from "../services/dbService";
import { Project, Service } from "../types";
import SketchTo3D from "../components/SketchTo3D";

// Helper to map icon names to Lucide Icon components
const IconMap: { [key: string]: React.ComponentType<any> } = {
  Fence,
  Building,
  Warehouse,
  Flame,
  Square,
  DoorClosed,
  ShieldAlert,
  Grid,
  Settings,
  Wrench
};

export default function Home() {
  const { settings, services, categories, projects } = useApp();
  
  // Navigation scrolling state
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Lightbox State
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: "", phone: "", message: "" });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Listen to scroll to adjust navbar color
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Filter projects based on category and search query
  const filteredProjects = projects.filter((project) => {
    const matchesCategory = selectedCategory === "all" || project.category === selectedCategory;
    const matchesSearch = 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.client && project.client.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  // Handle message submission
  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.phone || !contactForm.message) {
      setFormError("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setFormError("");
    setSubmitting(true);
    try {
      await addMessage({
        name: contactForm.name,
        phone: contactForm.phone,
        message: contactForm.message,
        createdAt: new Date().toISOString()
      });
      setFormSubmitted(true);
      setContactForm({ name: "", phone: "", message: "" });
      setTimeout(() => setFormSubmitted(false), 5000);
    } catch (err) {
      console.error(err);
      setFormError("Une erreur s'est produite lors de l'envoi du message.");
    } finally {
      setSubmitting(false);
    }
  };

  // Lightbox Media handlers
  const openLightbox = (project: Project) => {
    setActiveProject(project);
    setActiveMediaIndex(0);
    setZoomLevel(1);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setActiveProject(null);
    setZoomLevel(1);
    document.body.style.overflow = "auto";
  };

  const getMediaList = (proj: Project) => {
    const list: { type: "photo" | "video"; url: string }[] = [];
    if (proj.photos && proj.photos.length > 0) {
      proj.photos.forEach(p => list.push({ type: "photo", url: p }));
    }
    if (proj.videos && proj.videos.length > 0) {
      proj.videos.forEach(v => list.push({ type: "video", url: v }));
    }
    return list;
  };

  const handleNextMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeProject) return;
    const media = getMediaList(activeProject);
    setActiveMediaIndex((prev) => (prev + 1) % media.length);
    setZoomLevel(1);
  };

  const handlePrevMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeProject) return;
    const media = getMediaList(activeProject);
    setActiveMediaIndex((prev) => (prev - 1 + media.length) % media.length);
    setZoomLevel(1);
  };

  // Social Sharing Helper
  const handleShare = (project: Project, platform: "copy" | "whatsapp" | "facebook") => {
    const text = `Découvrez cette magnifique réalisation de l'Atelier Chez Germain: "${project.title}" à ${project.location}.`;
    const shareUrl = window.location.href;

    if (platform === "copy") {
      navigator.clipboard.writeText(`${text} - ${shareUrl}`);
      alert("Lien de partage copié dans le presse-papiers !");
    } else if (platform === "whatsapp") {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + shareUrl)}`, "_blank");
    } else if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
    }
  };

  const currentSettings = settings || {
    companyName: "ATELIER CHEZ GERMAIN",
    logoUrl: "",
    phone: "+261 34 55 678 90",
    whatsapp: "+261345567890",
    address: "Mampikony, à côté de l'hôtel Nansica, Madagascar",
    facebookUrl: "",
    instagramUrl: "",
    tiktokUrl: "",
    youtubeUrl: "",
    heroImage: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=1600",
    description: "Spécialiste de la ferronnerie d'art et des ouvrages métalliques à Mampikony. Conception et fabrication de portails, charpentes, hangars, escaliers.",
    hours: "Lundi - Samedi : 07:30 - 17:30",
    primaryColor: "#1565C0"
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans text-slate-800 relative overflow-x-hidden">
      {/* Absolute Industrial blueprint background grid */}
      <div className="absolute inset-0 industrial-grid pointer-events-none z-0" />
      
      {/* 1. Glassmorphism Navigation Bar */}
      <nav 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out ${
          isScrolled 
            ? "glass-panel shadow-md py-3 text-slate-800 border-b border-slate-200/80" 
            : "bg-black/30 backdrop-blur-md border-b border-white/10 py-5 text-white"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {currentSettings.logoUrl ? (
              <img 
                src={currentSettings.logoUrl} 
                alt="Logo" 
                className="h-10 w-10 rounded-full object-cover border border-white/20" 
              />
            ) : (
              <div className="w-10 h-10 blue-gradient rounded-lg flex items-center justify-center shadow-lg shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
            )}
            <div>
              <span className={`font-extrabold text-lg sm:text-xl tracking-tight block ${isScrolled ? "text-slate-800" : "text-white"}`}>
                {currentSettings.companyName === "ATELIER CHEZ GERMAIN" || currentSettings.companyName.includes("CHEZ GERMAIN") ? (
                  <>
                    ATELIER CHEZ <span className="text-[#1565C0]">GERMAIN</span>
                  </>
                ) : (
                  currentSettings.companyName
                )}
              </span>
              <span className={`text-[10px] block tracking-[0.2em] font-bold uppercase -mt-1 font-sans ${isScrolled ? "text-slate-400" : "text-white/80"}`}>
                Ouvrages Métalliques de Précision
              </span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <div className={`hidden md:flex items-center gap-8 text-sm font-medium ${isScrolled ? "text-slate-600" : "text-white/90"}`}>
            <a href="#hero" className="hover:text-[#1565C0] transition-colors">Accueil</a>
            <a href="#services" className="hover:text-[#1565C0] transition-colors">Nos Services</a>
            <a href="#realisations" className="hover:text-[#1565C0] transition-colors">Réalisations</a>
            <a href="#sketch-generator" className="hover:text-[#1565C0] transition-colors">Concevoir en 3D</a>
            <a href="#contact" className="hover:text-[#1565C0] transition-colors">Contact</a>
            
            <Link 
              to="/login" 
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full border transition-all backdrop-blur-sm ${
                isScrolled 
                  ? "bg-slate-100 hover:bg-slate-200 text-[#1565C0] border-slate-200" 
                  : "bg-white/15 hover:bg-white/25 text-white border-white/20"
              }`}
              id="admin-login-btn"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-1 rounded-lg transition-colors ${isScrolled ? "text-slate-800 hover:bg-slate-100" : "text-white hover:bg-white/10"}`}
              id="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Links */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#1565C0]/95 backdrop-blur-lg border-t border-white/10"
            >
              <div className="px-4 py-5 space-y-4 text-center">
                <a 
                  href="#hero" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-white hover:text-white/80 py-2 border-b border-white/10"
                >
                  Accueil
                </a>
                <a 
                  href="#services" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-white hover:text-white/80 py-2 border-b border-white/10"
                >
                  Nos Services
                </a>
                <a 
                  href="#realisations" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-white hover:text-white/80 py-2 border-b border-white/10"
                >
                  Réalisations
                </a>
                <a 
                  href="#sketch-generator" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-white hover:text-white/80 py-2 border-b border-white/10"
                >
                  Concevoir en 3D
                </a>
                <a 
                  href="#contact" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-white hover:text-white/80 py-2"
                >
                  Contact
                </a>
                
                <Link 
                  to="/login" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex items-center gap-2 bg-white text-[#1565C0] font-semibold px-6 py-2.5 rounded-full shadow-lg w-full justify-center"
                >
                  <Lock className="w-4 h-4" />
                  Espace Admin
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* 2. Hero Banner Section */}
      <section 
        id="hero" 
        className="relative min-h-screen lg:h-screen flex items-center justify-center lg:justify-start bg-cover bg-center overflow-hidden pt-24 pb-16 lg:py-0"
      >
        {/* Blue Gradient & Steel Texture overlays */}
        <div className="absolute inset-0 blue-gradient z-10">
          <div 
            className="absolute inset-0 opacity-45 bg-cover bg-center mix-blend-overlay"
            style={{ backgroundImage: `url(${currentSettings.heroImage})` }}
          />
          <div className="absolute inset-0 steel-texture opacity-30" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-20 text-white flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Main Hero Copy */}
          <div className="max-w-3xl text-center lg:text-left space-y-6">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-block text-xs uppercase tracking-widest font-mono text-blue-200 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full"
            >
              Mampikony • Madagascar • Ouvrages Métalliques de Précision
            </motion.span>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl sm:text-6xl md:text-7xl font-sans font-extrabold tracking-tight text-white leading-tight uppercase"
            >
              {currentSettings.companyName === "ATELIER CHEZ GERMAIN" || currentSettings.companyName.includes("CHEZ GERMAIN") ? (
                <>
                  L'EXCELLENCE<br/>DE LA <span className="text-blue-300 font-black">CHARPENTE</span>
                </>
              ) : (
                currentSettings.companyName
              )}
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="max-w-2xl text-base sm:text-lg md:text-xl text-blue-100 font-sans tracking-wide leading-relaxed font-light"
            >
              {currentSettings.description}
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4"
            >
              <a 
                href="#realisations" 
                className="bg-white text-[#1565C0] hover:bg-slate-50 font-bold px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5"
              >
                Voir nos Réalisations
              </a>
              <a 
                href={`https://wa.me/${currentSettings.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 backdrop-blur-md border border-white/30 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-2"
              >
                WhatsApp Direct
              </a>
            </motion.div>
          </div>

          {/* En Direct de l'Atelier glass widget */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="hidden lg:block w-80 glass-panel p-6 rounded-3xl shadow-2xl shrink-0"
          >
            <h3 className="text-slate-800 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
              En Direct de l'Atelier
            </h3>
            <div className="space-y-4">
              {projects.length > 0 ? (
                projects.slice(0, 2).map((p, pIdx) => (
                  <div key={p.id || pIdx} className="flex gap-3 items-center">
                    <div className="w-16 h-12 bg-slate-200 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                      <img 
                        src={p.photos?.[0] || "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=150"} 
                        alt={p.title} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-700 truncate">{p.title}</p>
                      <p className="text-[10px] text-slate-400">
                        {p.status === "completed" ? "Projet terminé récemment" : "En cours de montage"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex gap-3 items-center">
                    <div className="w-16 h-12 bg-[#1565C0]/15 rounded-lg flex items-center justify-center text-xs text-[#1565C0] font-bold">
                      Weld
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">Portail Villa Nansica</p>
                      <p className="text-[10px] text-slate-400">Projet terminé hier</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-center">
                    <div className="w-16 h-12 bg-[#1565C0]/15 rounded-lg flex items-center justify-center text-xs text-[#1565C0] font-bold">
                      Steel
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">Hangar Industriel K6</p>
                      <p className="text-[10px] text-slate-400">En cours de montage</p>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200/60">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-500">Ouvrages totaux</span>
                <span className="text-[#1565C0] font-mono">{projects.length || "24"}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll down indicator */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 animate-bounce hidden lg:block">
          <a href="#services" className="text-white/60 hover:text-white transition-colors text-center block">
            <span className="block text-[9px] uppercase font-mono tracking-widest">Découvrir</span>
            <span className="block text-center text-base mt-1">↓</span>
          </a>
        </div>
      </section>

      {/* Metrics & Workshop Status Row */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Media gallery */}
          <div className="admin-card bg-white p-6 flex flex-col justify-between border border-slate-100 shadow-lg min-h-[140px] relative overflow-hidden group hover:shadow-xl transition-all">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-blue-50 text-[#1565C0] rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <span className="text-xs font-bold text-slate-400 font-mono">+{projects.length ? "12%" : "0%"}</span>
            </div>
            <div className="mt-4">
              <h4 className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Galerie Média</h4>
              <p className="text-2xl font-black text-slate-800 mt-1">
                {projects.reduce((acc, p) => acc + (p.photos?.length || 0) + (p.videos?.length || 0), 0) || "248"} <span className="text-sm font-normal text-slate-400">fichiers</span>
              </p>
            </div>
          </div>

          {/* Card 2: Contact requests */}
          <div className="admin-card bg-white p-6 flex flex-col justify-between border border-slate-100 shadow-lg min-h-[140px] relative overflow-hidden group hover:shadow-xl transition-all">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                </svg>
              </div>
              <span className="text-xs font-bold text-green-500 font-mono">Actif</span>
            </div>
            <div className="mt-4">
              <h4 className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Demandes d'Ouvrages</h4>
              <p className="text-2xl font-black text-slate-800 mt-1">
                Disponible <span className="text-xs font-normal text-slate-400 block sm:inline">24h/24 via WhatsApp</span>
              </p>
            </div>
          </div>

          {/* Card 3: AI Marketing Engine */}
          <div className="admin-card bg-white p-6 flex flex-col justify-between border border-slate-100 shadow-lg min-h-[140px] ring-2 ring-[#1565C0]/10 ring-inset relative overflow-hidden group hover:shadow-xl transition-all">
            <div className="absolute -right-2 -top-2 opacity-10 text-[#1565C0]">
              <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <div className="flex justify-between items-start">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <span className="bg-purple-600 text-white text-[9px] px-2 py-0.5 rounded-full font-bold">IA ACTIVE</span>
            </div>
            <div className="mt-4">
              <h4 className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Générateur Marketing</h4>
              <p className="text-2xl font-black text-slate-800 mt-1">
                Intégré <span className="text-sm font-normal text-slate-400">à l'Espace Admin</span>
              </p>
            </div>
          </div>

          {/* Card 4: Hours & Schedule */}
          <div className="admin-card bg-white p-6 flex flex-col border border-slate-100 shadow-lg justify-between min-h-[140px] hover:shadow-xl transition-all">
            <h4 className="text-slate-800 font-bold text-xs uppercase tracking-wider mb-2">Horaires d'Ouverture</h4>
            <div className="space-y-1 text-xs font-medium">
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-400">Lun - Ven</span>
                <span className="text-slate-700 font-mono">07:30 - 17:30</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-400">Samedi</span>
                <span className="text-slate-700 font-mono">08:00 - 12:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Dimanche</span>
                <span className="text-red-500 font-bold font-mono">Fermé</span>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <div className="flex-1 h-1.5 bg-[#1565C0] rounded-full"></div>
              <div className="flex-1 h-1.5 bg-slate-200 rounded-full"></div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Services Grid Section */}
      <section id="services" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#1565C0] mb-2">Notre Expertise</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 uppercase tracking-tight">
              Des Services Métalliques d'Excellence
            </p>
            <div className="h-1.5 w-20 bg-[#1565C0] mx-auto mt-4 rounded-full" />
            <p className="text-slate-500 mt-5 leading-relaxed">
              De la ferronnerie d'art haut de gamme aux grands hangars industriels, notre atelier à Mampikony réalise tous vos projets sur mesure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, idx) => {
              const ServiceIcon = IconMap[service.icon] || Settings;
              return (
                <motion.div
                  key={service.id || idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.05 }}
                  className="group bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative h-48 overflow-hidden bg-slate-900">
                    <img 
                      src={service.imageUrl || "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=600"} 
                      alt={service.title}
                      className="w-full h-full object-cover opacity-75 group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                      <div className="bg-[#1565C0] text-white p-2 rounded-xl shadow-lg">
                        <ServiceIcon className="w-5 h-5" />
                      </div>
                      <h3 className="text-white font-extrabold text-lg uppercase tracking-wide">
                        {service.title}
                      </h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Realizations Showcase (Portfolio) */}
      <section id="realisations" className="py-24 bg-slate-100 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#1565C0] mb-2">Galerie de Travaux</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 uppercase tracking-tight">
              Nos Réalisations Récentes
            </p>
            <div className="h-1.5 w-20 bg-[#1565C0] mx-auto mt-4 rounded-full" />
          </div>

          {/* Search and Categories Bar */}
          <div className="bg-white rounded-2xl shadow-md border border-slate-200/60 p-4 sm:p-6 mb-12 flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Instant Search */}
            <div className="relative w-full md:w-96">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input 
                type="text"
                placeholder="Rechercher par titre, description, lieu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1565C0] text-sm text-slate-700 bg-slate-50 transition-colors"
                id="search-input"
              />
            </div>

            {/* Categories filters list */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto overflow-x-auto justify-start md:justify-end py-1">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium tracking-wide transition-all ${
                  selectedCategory === "all"
                    ? "bg-[#1565C0] text-white shadow-md shadow-blue-200"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
                id="filter-all"
              >
                Toutes
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium tracking-wide transition-all ${
                    selectedCategory === cat.slug
                      ? "bg-[#1565C0] text-white shadow-md shadow-blue-200"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                  }`}
                  id={`filter-${cat.slug}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Realizations Grid */}
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
              <p className="text-slate-500 font-medium">Aucune réalisation ne correspond à votre recherche.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project, index) => {
                const totalMediaCount = (project.photos?.length || 0) + (project.videos?.length || 0);
                return (
                  <motion.div
                    key={project.id || index}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
                    onClick={() => openLightbox(project)}
                  >
                    <div>
                      {/* Card Media Header */}
                      <div className="relative h-56 overflow-hidden bg-slate-900">
                        <img 
                          src={project.photos?.[0] || "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=800"} 
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        
                        {/* Overlay transparent gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                        
                        {/* Completion Badge */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md backdrop-blur-md">
                          {project.status === "completed" ? (
                            <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-1 px-2.5 py-0.5 rounded-full">
                              ● Terminé
                            </span>
                          ) : (
                            <span className="bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center gap-1 px-2.5 py-0.5 rounded-full">
                              ● En cours
                            </span>
                          )}
                        </div>

                        {/* Media count Badge */}
                        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md border border-white/15 px-2.5 py-1 rounded-lg text-[10px] text-white/95 font-mono">
                          {totalMediaCount} Fichiers
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-6">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#1565C0]">
                          {categories.find(c => c.slug === project.category)?.name || "Réalisation"}
                        </span>
                        <h3 className="text-slate-900 font-extrabold text-xl uppercase mt-1 tracking-tight line-clamp-1 group-hover:text-[#1565C0] transition-colors">
                          {project.title}
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed mt-2 line-clamp-3">
                          {project.description}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer with details */}
                    <div className="px-6 pb-6 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#1565C0]" />
                        <span>{project.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#1565C0]" />
                        <span>{project.date}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 4.5. AI 3D Sketch Generator Section */}
      <section id="sketch-generator" className="py-24 bg-slate-100 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#1565C0] mb-2">Technologie Innovante</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 uppercase tracking-tight">
              Générateur d'Ouvrages 3D
            </p>
            <div className="h-1.5 w-20 bg-[#1565C0] mx-auto mt-4 rounded-full" />
            <p className="text-slate-600 mt-4 text-sm max-w-xl mx-auto leading-relaxed">
              Dessinez votre idée de portail, rampe ou charpente directement ci-dessous ou importez un fichier. Notre IA génère instantanément un rendu photoréaliste de votre projet.
            </p>
          </div>

          <SketchTo3D companyWhatsapp={currentSettings.whatsapp} />
        </div>
      </section>

      {/* 5. Contact Section */}
      <section id="contact" className="py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-[#1565C0] mb-2">Prendre Contact</h2>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 uppercase tracking-tight">
                  Discutons de Votre Projet
                </h3>
                <p className="text-slate-500 mt-4 leading-relaxed">
                  Vous avez besoin d'un devis pour un portail, une charpente ou tout autre ouvrage métallique ? Remplissez le formulaire, écrivez-nous sur WhatsApp ou passez nous voir directement à l'atelier à Mampikony !
                </p>
              </div>

              {/* Coordinates Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex items-start gap-4">
                  <div className="bg-[#1565C0]/10 text-[#1565C0] p-3 rounded-xl">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-slate-900 font-bold uppercase text-xs tracking-wider">Téléphone / WhatsApp</h4>
                    <a href={`tel:${currentSettings.phone}`} className="text-[#1565C0] font-medium text-sm block mt-1 hover:underline">
                      {currentSettings.phone}
                    </a>
                    <a 
                      href={`https://wa.me/${currentSettings.whatsapp}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-emerald-600 font-bold text-xs mt-1 block flex items-center gap-1 hover:underline"
                    >
                      Discuter sur WhatsApp →
                    </a>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex items-start gap-4">
                  <div className="bg-[#1565C0]/10 text-[#1565C0] p-3 rounded-xl">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-slate-900 font-bold uppercase text-xs tracking-wider">Localisation</h4>
                    <p className="text-slate-600 text-xs sm:text-sm mt-1 leading-normal">
                      {currentSettings.address}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 sm:col-span-2 flex items-start gap-4">
                  <div className="bg-[#1565C0]/10 text-[#1565C0] p-3 rounded-xl">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-slate-900 font-bold uppercase text-xs tracking-wider">Heures d'Ouverture</h4>
                    <p className="text-slate-600 text-xs sm:text-sm mt-1">
                      {currentSettings.hours}
                    </p>
                  </div>
                </div>
              </div>

              {/* Custom Map View / Google Maps Iframe placeholder */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md h-64 bg-slate-100 relative">
                {/* Embed a generic elegant Google Maps view centered in Madagascar / Mampikony area */}
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15444.628867372437!2d47.6333333!3d-16.1!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x22055743df658c1f%3A0xe5aef130f4a86b3b!2sMampikony%2C%20Madagascar!5e0!3m2!1sfr!2s!4v1700000000000!5m2!1sfr!2s" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={true} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Plan d'accès Atelier Chez Germain à Mampikony"
                />
              </div>
            </div>

            {/* Interactive Form */}
            <div className="bg-slate-50 rounded-3xl border border-slate-200/80 p-8 shadow-xl relative">
              <h4 className="text-slate-900 font-extrabold text-xl uppercase tracking-tight mb-6">
                Envoyer un message direct
              </h4>
              
              <AnimatePresence>
                {formSubmitted ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-2xl text-center space-y-3"
                  >
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                    <h5 className="font-bold text-lg">Message envoyé avec succès !</h5>
                    <p className="text-xs sm:text-sm text-emerald-700">
                      Merci de nous avoir contacté. Nous reviendrons vers vous très bientôt pour discuter de votre projet métallique.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmitMessage} className="space-y-5">
                    <div>
                      <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wider mb-2">
                        Nom Complet *
                      </label>
                      <input 
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        placeholder="Ex: Razafy Jean"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1565C0] text-sm text-slate-800 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wider mb-2">
                        Numéro de Téléphone *
                      </label>
                      <input 
                        type="tel"
                        required
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        placeholder="Ex: +261 34 55 678 90"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1565C0] text-sm text-slate-800 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wider mb-2">
                        Votre Message *
                      </label>
                      <textarea 
                        rows={5}
                        required
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        placeholder="Décrivez votre projet (ex: portail métallique coulissant de 4m sur mesure...)"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1565C0] text-sm text-slate-800 bg-white resize-none"
                      />
                    </div>

                    {formError && (
                      <div className="text-rose-600 text-xs font-semibold">{formError}</div>
                    )}

                    <button 
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-[#1565C0] hover:bg-[#1565C0]/90 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-blue-200 transition-all flex items-center justify-center gap-2"
                      id="submit-contact-btn"
                    >
                      <Send className="w-4 h-4" />
                      {submitting ? "Envoi en cours..." : "Envoyer le Message"}
                    </button>
                  </form>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Footer Section */}
      <footer className="bg-slate-900 text-white pt-16 pb-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Column 1: Info / Logo */}
          <div className="space-y-4">
            <span className="font-extrabold text-xl tracking-wider block">
              {currentSettings.companyName}
            </span>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Votre partenaire de confiance pour tous vos travaux et ouvrages métalliques à Mampikony. Excellence, durabilité et rigueur.
            </p>
          </div>

          {/* Column 2: Hours */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#1565C0]">Horaires</h4>
            <div className="text-slate-400 text-xs sm:text-sm space-y-1.5 font-mono">
              <p className="flex justify-between border-b border-white/5 pb-1">
                <span>Lundi - Samedi :</span>
                <span>07:30 - 17:30</span>
              </p>
              <p className="flex justify-between text-slate-500">
                <span>Dimanche :</span>
                <span>Fermé</span>
              </p>
            </div>
          </div>

          {/* Column 3: Contact coordinates */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#1565C0]">Atelier</h4>
            <div className="text-slate-400 text-xs sm:text-sm space-y-2">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#1565C0] shrink-0 mt-0.5" />
                <span>{currentSettings.address}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#1565C0]" />
                <a href={`tel:${currentSettings.phone}`} className="hover:underline">{currentSettings.phone}</a>
              </p>
            </div>
          </div>

          {/* Column 4: Quick Links / Socials */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#1565C0]">Réseaux Sociaux</h4>
            <div className="flex gap-3">
              {currentSettings.facebookUrl && (
                <a 
                  href={currentSettings.facebookUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-white/5 hover:bg-white/10 text-white p-2.5 rounded-full border border-white/10 transition-colors"
                >
                  F
                </a>
              )}
              {currentSettings.instagramUrl && (
                <a 
                  href={currentSettings.instagramUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-white/5 hover:bg-white/10 text-white p-2.5 rounded-full border border-white/10 transition-colors"
                >
                  I
                </a>
              )}
              {currentSettings.tiktokUrl && (
                <a 
                  href={currentSettings.tiktokUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-white/5 hover:bg-white/10 text-white p-2.5 rounded-full border border-white/10 transition-colors"
                >
                  T
                </a>
              )}
              {currentSettings.youtubeUrl && (
                <a 
                  href={currentSettings.youtubeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-white/5 hover:bg-white/10 text-white p-2.5 rounded-full border border-white/10 transition-colors"
                >
                  Y
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 font-mono gap-4">
          <p>© {new Date().getFullYear()} {currentSettings.companyName}. Tous droits réservés.</p>
          <div className="flex gap-4">
            <a href="#services" className="hover:underline">Services</a>
            <a href="#realisations" className="hover:underline">Réalisations</a>
            <a href="#contact" className="hover:underline">Contact</a>
          </div>
        </div>
      </footer>

      {/* 7. Beautiful Fullscreen Media Lightbox (Visionneuse de Réalisation) */}
      <AnimatePresence>
        {activeProject && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-lg z-50 flex flex-col justify-between"
            onClick={closeLightbox}
          >
            {/* Top Toolbar */}
            <div className="p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between z-10">
              <div className="text-white">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#1565C0] block font-mono">
                  {categories.find(c => c.slug === activeProject.category)?.name || "Réalisation"}
                </span>
                <h4 className="text-lg sm:text-xl font-extrabold uppercase tracking-tight">
                  {activeProject.title}
                </h4>
              </div>

              <div className="flex items-center gap-2">
                {/* Zoom controls */}
                <button 
                  onClick={(e) => { e.stopPropagation(); setZoomLevel(prev => Math.min(prev + 0.25, 2.5)); }}
                  className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Zoomer"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setZoomLevel(prev => Math.max(prev - 0.25, 0.75)); }}
                  className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Dézoomer"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>

                {/* Close Button */}
                <button 
                  onClick={closeLightbox}
                  className="bg-white/10 text-white p-2.5 rounded-full hover:bg-white/20 transition-colors"
                  id="close-lightbox-btn"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Stage */}
            <div className="relative flex-1 flex items-center justify-center p-4">
              
              {/* Prev Button */}
              {getMediaList(activeProject).length > 1 && (
                <button 
                  onClick={handlePrevMedia}
                  className="absolute left-4 bg-white/10 text-white hover:bg-white/20 p-3 rounded-full z-10 backdrop-blur-sm transition-all"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {/* Media viewer container */}
              <div 
                className="max-w-4xl max-h-[70vh] w-full h-full flex items-center justify-center relative overflow-hidden select-none"
                onClick={(e) => e.stopPropagation()}
              >
                {getMediaList(activeProject)[activeMediaIndex]?.type === "photo" ? (
                  <img 
                    src={getMediaList(activeProject)[activeMediaIndex]?.url} 
                    alt={activeProject.title}
                    className="max-w-full max-h-full object-contain rounded-lg transition-transform duration-200"
                    style={{ transform: `scale(${zoomLevel})` }}
                    // Strict disable save/drag/contextmenu to prevent easy download as requested
                    onContextMenu={(e) => e.preventDefault()}
                    draggable={false}
                  />
                ) : (
                  <video 
                    src={getMediaList(activeProject)[activeMediaIndex]?.url}
                    controls
                    className="max-w-full max-h-full rounded-lg"
                    // Disable downloads inside context menu
                    controlsList="nodownload"
                    onContextMenu={(e) => e.preventDefault()}
                  />
                )}
              </div>

              {/* Next Button */}
              {getMediaList(activeProject).length > 1 && (
                <button 
                  onClick={handleNextMedia}
                  className="absolute right-4 bg-white/10 text-white hover:bg-white/20 p-3 rounded-full z-10 backdrop-blur-sm transition-all"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}

            </div>

            {/* Bottom Panel with description and share links */}
            <div className="p-6 bg-gradient-to-t from-black via-black/90 to-transparent text-white space-y-4">
              <p className="max-w-4xl text-slate-300 text-sm sm:text-base leading-relaxed">
                {activeProject.description}
              </p>

              <div className="flex flex-wrap items-center justify-between pt-4 border-t border-white/10 gap-4 text-xs font-mono text-slate-400">
                <div className="flex gap-6">
                  {activeProject.client && (
                    <p>Client: <span className="text-white font-semibold">{activeProject.client}</span></p>
                  )}
                  <p>Lieu: <span className="text-white font-semibold">{activeProject.location}</span></p>
                  <p>Date: <span className="text-white font-semibold">{activeProject.date}</span></p>
                </div>

                {/* Sharing tools */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-xs">Partager :</span>
                  <button 
                    onClick={() => handleShare(activeProject, "whatsapp")}
                    className="bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1 font-semibold transition-all"
                  >
                    WhatsApp
                  </button>
                  <button 
                    onClick={() => handleShare(activeProject, "facebook")}
                    className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1 font-semibold transition-all"
                  >
                    Facebook
                  </button>
                  <button 
                    onClick={() => handleShare(activeProject, "copy")}
                    className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 font-semibold transition-all"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Copier le lien
                  </button>
                </div>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
