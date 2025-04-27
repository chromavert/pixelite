import type { BrowserInput, PixelData, PixeliftOptions } from '../types';
import { PixeliftError } from '../utils/errors.ts';
import { isImageBitmapSource, isStringOrURL } from '../utils/validation.ts';

function createRenderingContext(
  bitmap: ImageBitmap,
  options: PixeliftOptions = {}
): OffscreenCanvasRenderingContext2D {
  const width = options.width ?? bitmap.width;
  const height = options.height ?? bitmap.height;

  if (width <= 0 || height <= 0) {
    throw PixeliftError.decodeFailed(
      `Invalid canvas dimensions (width: ${width}, height: ${height})`,
      {
        width,
        height,
        sourceWidth: bitmap.width,
        sourceHeight: bitmap.height
      }
    );
  }

  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext('2d', {
    alpha: true,
    colorSpace: 'srgb'
  });

  if (!context) {
    throw PixeliftError.decodeFailed('Failed to create canvas rendering context', {
      width,
      height
    });
  }

  context.imageSmoothingEnabled = false;
  context.imageSmoothingQuality = 'low';
  context.drawImage(bitmap, 0, 0, width, height);
  return context;
}

function getImageDataFromCanvas(context: OffscreenCanvasRenderingContext2D): ImageData {
  const { width, height } = context.canvas;
  return context.getImageData(0, 0, width, height, { colorSpace: 'srgb' });
}

function loadImageFromURL(sourceURL: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';

    image.onload = () => resolve(image);
    image.onerror = () => {
      reject(
        PixeliftError.fileReadFailed(
          `Failed to load image from URL`,
          { sourceURL },
          { cause: new Error('Check CORS configuration or URL validity') }
        )
      );
    };

    image.src = sourceURL;
  });
}

async function convertSVGToBitmap(svgBlob: Blob, sourceURL: string): Promise<ImageBitmap> {
  const objectURL = URL.createObjectURL(svgBlob);
  try {
    const image = await loadImageFromURL(objectURL);

    if (image.width <= 0 || image.height <= 0) {
      return Promise.reject(
        PixeliftError.decodeFailed(
          `Invalid SVG dimensions (width: ${image.width}, height: ${image.height})`,
          { sourceURL }
        )
      );
    }

    const canvas = new OffscreenCanvas(image.width, image.height);
    const context = canvas.getContext('2d');
    if (!context) {
      return Promise.reject(
        PixeliftError.decodeFailed('Failed to create 2D context for SVG processing', {
          sourceURL
        })
      );
    }

    context.imageSmoothingEnabled = false;
    context.imageSmoothingQuality = 'low';
    context.drawImage(image, 0, 0);
    return await createImageBitmap(canvas);
  } catch (error) {
    throw PixeliftError.decodeFailed(
      `Failed to process SVG image`,
      { sourceURL, mimeType: 'image/svg+xml' },
      { cause: error as Error }
    );
  } finally {
    URL.revokeObjectURL(objectURL);
  }
}

async function fetchAndDecodeImage(source: string | URL): Promise<ImageBitmap> {
  const sourceURL = source.toString();
  const response = await fetch(sourceURL);

  if (!response.ok) {
    throw PixeliftError.networkError(
      `Image fetch failed (HTTP ${response.status})`,
      { sourceURL, status: response.status },
      { cause: new Error(response.statusText) }
    );
  }

  const imageBlob = await response.blob();

  try {
    if (imageBlob.type === 'image/svg+xml' || sourceURL.endsWith('.svg')) {
      return convertSVGToBitmap(imageBlob, sourceURL);
    }

    return await createImageBitmap(imageBlob);
  } catch (error) {
    throw PixeliftError.decodeFailed(
      `Failed to decode ${imageBlob.type || 'unknown'} image`,
      { sourceURL, mimeType: imageBlob.type },
      { cause: error as Error }
    );
  }
}

async function fetchAndCreateImageBitmap(source: BrowserInput): Promise<ImageBitmap> {
  if (isStringOrURL(source)) {
    return fetchAndDecodeImage(source);
  }

  if (source instanceof File || source instanceof Blob || isImageBitmapSource(source)) {
    try {
      return await createImageBitmap(source);
    } catch (error) {
      const sourceType = Object.prototype.toString.call(source);
      throw PixeliftError.decodeFailed(
        `Failed to process image source`,
        { sourceType },
        { cause: error as Error }
      );
    }
  }

  const sourceType = Object.prototype.toString.call(source);
  throw PixeliftError.decodeFailed(
    `Unsupported image source type`,
    { sourceType },
    { cause: new TypeError(`Invalid image source type: ${sourceType}`) }
  );
}

export async function decode(
  imageSource: BrowserInput,
  options: PixeliftOptions = {}
): Promise<PixelData> {
  try {
    const imageBitmap = await fetchAndCreateImageBitmap(imageSource);
    const drawingContext = createRenderingContext(imageBitmap, options);
    const { data, width, height } = getImageDataFromCanvas(drawingContext);
    return { data, width, height, channels: 4 };
  } catch (error: unknown) {
    if (error instanceof PixeliftError) {
      throw error;
    }

    const sourceType = Object.prototype.toString.call(imageSource);
    const sourceDetails = isStringOrURL(imageSource) ? { source: imageSource.toString() } : {};

    throw PixeliftError.decodeFailed(
      `Image processing failed`,
      { ...sourceDetails, sourceType },
      { cause: error as Error }
    );
  }
}
