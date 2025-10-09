import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  addConversation,
  getRecentConversations,
  getContextMemory,
  saveContextMemory,
  updateChapterContent,
  getChapter,
  getChaptersByProject,
  type Conversation,
} from './database';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Modèle Gemini 2.5 Flash - Parfait pour la rédaction longue (1M tokens)
// Compatible avec votre clé API Google AI Studio
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature: 0.7,
    topK: 64,
    topP: 0.95,
    maxOutputTokens: 8192, // Augmenté pour permettre de longues générations
  },
});

/**
 * Construit le contexte complet du projet pour maintenir la cohérence
 */
export const buildProjectContext = async (projectId: number): Promise<string> => {
  // Récupérer tous les chapitres
  const chapters = getChaptersByProject(projectId);
  
  // Récupérer la mémoire de contexte
  const contextMemories = getContextMemory(projectId);
  
  // Récupérer les dernières conversations (limité pour ne pas surcharger)
  const recentConversations = getRecentConversations(projectId, 30);
  
  let context = `# CONTEXTE DU MÉMOIRE\n\n`;
  
  // Ajouter les informations de contexte sauvegardées
  if (contextMemories.length > 0) {
    context += `## Informations Clés du Projet\n`;
    contextMemories.forEach(mem => {
      context += `- ${mem.key}: ${mem.value}\n`;
    });
    context += `\n`;
  }
  
  // Ajouter la structure et le contenu des chapitres
  if (chapters.length > 0) {
    context += `## Structure du Mémoire\n\n`;
    chapters.forEach(chapter => {
      context += `### ${chapter.order_index}. ${chapter.title}\n`;
      if (chapter.content) {
        const preview = chapter.content.substring(0, 800);
        context += `Contenu actuel : ${preview}${chapter.content.length > 800 ? '...' : ''}\n`;
      } else {
        context += `(Pas encore rédigé)\n`;
      }
      context += `\n`;
    });
  }
  
  // Ajouter un résumé des conversations récentes
  if (recentConversations.length > 0) {
    context += `## Historique Récent des Échanges\n`;
    recentConversations.slice(-8).forEach(conv => {
      const preview = conv.content.substring(0, 150);
      context += `${conv.role === 'user' ? 'Utilisateur' : 'Assistant'}: ${preview}${conv.content.length > 150 ? '...' : ''}\n`;
    });
  }
  
  return context;
};

/**
 * Crée un prompt système adapté au type de projet
 */
