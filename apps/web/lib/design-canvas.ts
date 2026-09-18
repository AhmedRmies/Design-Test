import type { Layer } from './store';

export const PRINT_CANVAS_SIZE = 1024;

/**
 * Renders the layer stack of one print area onto a canvas.
 * The same function drives the live 3D texture and the exported print file —
 * that is why the editor preview and the final artwork can never drift apart.
 */
export async function renderPrintArea(
  layers: Layer[],
  size = PRINT_CANVAS_SIZE,
  background: string | null = null,
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, size, size);
  } else {
    ctx.clearRect(0, 0, size, size);
  }

  for (const layer of layers) {
    ctx.save();
    const scale = size / PRINT_CANVAS_SIZE;

    if (layer.type === 'image') {
      const img = await loadImage(layer.src);
      const cx = (layer.x + layer.width / 2) * scale;
      const cy = (layer.y + layer.height / 2) * scale;
      ctx.translate(cx, cy);
      ctx.rotate((layer.rotation * Math.PI) / 180);
      ctx.globalAlpha = layer.opacity;
      ctx.drawImage(
        img,
        (-layer.width / 2) * scale,
        (-layer.height / 2) * scale,
        layer.width * scale,
        layer.height * scale,
      );
    } else {
      ctx.translate(layer.x * scale, layer.y * scale);
      ctx.rotate((layer.rotation * Math.PI) / 180);
      ctx.fillStyle = layer.fill;
      ctx.font = `bold ${layer.fontSize * scale}px ${layer.fontFamily}, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(layer.text, 0, 0);
    }

    ctx.restore();
  }

  return canvas;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

/** Exports a print-ready PNG at the requested DPI for the given physical size. */
export async function exportPrintFile(layers: Layer[], widthMm: number, dpi = 300) {
  const pixels = Math.round((widthMm / 25.4) * dpi);
  const canvas = await renderPrintArea(layers, pixels);
  return canvas.toDataURL('image/png');
}
