import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    console.log('🎤 Transcription audio reçue:', audioFile.size, 'bytes, type:', audioFile.type);

    // Convertir le fichier audio en base64
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Audio = buffer.toString('base64');

    // Essayer différents modèles Gemini qui supportent l'audio
    let transcription = '';
    
    // Liste des modèles à essayer dans l'ordre
    const modelsToTry = [
      'gemini-2.0-flash-exp',
      'gemini-1.5-pro-latest',
      'gemini-1.5-pro',
      'gemini-pro'
    ];
    
    for (const modelName of modelsToTry) {
      try {
        console.log(`🔄 Essai avec ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const prompt = `Transcris exactement ce qui est dit dans cet enregistrement audio. 
Retourne UNIQUEMENT le texte parlé, sans commentaires, sans explications, sans formatage.
Si c'est en français, transcris en français.
Si c'est en arabe, transcris en arabe en utilisant les caractères arabes.
Ne dis pas "L'audio dit" ou "Je transcris" - retourne juste le texte exact.`;

        const result = await model.generateContent([
          {
            inlineData: {
              data: base64Audio,
              mimeType: audioFile.type || 'audio/webm'
            }
          },
          prompt
        ]);
        
        transcription = result.response.text().trim();
        console.log(`✅ Transcription avec ${modelName} réussie:`, transcription);
        break; // Succès, sortir de la boucle
        
      } catch (error: any) {
        console.log(`⚠️ ${modelName} a échoué:`, error.message);
        // Continuer avec le modèle suivant
      }
    }
    
    if (!transcription) {
      throw new Error('Aucun modèle Gemini disponible pour la transcription audio. Les modèles Gemini actuels ne supportent peut-être pas l\'audio dans votre région.');
    }

    return NextResponse.json({ 
      transcription,
      success: true 
    });

  } catch (error: any) {
    console.error('❌ Erreur transcription:', error);
    return NextResponse.json({ 
      error: error.message || 'Erreur lors de la transcription',
      success: false 
    }, { status: 500 });
  }
}
