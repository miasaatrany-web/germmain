import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini safely
  let ai: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }

  // API Routes
  app.post("/api/generate-ai", async (req, res) => {
    try {
      const { title, description, category, location, client, status } = req.body;

      if (!title || !description) {
        return res.status(400).json({ error: "Le titre et la description sont requis." });
      }

      if (!process.env.GEMINI_API_KEY || !ai) {
        return res.status(500).json({ error: "La clé API Gemini n'est pas configurée sur le serveur." });
      }

      const prompt = `Génère du contenu marketing et SEO professionnel en français pour un projet de ferronnerie / ouvrage métallique de l'entreprise "Atelier Chez Germain" (situé à Mampikony, Madagascar, à côté de l'hôtel Nansica).
      
Informations sur le projet :
- Titre : ${title}
- Description : ${description}
- Catégorie : ${category}
- Lieu : ${location || "Mampikony"}
- Client : ${client || "Non spécifié"}
- Statut : ${status === "completed" ? "Projet terminé" : "Projet en cours"}

Tu dois retourner un objet JSON correspondant EXACTEMENT au schéma spécifié. Tout le contenu textuel généré doit être professionnel, extrêmement vendeur, poli, moderne, engageant et sans fautes.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            required: [
              "facebookPosts",
              "instagramPosts",
              "whatsappPosts",
              "linkedinPosts",
              "seoTitle",
              "seoDescription",
              "hashtags",
              "projectDesc",
              "professionalSummary",
              "adIdeas"
            ],
            properties: {
              facebookPosts: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "5 publications Facebook différentes adaptées, dynamiques et engageantes."
              },
              instagramPosts: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "5 publications Instagram différentes avec un ton moderne et visuel."
              },
              whatsappPosts: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "5 messages WhatsApp courts et directs à envoyer aux contacts et clients."
              },
              linkedinPosts: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "1 publication LinkedIn professionnelle, mettant en valeur l'expertise de l'atelier."
              },
              seoTitle: {
                type: Type.STRING,
                description: "1 titre SEO optimisé."
              },
              seoDescription: {
                type: Type.STRING,
                description: "1 méta-description SEO optimisée."
              },
              hashtags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Une liste de hashtags pertinents pour le métal, la soudure et l'artisanat."
              },
              projectDesc: {
                type: Type.STRING,
                description: "Une description élégante et enrichie de la réalisation."
              },
              professionalSummary: {
                type: Type.STRING,
                description: "Un résumé professionnel de l'expertise déployée dans ce projet."
              },
              adIdeas: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3 à 5 idées de campagnes publicitaires ou angles de communication."
              }
            }
          }
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("Aucun texte retourné par Gemini");
      }

      res.json(JSON.parse(text));
    } catch (error: any) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: error.message || "Erreur lors de la génération IA" });
    }
  });

  // 3D Image Generator from Sketch API Endpoint
  app.post("/api/generate-sketch-image", async (req, res) => {
    try {
      const { sketch, prompt, style } = req.body;

      if (!sketch) {
        return res.status(400).json({ error: "L'image du croquis est requise." });
      }

      // Fallback URLs based on style selection for testing when Gemini API key is not fully configured or is rate limited
      const styleFallbacks: { [key: string]: string } = {
        modern: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800",
        classic: "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?auto=format&fit=crop&q=80&w=800",
        industrial: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=800",
        railing: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&q=80&w=800",
      };

      const selectedFallback = styleFallbacks[style] || styleFallbacks["modern"];

      // If Gemini is not configured, return fallback directly with a note
      if (!process.env.GEMINI_API_KEY || !ai) {
        console.warn("Gemini API key is not set. Using beautiful fallback image.");
        return res.json({ 
          imageUrl: selectedFallback, 
          note: "Mode démonstration : Une superbe image d'Unsplash a été sélectionnée pour correspondre à votre style, car la clé API Gemini n'est pas encore configurée." 
        });
      }

      // Extract raw base64 and mime type from data URL
      let base64Data = sketch;
      let mimeType = "image/png";
      if (sketch.startsWith("data:")) {
        const matches = sketch.match(/^data:([^;]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          mimeType = matches[1];
          base64Data = matches[2];
        }
      }

      const fullPrompt = `Transform this hand-drawn sketch/croquis into a highly professional, photorealistic 3D physical rendering.
Style preset: ${style || "modern"} (modern minimalist, classic wrought iron d'art, industrial metal framework, or elegant railing/escalier)
Requirements: ${prompt || "Ouvrage en métal de précision"}

Output must be a stunning, realistic, finished 3D visualization. Exquisite metallic texture (wrought iron, steel, bronze, gold accents where appropriate), realistic lighting, sharp focus, architectural masterpiece by Atelier Chez Germain. Keep the shape, structure, and proportions of the original sketch, but render it as a real physical high-quality metallic object. Absolutely NO hand-drawn pencil/pen lines or paper background should remain in the output.`;

      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite-image",
          contents: {
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: mimeType,
                },
              },
              {
                text: fullPrompt,
              },
            ],
          },
        });

        let generatedBase64 = "";
        if (response?.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData?.data) {
              generatedBase64 = part.inlineData.data;
              break;
            }
          }
        }

        if (!generatedBase64) {
          throw new Error("Gemini did not return an inline image part.");
        }

        return res.json({ imageUrl: `data:image/png;base64,${generatedBase64}` });
      } catch (geminiErr: any) {
        console.warn("Gemini API call failed, using graceful style-based mockup fallback:", geminiErr);
        return res.json({ 
          imageUrl: selectedFallback, 
          note: `Mode démonstration : Image générée de remplacement pour le style ${style} (Erreur API : ${geminiErr.message || "clé inactive"}).`
        });
      }
    } catch (error: any) {
      console.error("Sketch API general error:", error);
      res.status(500).json({ error: error.message || "Erreur lors du traitement de l'image" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