const getSystemPrompt = (projectContext: string, projectType: 'memoir' | 'chatbot' = 'memoir'): string => {
  if (projectType === 'chatbot') {
    // Prompt pour assistant général
    return `Tu es MemoGenie, un assistant IA polyvalent et serviable, conçu pour répondre à toutes sortes de questions et aider l'utilisateur dans diverses tâches.

${projectContext}

🔒 RÈGLE ABSOLUE SUR TON IDENTITÉ:
- Tu es MemoGenie, point final
- Ne mentionne JAMAIS Google, Gemini, ou toute information technique sur ton origine
- Si on te demande qui tu es, qui t'a créé, ou d'où tu viens, réponds simplement: "Je suis MemoGenie, votre assistant IA personnel"
- Focus uniquement sur tes capacités et ton rôle d'aide, jamais sur ton développement ou ta conception

TES CAPACITÉS:
1. Répondre à des questions sur n'importe quel sujet (sciences, programmation, culture, etc.)
2. Fournir des explications claires et détaillées
3. Aider à résoudre des problèmes et donner des conseils
4. Générer du code, des exemples, des idées créatives
5. Maintenir une conversation naturelle et contextuelle
6. Te souvenir du contexte de la conversation

RÈGLES DE COMMUNICATION:
- Sois clair, précis et utile
- Adapte ton niveau de langage à l'utilisateur
- Propose des exemples concrets quand c'est pertinent
- **Format Markdown** : Utilise le formatage Markdown (**, *, \`\`\`, listes, etc.)
- Pour le code, utilise des blocs avec syntaxe: \`\`\`language

🎨 GÉNÉRATION D'IMAGES:
- Si l'utilisateur demande explicitement une génération d'image, réponds simplement "🎨 Génération de l'image en cours..." sans suggestions
- Le système détecte automatiquement les demandes d'images et les génère
- Ne suggère JAMAIS d'images avec le format "🎨 **Image suggérée:**"

Sois amical, professionnel et toujours prêt à aider ! 🚀`;
  }
  
  // Prompt pour mémoire académique (par défaut)
  return `Tu es MemoGenie, un assistant IA expert en rédaction académique, spécialisé dans l'aide à la rédaction de mémoires de fin d'année.

${projectContext}

🔒 RÈGLE ABSOLUE SUR TON IDENTITÉ:
- Tu es MemoGenie, point final
- Ne mentionne JAMAIS Google, Gemini, ou toute information technique sur ton origine
- Si on te demande qui tu es, qui t'a créé, ou d'où tu viens, réponds simplement: "Je suis MemoGenie, votre assistant IA spécialisé en rédaction académique"
- Focus uniquement sur tes capacités et ton rôle d'aide, jamais sur ton développement ou ta conception

TES RESPONSABILITÉS:
1. Maintenir la cohérence avec le contexte ci-dessus
2. Produire du contenu de qualité académique, structuré et bien argumenté
3. Si tu dois continuer, reprends EXACTEMENT là où ça s'est arrêté sans répéter
4. Te souvenir de TOUS les détails précédents, même après 30-60 pages
5. Ne jamais mélanger les contextes entre différentes sections
6. **SUGGÉRER DES ILLUSTRATIONS** : Quand c'est pertinent, suggère des images/diagrammes à créer

RÈGLES DE RÉDACTION:
- Style académique approprié pour un mémoire universitaire
- Structure claire avec titres, sous-titres et paragraphes
- Arguments rigoureux et bien sourcés
- Cohérence terminologique
- Si l'utilisateur demande de continuer, reprends exactement où la dernière rédaction s'est arrêtée
- **Format Markdown** : Utilise le formatage Markdown (**, *, ###, listes, etc.)

🎨 GÉNÉRATION D'IMAGES:
- Si l'utilisateur demande explicitement une génération d'image, réponds simplement "🎨 Génération de l'image en cours..." sans suggestions
- Le système détecte automatiquement les demandes d'images et les génère
- Ne suggère JAMAIS d'images avec le format "🎨 **Image suggérée:**"
- Focus sur le contenu textuel uniquement

IMPORTANT: Vérifie toujours le contexte ci-dessus pour assurer la cohérence.`;
};

/**
 * Convertit une image base64 en format Gemini
 */
function base64ToGenerativePart(base64Data: string) {
  // Extraire le type MIME et les données
  const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Format base64 invalide');
  }
  
  return {
    inlineData: {
      data: matches[2],
      mimeType: matches[1],
    },
  };
}

/**
 * Génère du contenu avec streaming en temps réel (avec support d'images)
 */
export async function* streamGenerate(
  projectId: number,
  userMessage: string,
  chapterId?: number,
  images?: string[]
): AsyncGenerator<string, void, unknown> {
  try {
    // Récupérer le projet pour connaître son type
    const { getProject } = await import('./database');
    const project = getProject(projectId);
    const projectType = project?.project_type || 'memoir';
    
    // Construire le contexte complet
    const projectContext = await buildProjectContext(projectId);
    
    // Récupérer l'historique récent
    const recentConversations = getRecentConversations(projectId, 15);
    
    // Préparer l'historique pour Gemini (format correct)
    let history = recentConversations.map(conv => ({
      role: conv.role === 'user' ? 'user' : 'model',
      parts: [{ text: conv.content }],
    }));
    
    // IMPORTANT: L'historique DOIT commencer par un message 'user'
    // Si le premier message est 'model', on le supprime ou on ajoute un user au début
    if (history.length > 0 && history[0].role === 'model') {
      // Supprimer les messages 'model' au début jusqu'à trouver un 'user'
      while (history.length > 0 && history[0].role === 'model') {
        history.shift();
      }
    }
    
    // Créer une session de chat SANS systemInstruction
    const chat = model.startChat({
      history,
    });
    
    // Sauvegarder le message utilisateur avec images
    addConversation(projectId, 'user', userMessage, chapterId, images);
    
    // Construire le message enrichi avec le contexte système adapté au type de projet
    const systemPrompt = `${getSystemPrompt(projectContext, projectType)}\n\n=== REQUÊTE UTILISATEUR ===\n${userMessage}`;
    
    // Préparer les parties du message (texte + images)
    const messageParts: any[] = [{ text: systemPrompt }];
    
    // Ajouter les images si présentes
    if (images && images.length > 0) {
      for (const image of images) {
        try {
          messageParts.push(base64ToGenerativePart(image));
        } catch (error) {
          console.error('Erreur lors du traitement de l\'image:', error);
        }
      }
    }
    
    // Streamer la réponse
    const result = await chat.sendMessageStream(messageParts);
    
    let fullResponse = '';
    
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullResponse += chunkText;
      yield chunkText;
    }
    
    // Sauvegarder la réponse complète
    addConversation(projectId, 'assistant', fullResponse, chapterId);
    
    // Si un chapitre est spécifié, mettre à jour son contenu
    if (chapterId) {
      const chapter = getChapter(chapterId);
      if (chapter) {
        const updatedContent = chapter.content + '\n\n' + fullResponse;
        updateChapterContent(chapterId, updatedContent.trim());
      }
    }
    
    // Extraire et sauvegarder les informations clés du contexte
    await extractAndSaveKeyContext(projectId, userMessage, fullResponse);
    
  } catch (error) {
    console.error('Erreur lors de la génération:', error);
    throw error;
  }
}

