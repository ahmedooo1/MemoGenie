import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

// Parse PDF using pdf.js-extract which is already in dependencies
async function parsePdfWithPdfJsExtract(filePath: string): Promise<{ text: string; numPages: number }> {
  // Use dynamic import to avoid type issues if types aren't present
  const { PDFExtract } = await import('pdf.js-extract');
  const extractor = new PDFExtract();

  return new Promise((resolve, reject) => {
    extractor.extract(filePath, {}, (err: any, data: any) => {
      if (err) return reject(err);

      const pages = data?.pages || [];
      let fullText = '';

      for (const page of pages) {
        const content = page?.content || [];
        for (const item of content) {
          if (item?.str) {
            fullText += String(item.str) + ' ';
          }
        }
        fullText += '\n';
      }

      resolve({ text: fullText.trim(), numPages: pages.length });
    });
  });
}

export async function POST(request: NextRequest): Promise<Response> {
  let tempFilePath: string | null = null;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Le fichier doit être un PDF' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    tempFilePath = join(tmpdir(), `pdf_${Date.now()}_${file.name}`);
    await writeFile(tempFilePath, buffer);

    // Parse PDF and extract text
    const { text, numPages } = await parsePdfWithPdfJsExtract(tempFilePath);

    return NextResponse.json({
      success: true,
      text,
      numPages,
      fileName: file.name,
      fileSize: file.size
    });
  } catch (err) {
    console.error('Erreur parsing PDF:', err);
    return NextResponse.json(
      {
        error: "Erreur lors de l'extraction du texte PDF",
        details: err instanceof Error ? err.message : String(err)
      },
      { status: 500 }
    );
  } finally {
    if (tempFilePath) {
      await unlink(tempFilePath).catch(() => {});
    }
  }
}
