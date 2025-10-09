import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key manquante' }, { status: 500 });
    }

    // Test direct avec fetch vers l'API Google
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
    );

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ 
        error: 'Erreur lors de la récupération des modèles', 
        details: error,
        status: response.status 
      }, { status: response.status });
    }

    const data = await response.json();
    
    // Filtrer pour ne garder que les modèles qui supportent generateContent
    const compatibleModels = data.models
      ?.filter((model: any) => 
        model.supportedGenerationMethods?.includes('generateContent')
      )
      .map((model: any) => ({
        name: model.name,
        displayName: model.displayName,
        description: model.description,
        methods: model.supportedGenerationMethods
      }));

    return NextResponse.json({
      success: true,
      apiKeyPrefix: apiKey.substring(0, 10) + '...',
      totalModels: data.models?.length || 0,
      compatibleModels: compatibleModels || [],
      rawResponse: data
    });

  } catch (error: any) {
    console.error('Erreur:', error);
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
