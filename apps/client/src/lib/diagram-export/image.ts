import { toPng, toSvg } from 'html-to-image';
import { jsPDF } from 'jspdf';

const EXPORT_PIXEL_RATIO = 2;

function exportBackground(): string {
  const value: string = getComputedStyle(document.documentElement).getPropertyValue('--background').trim();
  return value.length > 0 ? value : '#ffffff';
}

/** Bir elemanı PNG veri adresine çevirir. */
export async function diagramToPngDataUrl(element: HTMLElement): Promise<string> {
  return toPng(element, {
    backgroundColor: exportBackground(),
    pixelRatio: EXPORT_PIXEL_RATIO,
    cacheBust: true,
  });
}

/** Bir elemanı SVG metnine çevirir. */
export async function diagramToSvgString(element: HTMLElement): Promise<string> {
  const dataUrl: string = await toSvg(element, {
    backgroundColor: exportBackground(),
    cacheBust: true,
  });
  const comma: number = dataUrl.indexOf(',');
  const payload: string = dataUrl.slice(comma + 1);
  // toSvg veri adresini base64 ya da URL kodlu döndürebilir.
  return dataUrl.slice(0, comma).includes('base64')
    ? atob(payload)
    : decodeURIComponent(payload);
}

/** PNG görüntüsünü tek sayfalık bir PDF'e yerleştirir. */
export async function diagramToPdfBlob(element: HTMLElement): Promise<Blob> {
  const png: string = await diagramToPngDataUrl(element);
  const image = await loadImage(png);
  const orientation = image.width >= image.height ? 'landscape' : 'portrait';
  const pdf = new jsPDF({ orientation, unit: 'px', format: [image.width, image.height] });
  pdf.addImage(png, 'PNG', 0, 0, image.width, image.height);
  return pdf.output('blob');
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Görsel yüklenemedi'));
    img.src = src;
  });
}

/** Dosyayı indirir. */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url: string = URL.createObjectURL(blob);
  const anchor: HTMLAnchorElement = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
