import { NextRequest, NextResponse } from 'next/server';
import {
  createChapter,
  getChaptersByProject,
  updateChapterTitle,
  updateChapterContent,
} from '@/lib/database';

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

    const chapters = getChaptersByProject(Number(projectId));
    return NextResponse.json(chapters);
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des chapitres' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { projectId, title, orderIndex } = await req.json();

    if (!projectId || !title || orderIndex === undefined) {
      return NextResponse.json(
        { error: 'projectId, title et orderIndex sont requis' },
        { status: 400 }
      );
    }

    const chapterId = createChapter(Number(projectId), title, orderIndex);
    
    return NextResponse.json({ id: chapterId });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du chapitre' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, title, content } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: 'id est requis' },
        { status: 400 }
      );
    }

    if (title !== undefined) {
      updateChapterTitle(Number(id), title);
    }
    
    if (content !== undefined) {
      updateChapterContent(Number(id), content);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du chapitre' },
      { status: 500 }
    );
  }
}
