PDF export notes

- Purpose: For Arabic/RTL exports, we rasterize the editor DOM using `html2canvas` and assemble pages into a PDF using `jsPDF` to preserve text shaping and ligatures.

- Client-side dependency: html2canvas
  - Install with:

```bash
npm install html2canvas --save
```

- Notes:
  - The code performs a dynamic import of `html2canvas` at runtime. If the package isn't installed the code falls back to generating a printable HTML which you can open in the browser and "Print → Save as PDF".
  - For best PDF fidelity (fonts), consider bundling Noto Arabic fonts or using a server-side renderer (puppeteer) to print the HTML to PDF server-side.

- Next improvements:
  - Embed Noto Arabic font into the HTML or include it in the static assets.
  - Add server-side conversion endpoint using puppeteer for automatic PDF generation.
