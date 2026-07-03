import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  getDocFromServer,
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit,
  DocumentData
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { Setting, Service, Category, Project, Message, AiHistory } from "../types";
import { 
  DEFAULT_SETTINGS, 
  DEFAULT_CATEGORIES, 
  DEFAULT_SERVICES, 
  DEFAULT_PROJECTS 
} from "../defaultData";

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function isPermissionError(err: any): boolean {
  if (!err) return false;
  const msg = (err.message || String(err)).toLowerCase();
  const code = err.code;
  return code === 'permission-denied' || msg.includes('permission') || msg.includes('insufficient');
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  
  const isMutation = [
    OperationType.CREATE, 
    OperationType.UPDATE, 
    OperationType.DELETE, 
    OperationType.WRITE
  ].includes(operationType);

  if (isMutation) {
    console.error('Firestore Write Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  } else {
    console.warn('Firestore Read Warning: ', JSON.stringify(errInfo));
    // Do not throw for GET/LIST to allow fallbacks
  }
}

// Test connection on startup as mandated by guidelines
export async function testFirebaseConnection() {
  try {
    await getDoc(doc(db, 'test', 'connection'));
    console.log("Firebase connection verified.");
  } catch (error) {
    if (isPermissionError(error)) {
      console.warn("Firebase permission warning on test document:", error);
      // We don't throw here to allow the app to try loading real data
    } else if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. Client is offline.");
    } else {
      console.log("Firebase initialized (test query complete).");
    }
  }
}

// Helper to convert Firestore documents
const mapDoc = <T>(docSnap: any): T => {
  return { id: docSnap.id, ...docSnap.data() } as T;
};

// 1. Settings Services
export async function getSettings(): Promise<Setting> {
  try {
    const docRef = doc(db, "settings", "global");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return mapDoc<Setting>(docSnap);
    } else {
      // If no settings exist in DB yet, return default settings
      return DEFAULT_SETTINGS;
    }
  } catch (err) {
    if (isPermissionError(err)) {
      handleFirestoreError(err, OperationType.GET, "settings/global");
    }
    console.error("Error getting settings:", err);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Omit<Setting, "id">): Promise<void> {
  try {
    const docRef = doc(db, "settings", "global");
    await setDoc(docRef, settings);
  } catch (err) {
    if (isPermissionError(err)) {
      handleFirestoreError(err, OperationType.WRITE, "settings/global");
    }
    throw err;
  }
}

// 2. Services Management
export async function getServices(): Promise<Service[]> {
  try {
    const colRef = collection(db, "services");
    const q = query(colRef);
    const snap = await getDocs(q);
    if (snap.empty) {
      // Return defaults if empty
      return DEFAULT_SERVICES;
    }
    return snap.docs.map(doc => mapDoc<Service>(doc));
  } catch (err) {
    if (isPermissionError(err)) {
      handleFirestoreError(err, OperationType.GET, "services");
    }
    console.error("Error getting services:", err);
    return DEFAULT_SERVICES;
  }
}

export async function addService(service: Omit<Service, "id">): Promise<string> {
  try {
    const colRef = collection(db, "services");
    const docRef = await addDoc(colRef, service);
    return docRef.id;
  } catch (err) {
    if (isPermissionError(err)) {
      handleFirestoreError(err, OperationType.CREATE, "services");
    }
    throw err;
  }
}

export async function updateService(id: string, service: Partial<Service>): Promise<void> {
  try {
    const docRef = doc(db, "services", id);
    await updateDoc(docRef, service as DocumentData);
  } catch (err) {
    if (isPermissionError(err)) {
      handleFirestoreError(err, OperationType.UPDATE, `services/${id}`);
    }
    throw err;
  }
}

export async function deleteService(id: string): Promise<void> {
  try {
    const docRef = doc(db, "services", id);
    await deleteDoc(docRef);
  } catch (err) {
    if (isPermissionError(err)) {
      handleFirestoreError(err, OperationType.DELETE, `services/${id}`);
    }
    throw err;
  }
}

// 3. Categories Management
export async function getCategories(): Promise<Category[]> {
  try {
    const colRef = collection(db, "categories");
    const snap = await getDocs(colRef);
    if (snap.empty) {
      return DEFAULT_CATEGORIES;
    }
    return snap.docs.map(doc => mapDoc<Category>(doc));
  } catch (err) {
    if (isPermissionError(err)) {
      handleFirestoreError(err, OperationType.GET, "categories");
    }
    console.error("Error getting categories:", err);
    return DEFAULT_CATEGORIES;
  }
}

export async function addCategory(category: Omit<Category, "id">): Promise<string> {
  try {
    const colRef = collection(db, "categories");
    const docRef = await addDoc(colRef, category);
    return docRef.id;
  } catch (err) {
    if (isPermissionError(err)) {
      handleFirestoreError(err, OperationType.CREATE, "categories");
    }
    throw err;
  }
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    const docRef = doc(db, "categories", id);
    await deleteDoc(docRef);
  } catch (err) {
    if (isPermissionError(err)) {
      handleFirestoreError(err, OperationType.DELETE, `categories/${id}`);
    }
    throw err;
  }
}

