const fs = require('fs');
const path = require('path');

const ceedNodeModules = 'C:\\Users\\Admin\\.gemini\\antigravity\\scratch\\ceed_prep\\node_modules';
const { createCanvas } = require(path.join(ceedNodeModules, '@napi-rs', 'canvas'));
const pdfjsLib = require(path.join(ceedNodeModules, 'pdfjs-dist', 'legacy', 'build', 'pdf.js'));

async function renderPdf() {
  const pdfPath = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\14573b16-5c25-4676-b42d-2e66fe11131f\\.user_uploaded\\media_1791040955992.pdf';
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  console.log('Pages:', doc.numPages);
  
  const page = await doc.getPage(1);
  const viewport = page.getViewport({ scale: 2.5 });
  
  const canvas = createCanvas(viewport.width, viewport.height);
  const ctx = canvas.getContext('2d');
  
  await page.render({
    canvasContext: ctx,
    viewport: viewport
  }).promise;
  
  const outDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\scratch\\yashraj_portfolio\\public';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  
  const outPath = path.join(outDir, 'yashraj_raw_logo.png');
  fs.writeFileSync(outPath, canvas.toBuffer('image/png'));
  console.log('Saved raw logo to:', outPath, 'Dimensions:', viewport.width, 'x', viewport.height);
}

renderPdf().catch(console.error);
