import { NextRequest, NextResponse } from 'next/server';
import { deleteConversation } from '@/lib/database';

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const messageId = searchParams.get('id');

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID requis' },
        { status: 400 }
      );
    }

    deleteConversation(Number(messageId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur suppression message:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du message' },
      { status: 500 }
    );
  }
}
