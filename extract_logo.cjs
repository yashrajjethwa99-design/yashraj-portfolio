const fs = require('fs');
const path = require('path');

const ceedNodeModules = 'C:\\Users\\Admin\\.gemini\\antigravity\\scratch\\ceed_prep\\node_modules';
const { createCanvas, loadImage } = require(path.join(ceedNodeModules, '@napi-rs', 'canvas'));
const pdfjsLib = require(path.join(ceedNodeModules, 'pdfjs-dist', 'legacy', 'build', 'pdf.js'));

async function renderPdf() {
  const pdfPath = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\14573b16-5c25-4676-b42d-2e66fe11131f\\.user_uploaded\\media_1791040955992.pdf';
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  console.log('Pages:', doc.numPages);
  
  const page = await doc.getPage(1);
  const viewport = page.getViewport({ scale: 3.0 }); // 3x high res
  
  const canvas = createCanvas(viewport.width, viewport.height);
  const ctx = canvas.getContext('2d');
  
  await page.render({
    canvasContext: ctx,
    viewport: viewport
  }).promise;
  
  const outDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\scratch\\yashraj_portfolio\\public';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  
  // 1. Save raw render
  const rawPath = path.join(outDir, 'yashraj_raw_logo.png');
  fs.writeFileSync(rawPath, canvas.toBuffer('image/png'));
  console.log('Saved raw logo:', rawPath, viewport.width, 'x', viewport.height);

  // 2. Make transparent background version:
  // Detect background white pixels and make transparent, plus crop to bounding box of non-white pixels
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data: pixels, width, height } = imgData;

  let minX = width, minY = height, maxX = 0, maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = pixels[idx];
      const g = pixels[idx + 1];
      const b = pixels[idx + 2];

      // If almost pure white, turn alpha to 0
      if (r > 240 && g > 240 && b > 240) {
        pixels[idx + 3] = 0;
      } else {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  // Put image data back
  ctx.putImageData(imgData, 0, 0);

  // Crop to bounding box with small padding
  const pad = 20;
  const cropX = Math.max(0, minX - pad);
  const cropY = Math.max(0, minY - pad);
  const cropW = Math.min(width - cropX, (maxX - minX) + pad * 2);
  const cropH = Math.min(height - cropY, (maxY - minY) + pad * 2);

  const croppedCanvas = createCanvas(cropW, cropH);
  const croppedCtx = croppedCanvas.getContext('2d');
  croppedCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

  const transPath = path.join(outDir, 'yashraj_logo_transparent.png');
  fs.writeFileSync(transPath, croppedCanvas.toBuffer('image/png'));
  console.log('Saved transparent cropped logo to:', transPath, cropW, 'x', cropH);
}

renderPdf().catch(console.error);
