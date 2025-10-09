import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Génère une image via Pollinations.ai (API gratuite)
 * Alternative: Utiliser DALL-E, Stable Diffusion, ou Midjourney
 */
export async function POST(req: NextRequest) {
  try {
    const { prompt, seed } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Le prompt est requis' },
        { status: 400 }
      );
    }

    // Utiliser Pollinations.ai - API gratuite pour générer des images
    // Format: https://image.pollinations.ai/prompt/{prompt}?seed={seed}&width=1024&height=1024
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${seed || Math.floor(Math.random() * 10000)}&width=1024&height=1024&nologo=true`;

    // Récupérer l'image et la convertir en base64
    const imageResponse = await fetch(imageUrl);
    
    if (!imageResponse.ok) {
      throw new Error('Erreur lors de la génération de l\'image');
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64Image}`;

    return NextResponse.json({
      success: true,
      imageUrl: dataUrl,
      prompt: prompt,
    });

  } catch (error: any) {
    console.error('Erreur génération image:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la génération de l\'image' },
      { status: 500 }
    );
  }
}
