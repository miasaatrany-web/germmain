import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building, 
  Warehouse, 
  Grid, 
  Folder, 
  MessageSquare, 
  Settings2, 
  Sparkles, 
  LogOut, 
  Plus, 
  Trash, 
  Edit, 
  Upload, 
  CheckCircle, 
  X, 
  Copy, 
  Search, 
  Calendar, 
  MapPin, 
  User, 
  Phone, 
  Eye, 
  Settings, 
  Clock, 
  FileText, 
  ArrowRight,
  Loader2,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { auth } from "../firebase";
import { useApp } from "../contexts/AppContext";
import { 
  addProject, 
  updateProject, 
  deleteProject, 
  addCategory, 
  deleteCategory,
  addService,
  updateService,
  deleteService,
  deleteMessage,
  saveAiHistory,
  getAiHistory
} from "../services/dbService";
import { Project, Service, Category, Setting, AiHistory } from "../types";

export default function Dashboard() {
  const { 
    user, 
    loadingAuth, 
    settings, 
    services, 
    categories, 
    projects, 
    messages, 
    refreshSettings,
    refreshServices,
    refreshCategories,
    refreshProjects,
    refreshMessages,
    updateGlobalSettings
  } = useApp();

  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loadingAuth && !user) {
      navigate("/login");
    }
  }, [user, loadingAuth, navigate]);

  // Tab State
  const [activeTab, setActiveTab] = useState<"projects" | "services" | "messages" | "parameters" | "marketing">("projects");

  // Project List / Edit State
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    location: "Mampikony",
    client: "",
    status: "completed" as "completed" | "in_progress",
    photos: [] as string[],
    videos: [] as string[]
  });

  // Drag and drop & compression feedback
  const [compressing, setCompressing] = useState(false);

  // Settings State
  const [settingsForm, setSettingsForm] = useState<Omit<Setting, "id">>({
    companyName: "",
    logoUrl: "",
    phone: "",
    whatsapp: "",
    address: "",
    facebookUrl: "",
    instagramUrl: "",
    tiktokUrl: "",
    youtubeUrl: "",
    heroImage: "",
    description: "",
    hours: "",
    primaryColor: "#1565C0"
  });

  // Sync settingsForm with loaded global settings
  useEffect(() => {
    if (settings) {
      setSettingsForm({
        companyName: settings.companyName || "",
        logoUrl: settings.logoUrl || "",
        phone: settings.phone || "",
        whatsapp: settings.whatsapp || "",
        address: settings.address || "",
        facebookUrl: settings.facebookUrl || "",
        instagramUrl: settings.instagramUrl || "",
        tiktokUrl: settings.tiktokUrl || "",
        youtubeUrl: settings.youtubeUrl || "",
        heroImage: settings.heroImage || "",
        description: settings.description || "",
        hours: settings.hours || "",
        primaryColor: settings.primaryColor || "#1565C0"
      });
    }
  }, [settings]);

  // Categories & Services State
  const [newCatName, setNewCatName] = useState("");
  const [serviceForm, setServiceForm] = useState({
    title: "",
    description: "",
    icon: "Settings",
    imageUrl: ""
  });
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showServiceForm, setShowServiceForm] = useState(false);

  // AI Generation State
  const [generatingAi, setGeneratingAi] = useState(false);
  const [aiResult, setAiResult] = useState<AiHistory | null>(null);
  const [aiHistories, setAiHistories] = useState<AiHistory[]>([]);
  const [selectedHistory, setSelectedHistory] = useState<AiHistory | null>(null);

  // Fetch AI History
  const fetchAllHistories = async () => {
    try {
      const h = await getAiHistory();
      setAiHistories(h);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAllHistories();
    }
  }, [user, activeTab]);

  const handleLogout = async () => {
    localStorage.removeItem("germain_admin_session");
    await signOut(auth);
    navigate("/");
  };

  // Canvas Image Compression Utility (REAL client-side compression)
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1000;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          // Compress to JPEG with 0.75 quality
          const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  // File Upload Handlers (Supports drag & drop)
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setCompressing(true);
    const newPhotos = [...projectForm.photos];
    for (let i = 0; i < files.length; i++) {
      try {
        const compressedBase64 = await compressImage(files[i]);
        newPhotos.push(compressedBase64);
      } catch (err) {
        console.error("Compression error:", err);
      }
    }
    setProjectForm({ ...projectForm, photos: newPhotos });
    setCompressing(false);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    // Read video files as object URLs or base64
    const newVideos = [...projectForm.videos];
    for (let i = 0; i < files.length; i++) {
      const reader = new FileReader();
      reader.readAsDataURL(files[i]);
      await new Promise<void>((resolve) => {
        reader.onload = (event) => {
          if (event.target?.result) {
            newVideos.push(event.target.result as string);
          }
          resolve();
        };
      });
    }
    setProjectForm({ ...projectForm, videos: newVideos });
  };

  // Project CRUD Actions
  const handleOpenAddProject = () => {
    setEditingProject(null);
    setProjectForm({
      title: "",
      description: "",
      category: categories[0]?.slug || "portails-clotures",
      date: new Date().toISOString().split("T")[0],
      location: "Mampikony",
      client: "",
      status: "completed",
      photos: [],
      videos: []
    });
    setShowProjectForm(true);
  };

  const handleOpenEditProject = (proj: Project) => {
    setEditingProject(proj);
    setProjectForm({
      title: proj.title,
      description: proj.description,
      category: proj.category,
      date: proj.date,
      location: proj.location,
      client: proj.client || "",
      status: proj.status,
      photos: proj.photos || [],
      videos: proj.videos || []
    });
    setShowProjectForm(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title || !projectForm.description) {
      alert("Le titre et la description sont requis.");
      return;
    }

    try {
      if (editingProject) {
        await updateProject(editingProject.id, projectForm);
      } else {
        await addProject(projectForm);
      }
      setShowProjectForm(false);
      refreshProjects();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la sauvegarde de la réalisation.");
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette réalisation ?")) {
      try {
        await deleteProject(id);
        refreshProjects();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Categories Actions
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    const slug = newCatName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
    try {
      await addCategory({ name: newCatName, slug });
      setNewCatName("");
      refreshCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm("Supprimer cette catégorie ?")) {
      try {
        await deleteCategory(id);
        refreshCategories();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Services Actions
  const handleOpenAddService = () => {
    setEditingService(null);
    setServiceForm({ title: "", description: "", icon: "Settings", imageUrl: "" });
    setShowServiceForm(true);
  };

  const handleOpenEditService = (service: Service) => {
    setEditingService(service);
    setServiceForm({
      title: service.title,
      description: service.description,
      icon: service.icon,
      imageUrl: service.imageUrl || ""
    });
    setShowServiceForm(true);
  };

  const handleServicePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompressing(true);
    try {
      const compressedBase64 = await compressImage(file);
      setServiceForm({ ...serviceForm, imageUrl: compressedBase64 });
    } catch (err) {
      console.error("Compression error:", err);
    }
    setCompressing(false);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.title || !serviceForm.description) return;
    try {
      if (editingService) {
        await updateService(editingService.id, serviceForm);
      } else {
        await addService(serviceForm);
      }
      setServiceForm({ title: "", description: "", icon: "Settings", imageUrl: "" });
      setEditingService(null);
      setShowServiceForm(false);
      refreshServices();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (window.confirm("Supprimer ce service ?")) {
      try {
        await deleteService(id);
        refreshServices();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Save general settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateGlobalSettings(settingsForm);
      alert("Paramètres enregistrés avec succès !");
      refreshSettings();
    } catch (err) {
      console.error(err);
      alert("Erreur de sauvegarde.");
    }
  };

  // Message Actions
  const handleDeleteMessage = async (id: string) => {
    if (window.confirm("Supprimer ce message définitivement ?")) {
      try {
        await deleteMessage(id);
        refreshMessages();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // AI Generation Handler (Triggers the server endpoint)
  const handleGenerateAiPosts = async (project: Project) => {
    setGeneratingAi(true);
    setAiResult(null);
    setActiveTab("marketing");
    try {
      const response = await fetch("/api/generate-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: project.title,
          description: project.description,
          category: project.category,
          location: project.location,
          client: project.client,
          status: project.status
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Erreur serveur");
      }

      const copyResult = await response.json();

      // Save generated posts in history
      const historyItem: Omit<AiHistory, "id"> = {
        projectId: project.id,
        createdAt: new Date().toISOString(),
        facebookPosts: copyResult.facebookPosts,
        instagramPosts: copyResult.instagramPosts,
        whatsappPosts: copyResult.whatsappPosts,
        linkedinPosts: copyResult.linkedinPosts,
        seoTitle: copyResult.seoTitle,
        seoDescription: copyResult.seoDescription,
        hashtags: copyResult.hashtags,
        projectDesc: copyResult.projectDesc,
        professionalSummary: copyResult.professionalSummary,
        adIdeas: copyResult.adIdeas
      };

      const docId = await saveAiHistory(historyItem);
      
      const savedHistory: AiHistory = {
        id: docId,
        ...historyItem
      };

      setAiResult(savedHistory);
      setSelectedHistory(savedHistory);
      fetchAllHistories();
    } catch (err: any) {
      console.error(err);
      alert("La génération d'IA a échoué : " + err.message);
    } finally {
      setGeneratingAi(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Texte copié !");
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#1565C0]" />
      </div>
    );
  }

  // Count stats
  const totalPhotos = projects.reduce((acc, p) => acc + (p.photos?.length || 0), 0);
  const totalVideos = projects.reduce((acc, p) => acc + (p.videos?.length || 0), 0);

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex relative overflow-hidden">
      {/* Absolute Industrial blueprint background grid */}
      <div className="absolute inset-0 industrial-grid pointer-events-none z-0" />
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between p-6 shrink-0 border-r border-slate-800 relative z-10">
        <div className="space-y-8">
          {/* Logo / Company name */}
          <div className="flex items-center gap-3">
            {settings?.logoUrl && (
              <img 
                src={settings.logoUrl} 
                alt="Logo Admin" 
                className="h-10 w-10 rounded-full object-contain bg-white p-1" 
                referrerPolicy="no-referrer"
              />
            )}
            <div>
              <span className="font-extrabold text-white text-lg tracking-wider block">
                {settings?.companyName || "GERMAIN ADMIN"}
              </span>
              <span className="text-[10px] text-blue-400 font-mono tracking-widest uppercase block mt-1">
                Tableau de Bord
              </span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-2">
            <button
              onClick={() => { setActiveTab("projects"); setShowProjectForm(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium tracking-wide transition-all ${
                activeTab === "projects" ? "blue-gradient text-white shadow-lg shadow-blue-950/40" : "hover:bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <Folder className="w-4 h-4" />
              <span>Réalisations</span>
            </button>

            <button
              onClick={() => setActiveTab("services")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium tracking-wide transition-all ${
                activeTab === "services" ? "blue-gradient text-white shadow-lg shadow-blue-950/40" : "hover:bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>Services & Catégories</span>
            </button>

            <button
              onClick={() => setActiveTab("messages")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium tracking-wide transition-all ${
                activeTab === "messages" ? "blue-gradient text-white shadow-lg shadow-blue-950/40" : "hover:bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <div className="relative">
                <MessageSquare className="w-4 h-4" />
                {messages.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-mono text-[9px] h-4 w-4 rounded-full flex items-center justify-center font-bold">
                    {messages.length}
                  </span>
                )}
              </div>
              <span>Messages Reçus</span>
            </button>

            <button
              onClick={() => setActiveTab("marketing")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium tracking-wide transition-all ${
                activeTab === "marketing" ? "blue-gradient text-white shadow-lg shadow-blue-950/40" : "hover:bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Assistant IA</span>
            </button>

            <button
              onClick={() => setActiveTab("parameters")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium tracking-wide transition-all ${
                activeTab === "parameters" ? "blue-gradient text-white shadow-lg shadow-blue-950/40" : "hover:bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <Settings2 className="w-4 h-4" />
              <span>Paramètres</span>
            </button>
          </nav>
        </div>

        {/* Bottom items */}
        <div className="space-y-4 pt-6 border-t border-slate-800">
          <div className="text-[10px] text-slate-500 font-mono">
            Connecté : {user?.email}
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-4 py-2.5 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8 sm:p-12 relative z-10">
        
        {/* Header containing title & statistics grids */}
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 uppercase tracking-tight">
              {activeTab === "projects" && "Gestion des Réalisations"}
              {activeTab === "services" && "Services & Catégories"}
              {activeTab === "messages" && "Messages clients"}
              {activeTab === "parameters" && "Paramètres du Site"}
              {activeTab === "marketing" && "Générateur & Historique IA"}
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 font-mono">
              Atelier Chez Germain • Mampikony, Madagascar
            </p>
          </div>

          {/* Quick Stats Bento-row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white border border-slate-200/80 p-4 rounded-2xl admin-card shrink-0">
            <div className="px-3 py-1 border-r border-slate-100">
              <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Réalisations</span>
              <span className="text-xl font-black text-[#1565C0]">{projects.length}</span>
            </div>
            <div className="px-3 py-1 border-r border-slate-100">
              <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Photos</span>
              <span className="text-xl font-black text-slate-800">{totalPhotos}</span>
            </div>
            <div className="px-3 py-1 border-r border-slate-100">
              <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Vidéos</span>
              <span className="text-xl font-black text-slate-800">{totalVideos}</span>
            </div>
            <div className="px-3 py-1">
              <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Messages</span>
              <span className="text-xl font-black text-rose-500">{messages.length}</span>
            </div>
          </div>
        </header>

        {/* Tab Contents */}

        {/* 1. Projects Management Tab */}
        {activeTab === "projects" && (
          <div className="space-y-8">
            {!showProjectForm ? (
              <>
                {/* Actions Bar */}
                <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-sm font-medium text-slate-600">
                    {projects.length} Réalisations enregistrées
                  </span>
                  <button
                    onClick={handleOpenAddProject}
                    className="bg-[#1565C0] hover:bg-[#1565C0]/90 text-white font-bold px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 text-sm"
                    id="add-project-btn"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nouvelle Réalisation</span>
                  </button>
                </div>

                {/* Realizations Grid / List */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                        <th className="p-4 sm:p-5">Visuel</th>
                        <th className="p-4 sm:p-5">Titre / Projet</th>
                        <th className="p-4 sm:p-5">Catégorie</th>
                        <th className="p-4 sm:p-5">Détails</th>
                        <th className="p-4 sm:p-5">Statut</th>
                        <th className="p-4 sm:p-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {projects.map((proj, idx) => (
                        <tr key={proj.id || idx} className="hover:bg-slate-50/55 transition-colors">
                          <td className="p-4 sm:p-5">
                            <img 
                              src={proj.photos?.[0] || "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=150"} 
                              alt={proj.title}
                              className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                            />
                          </td>
                          <td className="p-4 sm:p-5">
                            <div className="font-bold text-slate-900">{proj.title}</div>
                            <div className="text-slate-400 text-xs truncate max-w-xs">{proj.description}</div>
                          </td>
                          <td className="p-4 sm:p-5">
                            <span className="text-xs bg-blue-50 text-[#1565C0] px-2 py-1 rounded-md font-medium">
                              {categories.find(c => c.slug === proj.category)?.name || proj.category}
                            </span>
                          </td>
                          <td className="p-4 sm:p-5 text-xs text-slate-500 font-mono space-y-0.5">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{proj.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{proj.date}</span>
                            </div>
                          </td>
                          <td className="p-4 sm:p-5">
                            {proj.status === "completed" ? (
                              <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 w-fit">
                                ● Terminé
                              </span>
                            ) : (
                              <span className="text-xs bg-amber-50 text-amber-700 font-semibold px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1.5 w-fit">
                                ● En cours
                              </span>
                            )}
                          </td>
                          <td className="p-4 sm:p-5 text-right space-x-1">
                            <button
                              onClick={() => handleGenerateAiPosts(proj)}
                              className="text-[#1565C0] hover:bg-blue-50 p-2 rounded-lg transition-colors inline-flex items-center gap-1 font-semibold text-xs"
                              title="Générer publications IA"
                              id={`generate-ai-${proj.id}`}
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                              <span>IA</span>
                            </button>
                            <button
                              onClick={() => handleOpenEditProject(proj)}
                              className="text-slate-600 hover:bg-slate-100 p-2 rounded-lg transition-colors"
                              title="Modifier"
                              id={`edit-project-${proj.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProject(proj.id)}
                              className="text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-colors"
                              title="Supprimer"
                              id={`delete-project-${proj.id}`}
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              /* Add/Edit project form container */
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8"
              >
                <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
                  <h2 className="text-xl font-extrabold uppercase tracking-tight text-slate-900">
                    {editingProject ? `Modifier: ${editingProject.title}` : "Ajouter une Réalisation"}
                  </h2>
                  <button
                    onClick={() => setShowProjectForm(false)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveProject} className="space-y-6">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wider mb-2">
                        Titre du Projet *
                      </label>
                      <input 
                        type="text"
                        required
                        value={projectForm.title}
                        onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                        placeholder="Ex: Portail Coulissant Moderne"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1565C0] text-sm text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wider mb-2">
                        Catégorie *
                      </label>
                      <select
                        value={projectForm.category}
                        onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1565C0] text-sm text-slate-800"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.slug}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wider mb-2">
                        Description de l'ouvrage *
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={projectForm.description}
                        onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                        placeholder="Expliquez en quoi consiste l'ouvrage métallique (dimensions, matériaux, finitions, soudure...)"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1565C0] text-sm text-slate-800 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wider mb-2">
                        Date de réalisation *
                      </label>
                      <input 
                        type="date"
                        required
                        value={projectForm.date}
                        onChange={(e) => setProjectForm({ ...projectForm, date: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1565C0] text-sm text-slate-800 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wider mb-2">
                        Lieu de réalisation *
                      </label>
                      <input 
                        type="text"
                        required
                        value={projectForm.location}
                        onChange={(e) => setProjectForm({ ...projectForm, location: e.target.value })}
                        placeholder="Ex: Mampikony"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1565C0] text-sm text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wider mb-2">
                        Client (Optionnel)
                      </label>
                      <input 
                        type="text"
                        value={projectForm.client}
                        onChange={(e) => setProjectForm({ ...projectForm, client: e.target.value })}
                        placeholder="Ex: Résidence Privée / Hôtel Nansica"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1565C0] text-sm text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wider mb-2">
                        Statut du Projet
                      </label>
                      <div className="flex gap-4 mt-2">
                        <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer">
                          <input 
                            type="radio" 
                            name="status"
                            checked={projectForm.status === "completed"}
                            onChange={() => setProjectForm({ ...projectForm, status: "completed" })}
                            className="text-[#1565C0]"
                          />
                          <span>Projet Terminé</span>
                        </label>
                        <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer">
                          <input 
                            type="radio" 
                            name="status"
                            checked={projectForm.status === "in_progress"}
                            onChange={() => setProjectForm({ ...projectForm, status: "in_progress" })}
                            className="text-[#1565C0]"
                          />
                          <span>En cours de fabrication</span>
                        </label>
                      </div>
                    </div>

                  </div>

                  {/* ---------------------------------------------------- */}
                  {/* PHOTOS & VIDEOS MULTIPLE DRAG & DROP AND COMPRESSION */}
                  {/* ---------------------------------------------------- */}
                  <div className="border-t border-slate-100 pt-6 space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#1565C0]">
                      Médias du projet (Photos & Vidéos)
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Photo Section */}
                      <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center space-y-4 relative">
                        <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                        <div>
                          <p className="font-bold text-slate-800 text-sm">Ajouter des photos</p>
                          <p className="text-slate-500 text-xs mt-1">
                            Glissez-déposez ou sélectionnez plusieurs photos. Compression automatique intégrée.
                          </p>
                        </div>
                        <input 
                          type="file" 
                          multiple
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        {compressing && (
                          <p className="text-xs text-[#1565C0] font-semibold font-mono">Compression des images en cours...</p>
                        )}

                        {/* Photos previews list */}
                        {projectForm.photos.length > 0 && (
                          <div className="grid grid-cols-4 gap-2 pt-4 border-t border-slate-200">
                            {projectForm.photos.map((photo, pIdx) => (
                              <div key={pIdx} className="relative group/thumb h-16 w-16 rounded-lg overflow-hidden border border-slate-200">
                                <img src={photo} className="h-full w-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                  <label className="bg-[#1565C0] text-white rounded-full p-1 cursor-pointer hover:bg-blue-600 transition-colors">
                                    <Upload className="w-3 h-3" />
                                    <input 
                                      type="file" 
                                      accept="image/*" 
                                      className="hidden" 
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        setCompressing(true);
                                        try {
                                          const compressed = await compressImage(file);
                                          const newPhotos = [...projectForm.photos];
                                          newPhotos[pIdx] = compressed;
                                          setProjectForm({ ...projectForm, photos: newPhotos });
                                        } catch (err) { console.error(err); }
                                        setCompressing(false);
                                      }}
                                    />
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const filtered = projectForm.photos.filter((_, i) => i !== pIdx);
                                      setProjectForm({ ...projectForm, photos: filtered });
                                    }}
                                    className="bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Video Section */}
                      <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center space-y-4 relative">
                        <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                        <div>
                          <p className="font-bold text-slate-800 text-sm">Téléverser des vidéos</p>
                          <p className="text-slate-500 text-xs mt-1">
                            Glissez-déposez ou sélectionnez des vidéos (.mp4, etc.)
                          </p>
                        </div>
                        <input 
                          type="file" 
                          multiple
                          accept="video/*"
                          onChange={handleVideoUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />

                        {/* Videos previews list */}
                        {projectForm.videos.length > 0 && (
                          <div className="grid grid-cols-4 gap-2 pt-4 border-t border-slate-200">
                            {projectForm.videos.map((vid, vIdx) => (
                              <div key={vIdx} className="relative group/thumb h-16 w-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-900 flex items-center justify-center">
                                <span className="text-white text-[10px] font-bold">Vidéo</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const filtered = projectForm.videos.filter((_, i) => i !== vIdx);
                                    setProjectForm({ ...projectForm, videos: filtered });
                                  }}
                                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover/thumb:opacity-100 transition-opacity"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex gap-4 border-t border-slate-100 pt-6">
                    <button
                      type="submit"
                      className="bg-[#1565C0] hover:bg-[#1565C0]/90 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg transition-all"
                      id="save-project-form-btn"
                    >
                      Sauvegarder la Réalisation
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowProjectForm(false)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold px-6 py-3.5 rounded-xl transition-all"
                    >
                      Annuler
                    </button>
                  </div>

                </form>
              </motion.div>
            )}
          </div>
        )}

        {/* 2. Services and Categories Tab */}
        {activeTab === "services" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Services administration column */}
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 uppercase tracking-wide">
                  Services Offerts ({services.length})
                </h3>
                <button
                  onClick={handleOpenAddService}
                  className="bg-[#1565C0] hover:bg-[#1565C0]/90 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nouveau Service</span>
                </button>
              </div>

              {/* Service Addition/Edit Form */}
              {showServiceForm && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-slate-800 text-sm uppercase">
                      {editingService ? "Modifier le Service" : "Ajouter un Service"}
                    </h4>
                    <button onClick={() => setShowServiceForm(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <form onSubmit={handleSaveService} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wider mb-2">Titre du service *</label>
                        <input 
                          type="text" 
                          required
                          value={serviceForm.title}
                          onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                          placeholder="Ex: Escaliers hélicoïdaux"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wider mb-2">Icône</label>
                        <select
                          value={serviceForm.icon}
                          onChange={(e) => setServiceForm({ ...serviceForm, icon: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-800"
                        >
                          <option value="Fence">Fence (Grille)</option>
                          <option value="Building">Building (Bâtiment)</option>
                          <option value="Warehouse">Warehouse (Hangar)</option>
                          <option value="Flame">Flame (Soudure)</option>
                          <option value="Square">Square (Cadre/Fenêtre)</option>
                          <option value="DoorClosed">DoorClosed (Porte)</option>
                          <option value="ShieldAlert">ShieldAlert (Sécurité)</option>
                          <option value="Grid">Grid (Grilles)</option>
                          <option value="Settings">Settings (Sur Mesure)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wider mb-2">Description *</label>
                      <textarea 
                        rows={3}
                        required
                        value={serviceForm.description}
                        onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                        placeholder="Décrivez en détail la fabrication du service..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wider mb-1">Image du Service</label>
                        <div className="flex items-center gap-3">
                          <div className="relative w-16 h-16 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center">
                            {serviceForm.imageUrl ? (
                              <img src={serviceForm.imageUrl} className="w-full h-full object-cover" />
                            ) : (
                              <Upload className="w-6 h-6 text-slate-300" />
                            )}
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={handleServicePhotoUpload}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </div>
                          <div className="flex-1 space-y-1">
                            <input 
                              type="text" 
                              value={serviceForm.imageUrl}
                              onChange={(e) => setServiceForm({ ...serviceForm, imageUrl: e.target.value })}
                              placeholder="Ou collez une URL d'image..."
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-[10px] text-slate-800"
                            />
                            <p className="text-[9px] text-slate-400 italic">Cliquez sur le carré pour téléverser.</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-end">
                        <button
                          type="submit"
                          className="w-full bg-[#1565C0] hover:bg-[#1565C0]/90 text-white font-bold px-4 py-2.5 rounded-xl text-sm shadow-md"
                          id="save-service-btn"
                        >
                          {editingService ? "Mettre à jour le Service" : "Enregistrer le Service"}
                        </button>
                      </div>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Services List Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="divide-y divide-slate-200">
                  {services.map((srv, index) => (
                    <div key={srv.id || index} className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#1565C0]/10 text-[#1565C0] p-2 rounded-lg font-bold shrink-0">
                          {srv.icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{srv.title}</h4>
                          <p className="text-xs text-slate-400 line-clamp-1">{srv.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditService(srv)}
                          className="text-[#1565C0] hover:bg-blue-50 p-2 rounded-lg transition-all"
                          title="Modifier"
                          id={`edit-service-${srv.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteService(srv.id)}
                          className="text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-all"
                          title="Supprimer"
                          id={`delete-service-${srv.id}`}
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Categories column */}
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 uppercase tracking-wide mb-3">
                  Ajouter une Catégorie de Réalisation
                </h3>
                <form onSubmit={handleAddCategory} className="flex gap-2">
                  <input 
                    type="text" 
                    required
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Ex: Escaliers, Portails, Garde-corps"
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-800"
                    id="new-category-input"
                  />
                  <button
                    type="submit"
                    className="bg-[#1565C0] hover:bg-[#1565C0]/90 text-white font-bold px-4 py-2 rounded-xl text-sm"
                    id="add-category-btn"
                  >
                    Ajouter
                  </button>
                </form>
              </div>

              {/* Categories list */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs uppercase tracking-wider text-slate-500 font-mono">
                  Liste des Catégories ({categories.length})
                </div>
                <div className="divide-y divide-slate-200">
                  {categories.map((cat, idx) => (
                    <div key={cat.id || idx} className="p-4 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 text-sm">{cat.name}</span>
                        <span className="text-[10px] font-mono text-slate-400 block">Slug: {cat.slug}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-all"
                        title="Supprimer la catégorie"
                        id={`delete-category-${cat.id}`}
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* 3. Messages Received Tab */}
        {activeTab === "messages" && (
          <div className="space-y-6">
            {messages.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
                <p className="text-slate-500 font-medium">Vous n'avez reçu aucun message pour l'instant.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {messages.map((msg, idx) => (
                  <motion.div 
                    key={msg.id || idx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2.5">
                          <div className="bg-blue-50 text-[#1565C0] p-2.5 rounded-xl font-bold font-mono">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm uppercase">{msg.name}</h4>
                            <p className="text-slate-400 text-[10px] font-mono">{msg.createdAt}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                          title="Supprimer le message"
                          id={`delete-message-${msg.id}`}
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700 text-sm leading-relaxed whitespace-pre-line font-light">
                        {msg.message}
                      </div>

                      {/* Display Sketch and Generated Renders if present */}
                      {(msg.sketchUrl || msg.generatedImageUrl) && (
                        <div className="grid grid-cols-2 gap-3 border-t border-slate-150 pt-3 mt-3">
                          {msg.sketchUrl && (
                            <div className="space-y-1">
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-mono">
                                🎨 Croquis Dessiné
                              </span>
                              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white max-h-36 flex items-center justify-center">
                                <img 
                                  src={msg.sketchUrl} 
                                  alt="Croquis dessiné" 
                                  className="max-h-36 object-contain cursor-zoom-in" 
                                  onClick={() => window.open(msg.sketchUrl, '_blank')}
                                  title="Ouvrir en grand"
                                />
                              </div>
                            </div>
                          )}
                          {msg.generatedImageUrl && (
                            <div className="space-y-1">
                              <span className="text-[9px] text-[#1565C0] font-bold uppercase tracking-wider block font-mono">
                                ✨ Rendu 3D IA
                              </span>
                              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white max-h-36 flex items-center justify-center">
                                <img 
                                  src={msg.generatedImageUrl} 
                                  alt="Rendu 3D" 
                                  className="max-h-36 object-contain cursor-zoom-in" 
                                  onClick={() => window.open(msg.generatedImageUrl, '_blank')}
                                  title="Ouvrir en grand"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono font-bold">
                        <Phone className="w-3.5 h-3.5 text-[#1565C0]" />
                        <span>{msg.phone}</span>
                      </div>
                      
                      <a 
                        href={`tel:${msg.phone}`}
                        className="bg-[#1565C0] hover:bg-[#1565C0]/90 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Appeler</span>
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. Settings (Parameters) Tab */}
        {activeTab === "parameters" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 max-w-4xl">
            <h3 className="text-lg font-extrabold uppercase tracking-tight text-slate-900 mb-8 border-b border-slate-100 pb-4">
              Modifier les Informations Générales
            </h3>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wider mb-2">
                    Nom de l'entreprise *
                  </label>
                  <input 
                    type="text"
                    required
                    value={settingsForm.companyName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, companyName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1565C0] text-sm text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wider mb-2">
                    URL du Logo du site *
                  </label>
                  <input 
                    type="text"
                    required
                    value={settingsForm.logoUrl}
                    onChange={(e) => setSettingsForm({ ...settingsForm, logoUrl: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1565C0] text-sm text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wider mb-2">
                    Numéro de Téléphone *
                  </label>
                  <input 
                    type="text"
                    required
                    value={settingsForm.phone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1565C0] text-sm text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wider mb-2">
                    Numéro WhatsApp (Format international sans espace, ex: 261345567890) *
                  </label>
                  <input 
                    type="text"
                    required
                    value={settingsForm.whatsapp}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1565C0] text-sm text-slate-800"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wider mb-2">
                    Adresse complète de l'atelier *
                  </label>
                  <input 
                    type="text"
                    required
                    value={settingsForm.address}
                    onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1565C0] text-sm text-slate-800"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wider mb-2">
                    URL de l'image d'accueil (Hero Background) *
                  </label>
                  <input 
                    type="text"
                    required
                    value={settingsForm.heroImage}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroImage: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1565C0] text-sm text-slate-800"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wider mb-2">
                    Description / Slogan de l'entreprise *
                  </label>
                  <textarea 
                    rows={4}
                    required
                    value={settingsForm.description}
                    onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1565C0] text-sm text-slate-800 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wider mb-2">
                    Horaires d'Ouverture *
                  </label>
                  <input 
                    type="text"
                    required
                    value={settingsForm.hours}
                    onChange={(e) => setSettingsForm({ ...settingsForm, hours: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1565C0] text-sm text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wider mb-2">
                    Couleur Principale (Hexadécimal, ex: #1565C0) *
                  </label>
                  <input 
                    type="color"
                    required
                    value={settingsForm.primaryColor}
                    onChange={(e) => setSettingsForm({ ...settingsForm, primaryColor: e.target.value })}
                    className="h-12 w-full px-2 py-1 rounded-xl border border-slate-200"
                  />
                </div>

                {/* Social Networks Links */}
                <div className="md:col-span-2 border-t border-slate-100 pt-6 space-y-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#1565C0]">
                    Réseaux Sociaux
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wider mb-2">Facebook URL</label>
                      <input 
                        type="text"
                        value={settingsForm.facebookUrl}
                        onChange={(e) => setSettingsForm({ ...settingsForm, facebookUrl: e.target.value })}
                        placeholder="https://facebook.com/..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1565C0] text-sm text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wider mb-2">Instagram URL</label>
                      <input 
                        type="text"
                        value={settingsForm.instagramUrl}
                        onChange={(e) => setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })}
                        placeholder="https://instagram.com/..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1565C0] text-sm text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wider mb-2">TikTok URL</label>
                      <input 
                        type="text"
                        value={settingsForm.tiktokUrl}
                        onChange={(e) => setSettingsForm({ ...settingsForm, tiktokUrl: e.target.value })}
                        placeholder="https://tiktok.com/@..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1565C0] text-sm text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wider mb-2">YouTube URL</label>
                      <input 
                        type="text"
                        value={settingsForm.youtubeUrl}
                        onChange={(e) => setSettingsForm({ ...settingsForm, youtubeUrl: e.target.value })}
                        placeholder="https://youtube.com/@..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1565C0] text-sm text-slate-800"
                      />
                    </div>
                  </div>
                </div>

              </div>

              <button
                type="submit"
                className="bg-[#1565C0] hover:bg-[#1565C0]/90 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg transition-all"
                id="save-settings-btn"
              >
                Enregistrer les Paramètres
              </button>
            </form>
          </div>
        )}

        {/* 5. Marketing & AI Assistant Tab */}
        {activeTab === "marketing" && (
          <div className="space-y-8">
            {/* Loading/Generation Loader */}
            {generatingAi && (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
                <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto" />
                <h4 className="font-extrabold text-lg text-slate-900 uppercase">Génération IA en cours...</h4>
                <p className="text-slate-500 text-sm max-w-md mx-auto">
                  Notre Assistant IA analyse l'ouvrage de ferronnerie et génère 15 posts de réseaux sociaux, des titres/descriptions SEO, des résumés professionnels et des idées d'annonces publicitaires.
                </p>
              </div>
            )}

            {!generatingAi && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                
                {/* Left col: Histories list */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden lg:col-span-1">
                  <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs uppercase tracking-wider text-slate-500 font-mono">
                    Historique des Publications IA ({aiHistories.length})
                  </div>
                  {aiHistories.length === 0 ? (
                    <div className="p-6 text-slate-400 text-center text-xs">
                      Aucune publication générée pour l'instant.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200 max-h-[60vh] overflow-y-auto">
                      {aiHistories.map((hist) => {
                        const project = projects.find(p => p.id === hist.projectId);
                        return (
                          <div
                            key={hist.id}
                            onClick={() => setSelectedHistory(hist)}
                            className={`p-4 cursor-pointer hover:bg-slate-50/70 transition-colors ${
                              selectedHistory?.id === hist.id ? "bg-blue-50/50 border-l-4 border-[#1565C0]" : ""
                            }`}
                          >
                            <h5 className="font-bold text-slate-900 text-sm truncate">
                              {project?.title || "Projet supprimé / inconnu"}
                            </h5>
                            <span className="text-[10px] font-mono text-slate-400 block mt-1">
                              Généré le : {hist.createdAt.split("T")[0]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Right col: Selected History details */}
                <div className="lg:col-span-2 space-y-8">
                  {selectedHistory ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-8"
                    >
                      {/* Meta header */}
                      <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
                        <div>
                          <span className="text-xs font-bold font-mono text-amber-500 flex items-center gap-1 uppercase">
                            <Sparkles className="w-3.5 h-3.5" />
                            Contenu Marketing Généré
                          </span>
                          <h3 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight mt-1">
                            {projects.find(p => p.id === selectedHistory.projectId)?.title || "Ouvrage Métallique"}
                          </h3>
                        </div>
                        <span className="text-xs text-slate-400 font-mono">{selectedHistory.createdAt}</span>
                      </div>

                      {/* SEO Title and meta tags */}
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/50 space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#1565C0] font-mono">
                          Optimisation Référencement (SEO)
                        </h4>
                        <div className="space-y-3 text-sm">
                          <div>
                            <span className="block text-[10px] uppercase font-mono text-slate-400">Titre SEO :</span>
                            <div className="flex items-center justify-between gap-4 mt-1 font-semibold text-slate-900">
                              <span>{selectedHistory.seoTitle}</span>
                              <button 
                                onClick={() => copyToClipboard(selectedHistory.seoTitle)}
                                className="text-slate-500 hover:text-slate-800 shrink-0 p-1 bg-white border border-slate-200 rounded"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <div>
                            <span className="block text-[10px] uppercase font-mono text-slate-400">Description SEO :</span>
                            <div className="flex items-center justify-between gap-4 mt-1 text-slate-600">
                              <span>{selectedHistory.seoDescription}</span>
                              <button 
                                onClick={() => copyToClipboard(selectedHistory.seoDescription)}
                                className="text-slate-500 hover:text-slate-800 shrink-0 p-1 bg-white border border-slate-200 rounded"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Social Media Publications accordion */}
                      <div className="space-y-6">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#1565C0]">
                          Publications Réseaux Sociaux
                        </h4>

                        {/* Facebook (5 options) */}
                        <div className="space-y-4">
                          <span className="block text-[10px] font-mono uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md w-fit">
                            Publications Facebook
                          </span>
                          <div className="grid grid-cols-1 gap-4">
                            {selectedHistory.facebookPosts.map((post, pIdx) => (
                              <div key={pIdx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start justify-between gap-4 text-xs sm:text-sm">
                                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{post}</p>
                                <button 
                                  onClick={() => copyToClipboard(post)}
                                  className="text-slate-500 hover:text-slate-800 shrink-0 p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm"
                                  title="Copier le texte"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Instagram (5 options) */}
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                          <span className="block text-[10px] font-mono uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md w-fit">
                            Publications Instagram
                          </span>
                          <div className="grid grid-cols-1 gap-4">
                            {selectedHistory.instagramPosts.map((post, pIdx) => (
                              <div key={pIdx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start justify-between gap-4 text-xs sm:text-sm">
                                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{post}</p>
                                <button 
                                  onClick={() => copyToClipboard(post)}
                                  className="text-slate-500 hover:text-slate-800 shrink-0 p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* WhatsApp (5 options) */}
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                          <span className="block text-[10px] font-mono uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md w-fit">
                            Messages WhatsApp
                          </span>
                          <div className="grid grid-cols-1 gap-4">
                            {selectedHistory.whatsappPosts.map((post, pIdx) => (
                              <div key={pIdx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start justify-between gap-4 text-xs sm:text-sm">
                                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{post}</p>
                                <button 
                                  onClick={() => copyToClipboard(post)}
                                  className="text-slate-500 hover:text-slate-800 shrink-0 p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* LinkedIn */}
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                          <span className="block text-[10px] font-mono uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md w-fit">
                            Publication LinkedIn
                          </span>
                          <div className="grid grid-cols-1 gap-4">
                            {selectedHistory.linkedinPosts?.map((post, pIdx) => (
                              <div key={pIdx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start justify-between gap-4 text-xs sm:text-sm">
                                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{post}</p>
                                <button 
                                  onClick={() => copyToClipboard(post)}
                                  className="text-slate-500 hover:text-slate-800 shrink-0 p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Professional summary & description */}
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                          <span className="block text-[10px] font-mono uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md w-fit">
                            Résumé & Description Professionnelle
                          </span>
                          <div className="space-y-4">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                              <h5 className="font-extrabold text-slate-900 text-xs uppercase font-mono">Résumé professionnel de l'expertise :</h5>
                              <p className="text-slate-700 text-sm leading-relaxed">{selectedHistory.professionalSummary}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                              <h5 className="font-extrabold text-slate-900 text-xs uppercase font-mono">Description enrichie :</h5>
                              <p className="text-slate-700 text-sm leading-relaxed">{selectedHistory.projectDesc}</p>
                            </div>
                          </div>
                        </div>

                        {/* Ad Ideas & Campaigns */}
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                          <span className="block text-[10px] font-mono uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md w-fit">
                            Idées de Campagnes Publicitaires
                          </span>
                          <div className="grid grid-cols-1 gap-4">
                            {selectedHistory.adIdeas?.map((idea, pIdx) => (
                              <div key={pIdx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start justify-between gap-4 text-xs sm:text-sm">
                                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{idea}</p>
                                <button 
                                  onClick={() => copyToClipboard(idea)}
                                  className="text-slate-500 hover:text-slate-800 shrink-0 p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Hashtags list */}
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                          <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md w-fit">
                            Hashtags recommandés
                          </span>
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between gap-4 text-xs sm:text-sm font-mono text-[#1565C0] font-bold">
                            <p>{selectedHistory.hashtags?.join(" ")}</p>
                            <button 
                              onClick={() => copyToClipboard(selectedHistory.hashtags?.join(" ") || "")}
                              className="text-slate-500 hover:text-slate-800 shrink-0 p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                      </div>

                    </motion.div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm shadow-sm">
                      Sélectionnez un historique d'IA à gauche ou cliquez sur le bouton "IA" d'un projet pour générer du contenu publicitaire.
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        )}

      </main>

    </div>
  );
}