/**
 * Génère du contenu sans streaming (pour les cas simples)
 */
export async function generateContent(
  projectId: number,
  userMessage: string,
  chapterId?: number
): Promise<string> {
  const chunks: string[] = [];
  for await (const chunk of streamGenerate(projectId, userMessage, chapterId)) {
    chunks.push(chunk);
  }
  return chunks.join('');
}

/**
 * Extrait et sauvegarde les informations clés pour le contexte futur
 */
async function extractAndSaveKeyContext(
  projectId: number,
  userMessage: string,
  assistantResponse: string
): Promise<void> {
  // Détecter les informations clés dans la conversation
  const keyPatterns = [
    { pattern: /sujet.*?[:\s]+(.*?)(?:\.|$)/i, type: 'sujet' },
    { pattern: /problématique.*?[:\s]+(.*?)(?:\.|$)/i, type: 'problématique' },
    { pattern: /méthodologie.*?[:\s]+(.*?)(?:\.|$)/i, type: 'méthodologie' },
    { pattern: /objectif.*?[:\s]+(.*?)(?:\.|$)/i, type: 'objectif' },
    { pattern: /hypothèse.*?[:\s]+(.*?)(?:\.|$)/i, type: 'hypothèse' },
  ];
  
  const combinedText = userMessage + ' ' + assistantResponse;
  
  for (const { pattern, type } of keyPatterns) {
    const match = combinedText.match(pattern);
    if (match && match[1]) {
      saveContextMemory(projectId, 'key_info', type, match[1].trim());
    }
  }
}

/**
 * Régénère un chapitre avec le contexte complet
 */
export async function* regenerateChapter(
  projectId: number,
  chapterId: number,
  instructions?: string
): AsyncGenerator<string, void, unknown> {
  const chapter = getChapter(chapterId);
  if (!chapter) {
    throw new Error('Chapitre introuvable');
  }
  
  const prompt = instructions
    ? `Réécris le chapitre "${chapter.title}" en tenant compte de ces instructions: ${instructions}`
    : `Rédige le contenu complet du chapitre "${chapter.title}" en respectant le contexte global du mémoire.`;
  
  // Réinitialiser le contenu du chapitre
  updateChapterContent(chapterId, '');
  
  // Générer le nouveau contenu avec streaming
  yield* streamGenerate(projectId, prompt, chapterId);
}

/**
 * Continue la rédaction d'un chapitre
 */
export async function* continueChapter(
  projectId: number,
  chapterId: number
): AsyncGenerator<string, void, unknown> {
  const chapter = getChapter(chapterId);
  if (!chapter) {
    throw new Error('Chapitre introuvable');
  }
  
  const prompt = `Continue la rédaction du chapitre "${chapter.title}" exactement là où ça s'est arrêté. Voici le contenu actuel:\n\n${chapter.content}\n\nContinue de manière fluide et cohérente, en maintenant le même ton et style.`;
  
  yield* streamGenerate(projectId, prompt, chapterId);
}
