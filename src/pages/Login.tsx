import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { motion } from "motion/react";
import { Lock, Mail, ChevronLeft, AlertCircle } from "lucide-react";
import { auth } from "../firebase";
import { useApp } from "../contexts/AppContext";

export default function Login() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect automatically to Dashboard
  useEffect(() => {
    if (user) {
      navigate("/admin/dashboard");
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    setLoading(true);
    setError("");

    const normalizedInput = email.trim().toLowerCase();
    const isGermain = normalizedInput === "germain" || normalizedInput === "germain@atelierchezgermain.com";

    if (isGermain && password === "143000") {
      try {
        const fbEmail = normalizedInput === "germain" ? "germain@atelierchezgermain.com" : normalizedInput;
        try {
          await signInWithEmailAndPassword(auth, fbEmail, password);
        } catch (signInErr: any) {
          if (
            signInErr.code === "auth/user-not-found" ||
            signInErr.code === "auth/invalid-credential" ||
            signInErr.code === "auth/wrong-password"
          ) {
            console.log("Creating user on the fly...");
            try {
              await createUserWithEmailAndPassword(auth, fbEmail, password);
            } catch (createErr: any) {
              console.error("Auto-registration failed, falling back to local session", createErr);
              throw signInErr; // Rethrow original to trigger fallback
            }
          } else {
            throw signInErr;
          }
        }
        navigate("/admin/dashboard");
      } catch (err: any) {
        console.warn("Firebase Auth fallback to local session:", err);
        localStorage.setItem("germain_admin_session", "true");
        navigate("/admin/dashboard");
      } finally {
        setLoading(false);
      }
    } else {
      setError("Identifiants incorrects. Seul l'administrateur Germain avec le bon mot de passe est autorisé.");
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4 relative"
      style={{ backgroundImage: `url('https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=1600')` }}
    >
      {/* Dark Transparent Overlay */}
      <div className="absolute inset-0 bg-[#1565C0]/85 backdrop-blur-sm z-10" />

      {/* Login Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-white/20 relative z-20"
      >
        <div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#1565C0] hover:underline uppercase"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Retour au site</span>
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3.5 bg-[#1565C0]/10 rounded-2xl text-[#1565C0] mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight uppercase">
            Espace Administration
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
            Connectez-vous pour gérer l'Atelier Chez Germain
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wider mb-2">
              Identifiant ou Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input 
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="germain"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1565C0] text-sm text-slate-800 bg-slate-50 focus:bg-white transition-colors"
                id="email-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold text-xs uppercase tracking-wider mb-2">
              Mot de Passe
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1565C0] text-sm text-slate-800 bg-slate-50 focus:bg-white transition-colors"
                id="password-input"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#1565C0] hover:bg-[#1565C0]/90 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-blue-200 transition-all flex items-center justify-center gap-2"
            id="login-btn"
          >
            {loading ? (
              <span>Connexion en cours...</span>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Se Connecter</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6 text-[10px] text-slate-400 font-mono">
          ATELIER CHEZ GERMAIN • MAMPIKONY
        </div>
      </motion.div>
    </div>
  );
}
