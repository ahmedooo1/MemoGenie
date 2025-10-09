import { NextResponse } from 'next/server';
import { getAllProjects, getRecentConversations } from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const projects = getAllProjects();
    const gallery: any[] = [];

    // Pour chaque projet, récupérer les conversations avec images
    projects.forEach((project) => {
      const conversations = getRecentConversations(project.id!, 100);
      
      conversations.forEach((conv) => {
        if (conv.images) {
          try {
            const images = JSON.parse(conv.images);
            if (images && images.length > 0) {
              images.forEach((imageUrl: string) => {
                gallery.push({
                  id: conv.id,
                  projectId: project.id,
                  projectTitle: project.title,
                  projectType: project.project_type,
                  imageUrl: imageUrl,
                  content: conv.content.substring(0, 100), // Aperçu du contenu
                  createdAt: conv.created_at,
                });
              });
            }
          } catch (e) {
            console.error('Erreur parse images:', e);
          }
        }
      });
    });

    // Trier par date (plus récent en premier)
    gallery.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(gallery);
  } catch (error) {
    console.error('Erreur lors de la récupération de la galerie:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
