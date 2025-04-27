import type { BrowserInput, PixelData, PixeliteOptions } from '../types';
import { PixeliteDecodeError, PixeliteSourceTypeError } from '../utils/errors.ts';
import { isImageBitmapSource, isStringOrURL } from '../utils/validation.ts';

function createCanvasContextFromBitmap(
  bitmap: ImageBitmap,
  options: PixeliteOptions = {}
): OffscreenCanvasRenderingContext2D {
  const width = options.width ?? bitmap.width;
  const height = options.height ?? bitmap.height;

  if (width <= 0 || height <= 0) {
    throw new PixeliteDecodeError(
      `Invalid canvas dimensions (width: ${width}, height: ${height})`,
      { width, height, sourceWidth: bitmap.width, sourceHeight: bitmap.height }
    );
  }

  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext('2d', {
    alpha: true,
    colorSpace: 'srgb'
  });

  if (!context) {
    throw new PixeliteDecodeError('Failed to create canvas rendering context', {
      width,
      height
    });
  }

  context.imageSmoothingEnabled = false;
  context.imageSmoothingQuality = 'low';
  context.drawImage(bitmap, 0, 0, width, height);
  return context;
}

function extractPixelDataFromContext(context: OffscreenCanvasRenderingContext2D): ImageData {
  const { width, height } = context.canvas;
  return context.getImageData(0, 0, width, height, {
    colorSpace: 'srgb'
  });
}

function loadImageFromURL(sourceURL: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';

    image.onload = () => resolve(image);
    image.onerror = () => {
      reject(
        new PixeliteDecodeError(
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
        new PixeliteDecodeError(
          `Invalid SVG dimensions (width: ${image.width}, height: ${image.height})`,
          { sourceURL }
        )
      );
    }

    const canvas = new OffscreenCanvas(image.width, image.height);
    const context = canvas.getContext('2d');
    if (!context) {
      return Promise.reject(
        new PixeliteDecodeError('Failed to create 2D context for SVG processing', {
          sourceURL
        })
      );
    }

    context.imageSmoothingEnabled = false;
    context.imageSmoothingQuality = 'low';
    context.drawImage(image, 0, 0);
    return await createImageBitmap(canvas);
  } catch (error) {
    throw new PixeliteDecodeError(
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
    throw new PixeliteDecodeError(
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
    throw new PixeliteDecodeError(
      `Failed to decode ${imageBlob.type || 'unknown'} image`,
      { sourceURL, mimeType: imageBlob.type },
      { cause: error as Error }
    );
  }
}

async function normalizeImageSource(source: BrowserInput): Promise<ImageBitmap> {
  if (isStringOrURL(source)) {
    return fetchAndDecodeImage(source);
  }

  if (source instanceof File || source instanceof Blob || isImageBitmapSource(source)) {
    try {
      return await createImageBitmap(source);
    } catch (error) {
      const sourceType = Object.prototype.toString.call(source);
      throw new PixeliteDecodeError(
        `Failed to process image source`,
        { sourceType },
        { cause: error as Error }
      );
    }
  }

  const sourceType = Object.prototype.toString.call(source);
  throw new PixeliteSourceTypeError(`Unsupported image source type: ${sourceType}`, {
    sourceType
  });
}

export async function decode(
  imageSource: BrowserInput,
  options: PixeliteOptions = {}
): Promise<PixelData> {
  try {
    const imageBitmap = await normalizeImageSource(imageSource);
    const drawingContext = createCanvasContextFromBitmap(imageBitmap, options);
    const { data, width, height } = extractPixelDataFromContext(drawingContext);
    return { data, width, height, channels: 4 };
  } catch (error: unknown) {
    if (error instanceof PixeliteDecodeError) {
      throw error;
    }

    const sourceType = Object.prototype.toString.call(imageSource);
    const sourceDetails = isStringOrURL(imageSource) ? { source: imageSource.toString() } : {};

    throw new PixeliteDecodeError(
      `Image processing failed`,
      { ...sourceDetails, sourceType },
      { cause: error as Error }
    );
  }
}
