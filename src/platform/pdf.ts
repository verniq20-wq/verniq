/**
 * Export a rendered element (worksheet, flashcards) to a real PDF file.
 * The page is rendered by the browser first, so Devanagari and tribal-language
 * text keep correct shaping. On Android the PDF opens the share sheet.
 */
import { isNative } from '.';
import { download } from '../utils';

export async function exportElementToPdf(el: HTMLElement, filename: string, opts: { title?: string } = {}) {
  const [{ toPng }, { jsPDF }] = await Promise.all([import('html-to-image'), import('jspdf')]);
  const dataUrl = await toPng(el, { pixelRatio: 2, backgroundColor: '#ffffff', cacheBust: true });
  const img = await loadImage(dataUrl);

  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });
  pdf.setProperties({ title: opts.title ?? filename, creator: 'Verniq' });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const w = pageW - margin * 2;
  const h = (img.height * w) / img.width;
  const usable = pageH - margin * 2;

  if (h <= usable) {
    pdf.addImage(dataUrl, 'PNG', margin, margin, w, h);
  } else {
    // Slice the tall image into page-sized pieces
    const sliceHeightPx = Math.floor((usable / h) * img.height);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = img.width;
    for (let y = 0, page = 0; y < img.height; y += sliceHeightPx, page++) {
      const hPx = Math.min(sliceHeightPx, img.height - y);
      canvas.height = hPx;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, y, img.width, hPx, 0, 0, img.width, hPx);
      if (page > 0) pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', margin, margin, w, (hPx * w) / img.width);
    }
  }

  const safeName = filename.replace(/[^\p{L}\p{N}\-_ ]+/gu, '').trim().replace(/\s+/g, '-') || 'verniq';
  const file = `${safeName}.pdf`;

  if (isNative) {
    const [{ Filesystem, Directory }, { Share }] = await Promise.all([import('@capacitor/filesystem'), import('@capacitor/share')]);
    const base64 = pdf.output('datauristring').split(',')[1];
    const written = await Filesystem.writeFile({ path: file, data: base64, directory: Directory.Cache });
    await Share.share({ title: opts.title ?? file, url: written.uri, dialogTitle: 'Save or send the PDF' });
    return;
  }
  download(pdf.output('blob'), file);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not render the page'));
    img.src = src;
  });
}
