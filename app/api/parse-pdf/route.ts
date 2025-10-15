import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import pdf from 'pdf-parse';

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

    // Parse PDF with pdf-parse
    const data = await pdf(buffer);
    const text = data?.text ?? '';
    const numPages = Number(data?.numpages ?? 0);

    return NextResponse.json({
      success: true,
      text: text.trim(),
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