// 4. Projects (Réalisations) Management
export async function getProjects(): Promise<Project[]> {
  try {
    const colRef = collection(db, "projects");
    const q = query(colRef, orderBy("date", "desc"));
    const snap = await getDocs(q);
    if (snap.empty) {
      return DEFAULT_PROJECTS;
    }
    return snap.docs.map(doc => mapDoc<Project>(doc));
  } catch (err) {
    if (isPermissionError(err)) {
      handleFirestoreError(err, OperationType.GET, "projects");
    }
    console.error("Error getting projects:", err);
    return DEFAULT_PROJECTS;
  }
}

export async function addProject(project: Omit<Project, "id">): Promise<string> {
  try {
    const colRef = collection(db, "projects");
    const docRef = await addDoc(colRef, project);
    return docRef.id;
  } catch (err) {
    if (isPermissionError(err)) {
      handleFirestoreError(err, OperationType.CREATE, "projects");
    }
    throw err;
  }
}

export async function updateProject(id: string, project: Partial<Project>): Promise<void> {
  try {
    const docRef = doc(db, "projects", id);
    await updateDoc(docRef, project as DocumentData);
  } catch (err) {
    if (isPermissionError(err)) {
      handleFirestoreError(err, OperationType.UPDATE, `projects/${id}`);
    }
    throw err;
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    const docRef = doc(db, "projects", id);
    await deleteDoc(docRef);
  } catch (err) {
    if (isPermissionError(err)) {
      handleFirestoreError(err, OperationType.DELETE, `projects/${id}`);
    }
    throw err;
  }
}

// 5. Messages (Contact submissions)
export async function getMessages(): Promise<Message[]> {
  try {
    const colRef = collection(db, "messages");
    const q = query(colRef, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(doc => mapDoc<Message>(doc));
  } catch (err) {
    if (isPermissionError(err)) {
      handleFirestoreError(err, OperationType.GET, "messages");
    }
    throw err;
  }
}

export async function addMessage(message: Omit<Message, "id">): Promise<string> {
  try {
    const colRef = collection(db, "messages");
    const docRef = await addDoc(colRef, message);
    return docRef.id;
  } catch (err) {
    if (isPermissionError(err)) {
      handleFirestoreError(err, OperationType.CREATE, "messages");
    }
    throw err;
  }
}

export async function deleteMessage(id: string): Promise<void> {
  try {
    const docRef = doc(db, "messages", id);
    await deleteDoc(docRef);
  } catch (err) {
    if (isPermissionError(err)) {
      handleFirestoreError(err, OperationType.DELETE, `messages/${id}`);
    }
    throw err;
  }
}

// 6. AI History
export async function getAiHistory(projectId?: string): Promise<AiHistory[]> {
  try {
    const colRef = collection(db, "ai_history");
    const q = query(colRef, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const results = snap.docs.map(doc => mapDoc<AiHistory>(doc));
    if (projectId) {
      return results.filter(h => h.projectId === projectId);
    }
    return results;
  } catch (err) {
    if (isPermissionError(err)) {
      handleFirestoreError(err, OperationType.GET, "ai_history");
    }
    console.error("Error getting AI history:", err);
    return [];
  }
}

export async function saveAiHistory(history: Omit<AiHistory, "id">): Promise<string> {
  try {
    const colRef = collection(db, "ai_history");
    const docRef = await addDoc(colRef, history);
    return docRef.id;
  } catch (err) {
    if (isPermissionError(err)) {
      handleFirestoreError(err, OperationType.CREATE, "ai_history");
    }
    throw err;
  }
}

// 7. Seed Database (Initialize DB on first admin login/load if empty)
export async function initializeDatabaseIfEmpty(): Promise<void> {
  // Only attempt seeding if we are authenticated, otherwise we don't have write permissions anyway
  if (!auth.currentUser) {
    console.log("Skipping database initialization (not authenticated).");
    return;
  }

  try {
    // 1. Settings
    const settingsRef = doc(db, "settings", "global");
    const settingsSnap = await getDoc(settingsRef);
    if (!settingsSnap.exists()) {
      await setDoc(settingsRef, DEFAULT_SETTINGS);
      console.log("Seeded default settings.");
    }

    // 2. Services
    const servicesSnap = await getDocs(collection(db, "services"));
    if (servicesSnap.empty) {
      for (const service of DEFAULT_SERVICES) {
        const { id, ...data } = service;
        await addDoc(collection(db, "services"), data);
      }
      console.log("Seeded default services.");
    }

    // 3. Categories
    const categoriesSnap = await getDocs(collection(db, "categories"));
    if (categoriesSnap.empty) {
      for (const cat of DEFAULT_CATEGORIES) {
        const { id, ...data } = cat;
        await addDoc(collection(db, "categories"), data);
      }
      console.log("Seeded default categories.");
    }

    // 4. Projects
    const projectsSnap = await getDocs(collection(db, "projects"));
    if (projectsSnap.empty) {
      for (const proj of DEFAULT_PROJECTS) {
        const { id, ...data } = proj;
        await addDoc(collection(db, "projects"), data);
      }
      console.log("Seeded default projects.");
    }
  } catch (err) {
    if (isPermissionError(err)) {
      handleFirestoreError(err, OperationType.WRITE, "seed");
    }
    console.error("Failed to seed database:", err);
  }
}
