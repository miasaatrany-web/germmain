import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Paintbrush, 
  Eraser, 
  Trash2, 
  Upload, 
  Sparkles, 
  Download, 
  CheckCircle2, 
  Send, 
  RefreshCw,
  FileImage,
  ArrowRight
} from "lucide-react";
import { addMessage } from "../services/dbService";

interface SketchTo3DProps {
  companyWhatsapp: string;
}

export default function SketchTo3D({ companyWhatsapp }: SketchTo3DProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState("#1E293B"); // Slate-800
  const [brushSize, setBrushSize] = useState(4);
  const [isEraser, setIsEraser] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("modern");
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Quote form state inside the generator for seamless user conversion
  const [quoteName, setQuoteName] = useState("");
  const [quotePhone, setQuotePhone] = useState("");
  const [quoteMessage, setQuoteMessage] = useState("");
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);

  // Initialize canvas with solid white background
  useEffect(() => {
    initCanvas();
  }, []);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set physical resolution
    canvas.width = 600;
    canvas.height = 450;

    // Fill white
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw some subtle visual hint like "Dessinez ici" watermark if empty
    ctx.fillStyle = "#E2E8F0";
    ctx.font = "italic 16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Dessinez votre projet ici (portail, grille, charpente...)", canvas.width / 2, canvas.height / 2);
  };

  const handleCanvasTouchStart = () => {
    // If it's the first touch/click, clear the initial watermark
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
  };

  // Check if canvas is dirty/drawn on
  const [isCanvasDirty, setIsCanvasDirty] = useState(false);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear watermark on first draw
    if (!isCanvasDirty) {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      setIsCanvasDirty(true);
    }

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = isEraser ? "#FFFFFF" : brushColor;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    initCanvas();
    setIsCanvasDirty(false);
    setUploadedImage(null);
    setGeneratedImage(null);
    setNote(null);
    setError(null);
  };

  // Handling uploaded sketch file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setUploadedImage(result);
      // Draw image onto canvas
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Fit image nicely into canvas
        const ratio = Math.min(canvas.width / img.width, canvas.height / img.height);
        const nw = img.width * ratio;
        const nh = img.height * ratio;
        const nx = (canvas.width - nw) / 2;
        const ny = (canvas.height - nh) / 2;
        ctx.drawImage(img, nx, ny, nw, nh);
        setIsCanvasDirty(true);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Generate 3D design from sketch
  const handleGenerate3D = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!isCanvasDirty && !uploadedImage) {
      setError("Veuillez dessiner un croquis ou importer une image d'abord.");
      return;
    }

    setGenerating(true);
    setError(null);
    setNote(null);

    try {
      // Get base64 string from canvas
      const sketchBase64 = canvas.toDataURL("image/png");

      const response = await fetch("/api/generate-sketch-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sketch: sketchBase64,
          prompt: prompt,
          style: style
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Une erreur s'est produite lors de la génération.");
      }

      setGeneratedImage(data.imageUrl);
      if (data.note) {
        setNote(data.note);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Impossible de se connecter au serveur de génération d'image.");
    } finally {
      setGenerating(false);
    }
  };

  // Submit quote request with the sketch and 3D render
  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteName || !quotePhone) {
      setError("Le nom et le numéro de téléphone sont requis.");
      return;
    }

    setQuoteSubmitting(true);
    setError(null);

    try {
      const canvas = canvasRef.current;
      const sketchBase64 = canvas ? canvas.toDataURL("image/png") : undefined;

      const fullMessageText = `Demande de devis 3D Sketch :
- Presets Style : ${style}
- Prompt Croquis : ${prompt || "Non spécifié"}
- Commentaire client : ${quoteMessage || "Aucun commentaire additionnel"}`;

      await addMessage({
        name: quoteName,
        phone: quotePhone,
        message: fullMessageText,
        sketchUrl: sketchBase64,
        generatedImageUrl: generatedImage || undefined,
        createdAt: new Date().toISOString()
      });

      setQuoteSubmitted(true);
      setTimeout(() => {
        setQuoteSubmitted(false);
        setQuoteName("");
        setQuotePhone("");
        setQuoteMessage("");
      }, 6000);
    } catch (err: any) {
      console.error(err);
      setError("Erreur lors de l'envoi de la demande de devis.");
    } finally {
      setQuoteSubmitting(false);
    }
  };

  // Handle direct WhatsApp quote sending
  const handleWhatsAppShare = () => {
    const text = `Bonjour Atelier Chez Germain, j'ai dessiné un projet de style ${style.toUpperCase()} (${prompt || "ferronnerie"}) et j'aimerais avoir un devis.`;
    window.open(`https://wa.me/${companyWhatsapp}?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-8" id="sketch-generator-tool">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left column: Drawing board */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-slate-900 font-extrabold text-lg uppercase tracking-wider flex items-center gap-2">
                <Paintbrush className="w-5 h-5 text-[#1565C0]" />
                1. Votre Plan / Croquis
              </h4>
              <p className="text-xs text-slate-500">
                Utilisez votre doigt ou souris pour dessiner, ou chargez une photo.
              </p>
            </div>
            
            {/* Direct file upload hidden element */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          {/* Interactive Drawboard Box */}
          <div className="relative bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-inner flex flex-col items-center">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-auto aspect-[4/3] bg-white cursor-crosshair touch-none block"
            />

            {/* Canvas Toolbar controls overlay bottom */}
            <div className="w-full bg-slate-100 border-t border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                {/* Pen tool */}
                <button
                  type="button"
                  onClick={() => setIsEraser(false)}
                  className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                    !isEraser ? "bg-[#1565C0] text-white font-bold" : "bg-white hover:bg-slate-200 text-slate-700"
                  }`}
                  title="Crayon"
                >
                  <Paintbrush className="w-4 h-4" />
                  <span>Crayon</span>
                </button>

                {/* Eraser tool */}
                <button
                  type="button"
                  onClick={() => setIsEraser(true)}
                  className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                    isEraser ? "bg-[#1565C0] text-white font-bold" : "bg-white hover:bg-slate-200 text-slate-700"
                  }`}
                  title="Gomme"
                >
                  <Eraser className="w-4 h-4" />
                  <span>Gomme</span>
                </button>
              </div>

              {/* Brush size indicator */}
              <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Taille:</span>
                <input 
                  type="range" 
                  min="2" 
                  max="15" 
                  value={brushSize} 
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                  className="w-16 accent-[#1565C0]" 
                />
                <span className="font-mono text-slate-700 w-4 text-center">{brushSize}px</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Upload Image alternative */}
                <button
                  type="button"
                  onClick={triggerFileSelect}
                  className="bg-white hover:bg-slate-200 text-slate-700 p-2 rounded-lg border border-slate-200 transition-colors flex items-center gap-1 font-medium"
                  title="Importer une image"
                >
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">Importer</span>
                </button>

                {/* Clear canvas */}
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-2 rounded-lg border border-rose-100 transition-colors flex items-center gap-1 font-bold"
                  title="Effacer tout"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Effacer</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Options & Renders */}
        <div className="flex-1 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h4 className="text-slate-900 font-extrabold text-lg uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              2. Style & Rendu 3D IA
            </h4>

            {/* Style Selector Grid */}
            <div className="space-y-2">
              <label className="block text-slate-700 font-bold text-xs uppercase tracking-wider">
                Style Architectural Désiré
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "modern", name: "Moderne épuré", desc: "Acier noir, géométrique" },
                  { id: "classic", name: "Ferronnerie d'Art", desc: "Volutes baroques, volutes" },
                  { id: "industrial", name: "Charpente / Hangar", desc: "Structures et toits massifs" },
                  { id: "railing", name: "Garde-corps / Escaliers", desc: "Designs pour balcons & villas" }
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStyle(s.id)}
                    className={`p-3 rounded-xl text-left border-2 transition-all ${
                      style === s.id 
                        ? "border-[#1565C0] bg-blue-50/50" 
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <span className="block font-bold text-sm text-slate-800">{s.name}</span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">{s.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Description Text Prompts */}
            <div className="space-y-1.5">
              <label className="block text-slate-700 font-bold text-xs uppercase tracking-wider">
                Description de l'ouvrage (Couleur, dimensions...)
              </label>
              <textarea
                rows={2}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Portail métallique coulissant noir mat avec pointes dorées et serrure intégrée..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1565C0] text-sm text-slate-800 bg-slate-50 focus:bg-white resize-none"
              />
            </div>

            {/* Error messaging inside workspace panel */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 animate-pulse">
                <span>⚠️ {error}</span>
              </div>
            )}

            {/* Generate Action Button */}
            <button
              type="button"
              disabled={generating}
              onClick={handleGenerate3D}
              className="w-full bg-[#1565C0] hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Modélisation 3D en cours (Environ 5s)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                  <span>Générer le Rendu Réaliste 3D</span>
                </>
              )}
            </button>
          </div>

          {/* Results Block */}
          <div className="flex-1 flex flex-col justify-end">
            <AnimatePresence mode="wait">
              {generatedImage ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-extrabold text-[#1565C0] font-mono tracking-wider flex items-center gap-1">
                      ✨ Rendu 3D Réaliste Généré
                    </span>
                    <a 
                      href={generatedImage} 
                      download={`AtelierGermain-rendu-${style}.png`}
                      className="text-xs font-bold text-[#1565C0] hover:underline flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Télécharger
                    </a>
                  </div>

                  <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-md">
                    <img 
                      src={generatedImage} 
                      alt="Rendu 3D métallique Chez Germain" 
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {note && (
                    <p className="text-[10px] text-slate-500 italic bg-blue-50/70 p-2.5 rounded-lg border border-blue-100">
                      ℹ️ {note}
                    </p>
                  )}

                  {/* Seamless Lead Capturing Form inside AI flow */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                    <h5 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                      Intéressé ? Demandez un Devis Réel
                    </h5>
                    
                    {quoteSubmitted ? (
                      <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-lg text-xs font-medium text-center flex flex-col items-center gap-1">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span>Demande de devis soumise ! Notre équipe vous contactera sous 24h.</span>
                      </div>
                    ) : (
                      <form onSubmit={handleQuoteSubmit} className="space-y-2.5">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            required
                            placeholder="Votre Nom"
                            value={quoteName}
                            onChange={(e) => setQuoteName(e.target.value)}
                            className="px-3 py-2 rounded-lg border border-slate-200 text-xs w-full focus:outline-none focus:border-[#1565C0]"
                          />
                          <input
                            type="tel"
                            required
                            placeholder="Téléphone"
                            value={quotePhone}
                            onChange={(e) => setQuotePhone(e.target.value)}
                            className="px-3 py-2 rounded-lg border border-slate-200 text-xs w-full focus:outline-none focus:border-[#1565C0]"
                          />
                        </div>
                        <textarea
                          rows={2}
                          placeholder="Commentaires additionnels..."
                          value={quoteMessage}
                          onChange={(e) => setQuoteMessage(e.target.value)}
                          className="px-3 py-2 rounded-lg border border-slate-200 text-xs w-full resize-none focus:outline-none focus:border-[#1565C0]"
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={quoteSubmitting}
                            className="flex-1 bg-slate-900 text-white hover:bg-slate-800 font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1 transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" />
                            {quoteSubmitting ? "Envoi..." : "Envoyer à Germain"}
                          </button>
                          
                          <button
                            type="button"
                            onClick={handleWhatsAppShare}
                            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                          >
                            WhatsApp
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                </motion.div>
              ) : (
                <div className="h-44 flex flex-col items-center justify-center text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6 text-slate-400">
                  <Sparkles className="w-8 h-8 mb-2 text-[#1565C0] opacity-35" />
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Aperçu 3D en attente
                  </p>
                  <p className="text-[11px] max-w-xs mt-1">
                    Dessinez votre idée à gauche, décrivez vos options, puis cliquez sur le bouton de génération ci-dessus.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}
