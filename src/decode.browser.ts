import type { BrowserImageSource, PixelData } from './types.ts';
import {
  PixeliteDecodeError,
  PixeliteError,
  PixeliteSourceTypeError,
} from './errors.ts';
import { isImageBitmapSource, isStringOrURL } from './utils.ts';

function bitmapToCanvasContext(
  bitmap: ImageBitmap,
): OffscreenCanvasRenderingContext2D {
  const offscreen = new OffscreenCanvas(bitmap.width, bitmap.height);
  offscreen.width = bitmap.width;
  offscreen.height = bitmap.height;
  const ctx = offscreen.getContext('2d');
  if (!ctx)
    throw new PixeliteDecodeError(
      'Failed to get 2D context from OffscreenCanvas',
    );
  ctx.drawImage(bitmap, 0, 0);
  return ctx;
}

function extractPixelData(ctx: OffscreenCanvasRenderingContext2D): PixelData {
  const { width, height } = ctx.canvas;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = new Uint8Array(
    imgData.data.buffer,
    imgData.data.byteOffset,
    imgData.data.byteLength,
  );
  return { data, width, height, channels: 4 };
}

async function loadImageFromSource(src: string | URL): Promise<ImageBitmap> {
  const url = src.toString();
  const res = await fetch(url);
  if (!res.ok) {
    throw new PixeliteDecodeError(
      `Failed to fetch ${url}`,
      { url },
      { cause: new Error(res.statusText) },
    );
  }
  const blob = await res.blob();
  return await createImageBitmap(blob);
}

async function getImageBitmap(
  src: string | URL | File | Blob | ImageBitmapSource,
): Promise<ImageBitmap> {
  if (isStringOrURL(src)) {
    return loadImageFromSource(src);
  }
  if (src instanceof File || src instanceof Blob) {
    return await createImageBitmap(src);
  }
  if (isImageBitmapSource(src)) {
    return await createImageBitmap(src);
  }
  throw new PixeliteSourceTypeError(
    `Unsupported browser decode() input: ${Object.prototype.toString.call(src)}`,
  );
}

export async function decode(input: BrowserImageSource): Promise<PixelData> {
  try {
    const bitmap = await getImageBitmap(input);
    const ctx = bitmapToCanvasContext(bitmap);
    return extractPixelData(ctx);
  } catch (err) {
    if (err instanceof PixeliteError) throw err;
    throw new PixeliteDecodeError(
      'Failed to decode image',
      { input: Object.prototype.toString.call(input) },
      { cause: err as Error },
    );
  }
}
