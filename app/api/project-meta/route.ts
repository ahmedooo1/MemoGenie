import { NextResponse } from 'next/server';
import { getProject, getChaptersByProject } from '@/lib/database';

// This API reads the incoming request URL/search params, so mark it as dynamic
// to prevent Next from attempting to prerender it statically during build.
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const projectIdParam = url.searchParams.get('projectId');
    if (!projectIdParam) {
      return NextResponse.json({ error: 'projectId required' }, { status: 400 });
    }

    const projectId = Number(projectIdParam);
    if (Number.isNaN(projectId)) {
      return NextResponse.json({ error: 'invalid projectId' }, { status: 400 });
    }

    const project = getProject(projectId);
    if (!project) return NextResponse.json({ error: 'not found' }, { status: 404 });

    const chapters = getChaptersByProject(projectId);

    const meta = {
      id: project.id,
      title: project.title,
      description: project.description || `Project ${project.title}`,
      url: `https://memogenie.aaweb.fr/projects/${project.id}`,
      chapters: chapters.map(c => ({ id: c.id, title: c.title }))
    };

    return NextResponse.json(meta);
  } catch (e) {
    console.error('project-meta error', e);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
