import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Génère une image via Hugging Face (Stable Diffusion) avec fallback sur Pollinations.ai
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

    const huggingFaceToken = process.env.HUGGINGFACE_API_KEY;
    
    // Essayer Hugging Face si token disponible
    if (huggingFaceToken && huggingFaceToken !== 'your_token_here') {
      try {
        console.log('🤗 Utilisation de Hugging Face Stable Diffusion...');
        
        const response = await fetch(
          'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${huggingFaceToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              inputs: prompt,
              parameters: {
                num_inference_steps: 30,
                guidance_scale: 7.5,
                seed: seed || Math.floor(Math.random() * 10000),
              }
            }),
          }
        );

        if (response.ok) {
          const imageBuffer = await response.arrayBuffer();
          const base64Image = Buffer.from(imageBuffer).toString('base64');
          const dataUrl = `data:image/png;base64,${base64Image}`;

          console.log('✅ Image générée avec Hugging Face');
          return NextResponse.json({
            success: true,
            imageUrl: dataUrl,
            prompt: prompt,
            provider: 'huggingface'
          });
        } else {
          const errorText = await response.text();
          console.warn('⚠️ Hugging Face échoué:', errorText);
          console.log('🔄 Fallback sur Pollinations...');
        }
      } catch (hfError) {
        console.warn('⚠️ Erreur Hugging Face:', hfError);
        console.log('🔄 Fallback sur Pollinations...');
      }
    } else {
      console.log('⚠️ Token Hugging Face non configuré, utilisation de Pollinations');
    }

    // Fallback: Utiliser Pollinations.ai
    console.log('🌸 Utilisation de Pollinations.ai...');
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${seed || Math.floor(Math.random() * 10000)}&width=1024&height=1024&nologo=true`;

    const imageResponse = await fetch(imageUrl);
    
    if (!imageResponse.ok) {
      throw new Error('Erreur lors de la génération de l\'image');
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64Image}`;

    console.log('✅ Image générée avec Pollinations');
    return NextResponse.json({
      success: true,
      imageUrl: dataUrl,
      prompt: prompt,
      provider: 'pollinations'
    });

  } catch (error: any) {
    console.error('❌ Erreur génération image:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la génération de l\'image' },
      { status: 500 }
    );
  }
}
