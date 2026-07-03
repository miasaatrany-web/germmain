import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../firebase";
import { Setting, Service, Category, Project, Message } from "../types";
import { 
  getSettings, 
  getServices, 
  getCategories, 
  getProjects, 
  getMessages, 
  saveSettings,
  initializeDatabaseIfEmpty,
  testFirebaseConnection
} from "../services/dbService";

interface AppContextType {
  user: User | null;
  loadingAuth: boolean;
  settings: Setting | null;
  services: Service[];
  categories: Category[];
  projects: Project[];
  messages: Message[];
  loadingData: boolean;
  refreshSettings: () => Promise<void>;
  refreshServices: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  refreshProjects: () => Promise<void>;
  refreshMessages: () => Promise<void>;
  updateGlobalSettings: (newSettings: Omit<Setting, "id">) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [settings, setSettings] = useState<Setting | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // 1. Listen for Authentication changes
  useEffect(() => {
    const localSession = localStorage.getItem("germain_admin_session");
    if (localSession === "true") {
      setUser({
        uid: "germain-admin",
        email: "germain@atelierchezgermain.com",
        displayName: "Germain Admin",
      } as any);
      setLoadingAuth(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch Firestore Data or Defaults
  const fetchAllData = async () => {
    setLoadingData(true);
    try {
      // Test the connection
      await testFirebaseConnection();
      
      // Auto-initialize DB with defaults if completely empty
      await initializeDatabaseIfEmpty();

      // Fetch
      const [s, srv, cat, proj] = await Promise.all([
        getSettings(),
        getServices(),
        getCategories(),
        getProjects()
      ]);

      setSettings(s);
      setServices(srv);
      setCategories(cat);
      setProjects(proj);

      // If user is logged in, fetch messages too
      if (auth.currentUser) {
        const msg = await getMessages();
        setMessages(msg);
      }
    } catch (err) {
      console.error("Error loading application data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [user]); // Re-fetch on auth changes to get messages

  const refreshSettings = async () => {
    const s = await getSettings();
    setSettings(s);
  };

  const refreshServices = async () => {
    const srv = await getServices();
    setServices(srv);
  };

  const refreshCategories = async () => {
    const cat = await getCategories();
    setCategories(cat);
  };

  const refreshProjects = async () => {
    const proj = await getProjects();
    setProjects(proj);
  };

  const refreshMessages = async () => {
    const msg = await getMessages();
    setMessages(msg);
  };

  const updateGlobalSettings = async (newSettings: Omit<Setting, "id">) => {
    await saveSettings(newSettings);
    setSettings({ ...newSettings });
  };

  return (
    <AppContext.Provider
      value={{
        user,
        loadingAuth,
        settings,
        services,
        categories,
        projects,
        messages,
        loadingData,
        refreshSettings,
        refreshServices,
        refreshCategories,
        refreshProjects,
        refreshMessages,
        updateGlobalSettings
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
