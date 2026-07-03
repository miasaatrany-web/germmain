export interface Setting {
  id?: string;
  companyName: string;
  logoUrl: string;
  phone: string;
  whatsapp: string;
  address: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  heroImage: string;
  description: string;
  hours: string;
  primaryColor: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  imageUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  photos: string[];
  videos: string[];
  location: string;
  client?: string;
  status: "completed" | "in_progress";
}

export interface Message {
  id: string;
  name: string;
  phone: string;
  message: string;
  createdAt: string;
  sketchUrl?: string;
  generatedImageUrl?: string;
}

export interface AiHistory {
  id: string;
  projectId: string;
  facebookPosts: string[];
  instagramPosts: string[];
  whatsappPosts: string[];
  linkedinPosts: string[];
  seoTitle: string;
  seoDescription: string;
  hashtags: string[];
  projectDesc: string;
  professionalSummary: string;
  adIdeas: string[];
  createdAt: string;
}
