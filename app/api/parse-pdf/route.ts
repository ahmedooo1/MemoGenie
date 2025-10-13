import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import PDFParser from 'pdf2json'; // nécessite "npm install pdf2json"

function parsePdfWithPdf2json(filePath: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on('pdfParser_dataError', (errData: any) => {
      reject(new Error(errData?.parserError || 'Unknown pdf2json error'));
    });

    pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
      resolve(pdfData);
    });

    pdfParser.loadPDF(filePath);
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

    // Parse PDF
    const pdfData = await parsePdfWithPdf2json(tempFilePath);

    // Extraire le texte
    let fullText = '';
    let numPages = 0;

    if (pdfData?.Pages) {
      numPages = pdfData.Pages.length;
      for (const page of pdfData.Pages) {
        if (page.Texts) {
          for (const textItem of page.Texts) {
            if (textItem.R) {
              for (const run of textItem.R) {
                if (run.T) {
                  fullText += decodeURIComponent(run.T) + ' ';
                }
              }
            }
          }
          fullText += '\n';
        }
      }
    }

    return NextResponse.json({
      success: true,
      text: fullText.trim(),
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
