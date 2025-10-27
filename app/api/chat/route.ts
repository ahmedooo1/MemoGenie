import { NextRequest, NextResponse } from 'next/server';
import { streamGenerate } from '@/lib/gemini';
import { getRecentConversations, addConversation } from '@/lib/database';

export const runtime = 'nodejs';

// Configuration pour activer le streaming
export const dynamic = 'force-dynamic';

// GET: Récupérer les conversations d'un projet
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId est requis' },
        { status: 400 }
      );
    }

    const conversations = getRecentConversations(Number(projectId), 30);
    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Erreur lors de la récupération des conversations:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des conversations' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Accept an optional `persistedMessage` which will be saved to the DB.
    // `message` is used for the AI/generation and may contain large/attached
    // content (PDF full text). We persist only the user-visible `persistedMessage`.
  const { projectId, message, persistedMessage, chapterId, images, userQuestion } = await req.json();

    if (!projectId || !message) {
      return NextResponse.json(
        { error: 'projectId et message sont requis' },
        { status: 400 }
      );
    }

    // Save a safe user-facing message (persistedMessage) instead of the raw
    // AI-facing `message` when available. This prevents large or sensitive
    // content (eg. full extracted PDF text) from being stored in the
    // conversations table.
    if (projectId) {
      const toSave = persistedMessage || message;
      try {
        // If we have both a concise persisted card and a user question, persist
        // them together in a single conversation row so they render as one
        // message bubble after refresh.
        const cleanQuestion = userQuestion ? String(userQuestion).trim() : '';

        if (toSave && cleanQuestion && cleanQuestion !== String(toSave).trim()) {
          const combined = `${String(toSave).trim()}\n\n${cleanQuestion}`;
          addConversation(Number(projectId), 'user', combined, chapterId ? Number(chapterId) : undefined, images || []);
        } else if (toSave) {
          // Only the concise card (no separate question)
          addConversation(Number(projectId), 'user', String(toSave).trim(), chapterId ? Number(chapterId) : undefined, images || []);
        } else if (cleanQuestion) {
          // No persisted card, but we have a question -> save the question
          addConversation(Number(projectId), 'user', cleanQuestion, chapterId ? Number(chapterId) : undefined, []);
        }
      } catch (e) {
        console.error('Erreur sauvegarde message utilisateur (chat route):', e);
      }
    }

    // Créer un ReadableStream pour le streaming
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamGenerate(
            Number(projectId),
            message,
            chapterId ? Number(chapterId) : undefined,
            images // Passer les images au générateur
          )) {
            // Envoyer chaque chunk au client
            const data = JSON.stringify({ content: chunk });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
          
          // Signaler la fin du stream
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Erreur de streaming:', error);
          controller.error(error);
        }
      },
    });

    // Retourner une réponse avec streaming Server-Sent Events
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Erreur API:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération' },
      { status: 500 }
    );
  }
}
