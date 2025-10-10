import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Modifie une image existante via Cloudflare Workers AI (img2img)
 * Utilise l'image précédente comme base pour générer une variation
 */
export async function POST(req: NextRequest) {
  try {
    const { prompt, imageBase64 } = await req.json();

    if (!prompt || !imageBase64) {
      return NextResponse.json(
        { error: 'Le prompt et l\'image de base sont requis' },
        { status: 400 }
      );
    }

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    // Vérifier si Cloudflare est configuré
    if (!accountId || accountId === 'your_account_id_here' || 
        !apiToken || apiToken === 'your_api_token_here') {
      console.log('⚠️ Cloudflare non configuré, fallback sur génération simple');
      return NextResponse.json({
        success: false,
        useFallback: true,
        message: 'Cloudflare non configuré, utilisez l\'API de génération'
      });
    }

    console.log('☁️ Utilisation de Cloudflare Workers AI pour img2img...');

    // Convertir base64 en buffer
    const imageBuffer = Buffer.from(imageBase64.split(',')[1], 'base64');

    // Appel à Cloudflare Workers AI
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          image: Array.from(imageBuffer), // Convertir en array pour Cloudflare
          num_steps: 20,
          strength: 0.7, // 0.7 = conserve 30% de l'image originale
          guidance: 7.5,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur Cloudflare:', errorText);
      return NextResponse.json({
        success: false,
        useFallback: true,
        error: 'Erreur Cloudflare, utilisez l\'API de génération'
      });
    }

    const result = await response.arrayBuffer();
    const base64Image = Buffer.from(result).toString('base64');
    const dataUrl = `data:image/png;base64,${base64Image}`;

    console.log('✅ Image modifiée avec Cloudflare Workers AI');
    return NextResponse.json({
      success: true,
      imageUrl: dataUrl,
      prompt: prompt,
      provider: 'cloudflare-img2img'
    });

  } catch (error: any) {
    console.error('❌ Erreur modification image:', error);
    return NextResponse.json(
      { 
        success: false, 
        useFallback: true,
        error: error.message || 'Erreur lors de la modification de l\'image' 
      },
      { status: 500 }
    );
  }
}
