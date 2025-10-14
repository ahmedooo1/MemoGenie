declare module 'pdf.js-extract' {
  export class PDFExtract {
    extract(
      filePath: string,
      options: Record<string, any>,
      callback: (err: any, data: any) => void
    ): void;
  }
}
