import { NextRequest, NextResponse } from 'next/server';
import { addConversation } from '@/lib/database';

export async function POST(req: NextRequest) {
  try {
    const { projectId, role, content, chapterId, images } = await req.json();

    if (!projectId || !role || !content) {
      return NextResponse.json(
        { error: 'projectId, role et content sont requis' },
        { status: 400 }
      );
    }

    const conversationId = addConversation(
      Number(projectId),
      role,
      content,
      chapterId ? Number(chapterId) : undefined,
      images || []
    );

    return NextResponse.json({ success: true, id: conversationId });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du message:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde' },
      { status: 500 }
    );
  }
}
