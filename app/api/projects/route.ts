import { NextRequest, NextResponse } from 'next/server';
import {
  createProject,
  getAllProjects,
  getProject,
  updateProject,
} from '@/lib/database';

export async function GET(req: NextRequest) {
  try {
    // Récupérer le user_id depuis le header
    const userId = req.headers.get('x-user-id') || undefined;
    const projects = getAllProjects(userId);
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des projets' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, description, projectType } = await req.json();
    const userId = req.headers.get('x-user-id') || 'anonymous';

    if (!title) {
      return NextResponse.json(
        { error: 'Le titre est requis' },
        { status: 400 }
      );
    }

    const projectId = createProject(title, description, projectType || 'memoir', userId);
    const project = getProject(projectId, userId);

    return NextResponse.json(project);
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du projet' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, title, description } = await req.json();

    if (!id || !title) {
      return NextResponse.json(
        { error: 'ID et titre sont requis' },
        { status: 400 }
      );
    }

    updateProject(Number(id), title, description);
    const project = getProject(Number(id));

    return NextResponse.json(project);
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du projet' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID requis' },
        { status: 400 }
      );
    }

    // Supprimer le projet en utilisant la fonction database
    const { db } = await import('@/lib/database');
    const stmt = db.prepare('DELETE FROM projects WHERE id = ?');
    stmt.run(Number(id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du projet' },
      { status: 500 }
    );
  }
}
