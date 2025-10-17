import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

export async function POST(request: NextRequest): Promise<Response> {
  let tempFilePath: string | null = null;
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    if (file.type !== 'application/pdf') return NextResponse.json({ error: 'Le fichier doit être un PDF' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log(`[PDF Gemini] 📄 Lecture avec Gemini API: ${file.name} (${file.size} bytes)`);

    // Sauvegarder temporairement le PDF
    tempFilePath = join(tmpdir(), `pdf-${Date.now()}-${file.name}`);
    await writeFile(tempFilePath, buffer);
    console.log(`[PDF Gemini] 💾 Sauvegardé: ${tempFilePath}`);

    // Upload le PDF vers Gemini File API
    const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY || '');
    
    console.log('[PDF Gemini] ☁️  Upload vers Gemini File API...');
    const uploadResult = await fileManager.uploadFile(tempFilePath, {
      mimeType: 'application/pdf',
      displayName: file.name,
    });
    
    console.log(`[PDF Gemini] ✅ Uploadé: ${uploadResult.file.uri}`);

    // Demander à Gemini d'extraire le texte
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    console.log('[PDF Gemini] 🤖 Extraction du texte avec Gemini...');
    const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadResult.file.mimeType,
          fileUri: uploadResult.file.uri,
        },
      },
      {
        text: `Extrais TOUT le texte de ce document PDF. Retourne UNIQUEMENT le texte brut, sans commentaire, sans formatage markdown. Inclus tous les titres, paragraphes, et contenu. Si c'est un PDF scanné, utilise ta vision pour lire le texte.`,
      },
    ]);

    const text = result.response.text();
    console.log(`[PDF Gemini] 🎉 ${text.length} caractères extraits!`);
    console.log(`[PDF Gemini] Aperçu: ${text.substring(0, 200)}`);

    // Supprimer le fichier de Gemini
    await fileManager.deleteFile(uploadResult.file.name);
    console.log('[PDF Gemini] 🗑️  Fichier supprimé de Gemini');

    return NextResponse.json({
      success: text.length > 0,
      text: text.trim(),
      numPages: 0, // Gemini ne donne pas le nombre de pages
      fileName: file.name,
      fileSize: file.size,
      isScanned: false,
    });
  } catch (err) {
    console.error('[PDF Gemini] ❌ Erreur:', err);
    return NextResponse.json({
      success: false,
      text: '',
      numPages: 0,
      fileName: '',
      fileSize: 0,
      error: err instanceof Error ? err.message : String(err),
      isScanned: true,
    }, { status: 200 });
  } finally {
    // Nettoyer le fichier temporaire
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
        console.log('[PDF Gemini] 🧹 Fichier temp supprimé');
      } catch {}
    }
  }
}
