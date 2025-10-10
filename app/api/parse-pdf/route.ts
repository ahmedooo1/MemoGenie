import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

export async function POST(request: NextRequest) {
  let tempFilePath: string | null = null;
  
  try {
    // Récupérer le fichier PDF depuis FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    // Vérifier que c'est un PDF
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Le fichier doit être un PDF' },
        { status: 400 }
      );
    }

    // Convertir le fichier en Buffer et sauvegarder temporairement
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Créer un fichier temporaire
    tempFilePath = join(tmpdir(), `pdf_${Date.now()}_${file.name}`);
    await writeFile(tempFilePath, buffer);

    // Utiliser pdf2json pour extraire le texte
    const PDFParser = require('pdf2json');
    const pdfParser = new PDFParser();

    return new Promise((resolve) => {
      pdfParser.on('pdfParser_dataError', (errData: any) => {
        console.error('Erreur PDF parsing:', errData.parserError);
        resolve(NextResponse.json(
          { 
            error: 'Erreur lors de l\'extraction du texte PDF',
            details: errData.parserError
          },
          { status: 500 }
        ));
      });

      pdfParser.on('pdfParser_dataReady', async (pdfData: any) => {
        try {
          // Extraire le texte de toutes les pages
          let fullText = '';
          let numPages = 0;
          
          if (pdfData.Pages) {
            numPages = pdfData.Pages.length;
            
            for (const page of pdfData.Pages) {
              if (page.Texts) {
                for (const textItem of page.Texts) {
                  if (textItem.R) {
                    for (const run of textItem.R) {
                      if (run.T) {
                        // Décoder l'URI et ajouter le texte
                        fullText += decodeURIComponent(run.T) + ' ';
                      }
                    }
                  }
                }
                fullText += '\n'; // Nouvelle ligne entre les sections
              }
            }
          }

          // Nettoyer le fichier temporaire
          if (tempFilePath) {
            await unlink(tempFilePath).catch(() => {});
          }

          resolve(NextResponse.json({
            success: true,
            text: fullText.trim(),
            numPages: numPages,
            fileName: file.name,
            fileSize: file.size
          }));
        } catch (error) {
          console.error('Erreur traitement données PDF:', error);
          resolve(NextResponse.json(
            { 
              error: 'Erreur lors du traitement des données PDF',
              details: error instanceof Error ? error.message : 'Erreur inconnue'
            },
            { status: 500 }
          ));
        }
      });

      // Lancer le parsing
      pdfParser.loadPDF(tempFilePath);
    });

  } catch (error) {
    // Nettoyer le fichier temporaire en cas d'erreur
    if (tempFilePath) {
      await unlink(tempFilePath).catch(() => {});
    }
    
    console.error('Erreur lors du parsing du PDF:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de l\'extraction du texte PDF',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
