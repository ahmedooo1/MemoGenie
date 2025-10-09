import { NextRequest, NextResponse } from 'next/server';
import { streamGenerate } from '@/lib/gemini';
import { getRecentConversations } from '@/lib/database';

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
    const { projectId, message, chapterId, images } = await req.json();

    if (!projectId || !message) {
      return NextResponse.json(
        { error: 'projectId et message sont requis' },
        { status: 400 }
      );
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
