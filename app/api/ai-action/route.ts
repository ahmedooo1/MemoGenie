import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/user';
import { generateText } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const userId = getUserId();
    const { action, text, language = 'fr' } = await request.json();

    if (!action || !text) {
      return NextResponse.json({ error: 'Action et texte requis' }, { status: 400 });
    }

    let prompt = '';
    
    switch (action) {
      case 'rewrite':
        prompt = `Réécris ce texte en gardant le même sens mais en améliorant la clarté et la fluidité :\n\n${text}`;
        break;
      case 'summarize':
        prompt = `Résume ce texte en gardant les points essentiels :\n\n${text}`;
        break;
      case 'translate':
        prompt = `Traduis ce texte en français (si c'est dans une autre langue) ou en anglais (si c'est en français) :\n\n${text}`;
        break;
      case 'change-tone':
        prompt = `Réécris ce texte en changeant le ton pour le rendre plus professionnel et formel :\n\n${text}`;
        break;
      case 'expand':
        prompt = `Développe et enrichis ce texte en ajoutant des détails et des explications :\n\n${text}`;
        break;
      case 'shorten':
        prompt = `Raccourcis ce texte en gardant uniquement l'essentiel :\n\n${text}`;
        break;
      default:
        return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
    }

    const result = await generateText(prompt);
    
    return NextResponse.json({ 
      success: true, 
      result: result,
      action: action 
    });

  } catch (error) {
    console.error('Erreur AI Action:', error);
    return NextResponse.json({ 
      error: 'Erreur lors du traitement de l\'action IA' 
    }, { status: 500 });
  }
}
