import type { BrowserInput, PixelData, PixeliteOptions } from '../types';
import {
  PixeliteDecodeError,
  PixeliteError,
  PixeliteSourceTypeError,
} from '../utils/errors.ts';
import { isImageBitmapSource, isStringOrURL } from '../utils/validation.ts';

function createCanvasContextFromBitmap(
  bitmap: ImageBitmap,
  options: PixeliteOptions = {},
): OffscreenCanvasRenderingContext2D {
  const width = options.width ?? bitmap.width;
  const height = options.height ?? bitmap.height;

  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext('2d');

  if (!context) {
    throw new PixeliteDecodeError('Failed to create 2D rendering context');
  }

  context.imageSmoothingEnabled = false;
  context.drawImage(bitmap, 0, 0, width, height);
  return context;
}

function extractPixelDataFromContext(
  context: OffscreenCanvasRenderingContext2D,
): PixelData {
  const { width, height } = context.canvas;
  const imageData = context.getImageData(0, 0, width, height);

  const pixelBuffer = new Uint8Array(
    imageData.data.buffer,
    imageData.data.byteOffset,
    imageData.data.byteLength,
  );

  return {
    data: pixelBuffer,
    width,
    height,
    channels: 4,
  };
}

function loadImageFromURL(sourceURL: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => {
      reject(
        new PixeliteDecodeError(`Failed to load image from URL: ${sourceURL}`),
      );
    };

    image.src = sourceURL;
  });
}

async function convertSVGToBitmap(
  svgBlob: Blob,
  sourceURL: string,
): Promise<ImageBitmap> {
  const objectURL = URL.createObjectURL(svgBlob);

  try {
    const image = await loadImageFromURL(objectURL);
    const canvas = new OffscreenCanvas(image.width, image.height);
    const context = canvas.getContext('2d')!;
    context.imageSmoothingEnabled = false;
    context.drawImage(image, 0, 0);
    return await createImageBitmap(canvas);
  } catch (error) {
    throw new PixeliteDecodeError(
      `Failed to process SVG image from ${sourceURL}`,
      { sourceURL },
      { cause: error as Error },
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
      `Image fetch failed: ${response.statusText}`,
      { sourceURL },
      { cause: new Error(`HTTP ${response.status}`) },
    );
  }

  const imageBlob = await response.blob();

  if (imageBlob.type === 'image/svg+xml' || sourceURL.endsWith('.svg')) {
    return convertSVGToBitmap(imageBlob, sourceURL);
  }

  try {
    return await createImageBitmap(imageBlob);
  } catch (error) {
    throw new PixeliteDecodeError(
      `Image decoding failed for ${sourceURL}`,
      { sourceURL },
      { cause: error as Error },
    );
  }
}

async function normalizeImageSource(
  source: BrowserInput,
): Promise<ImageBitmap> {
  if (isStringOrURL(source)) {
    return fetchAndDecodeImage(source);
  }

  if (
    source instanceof File ||
    source instanceof Blob ||
    isImageBitmapSource(source)
  ) {
    return createImageBitmap(source);
  }

  throw new PixeliteSourceTypeError(
    `Unsupported image source type: ${Object.prototype.toString.call(source)}`,
  );
}

/**
 * Main decoder function - converts browser-supported image formats to raw pixel data
 */
export async function decode(
  imageSource: BrowserInput,
  options: PixeliteOptions = {},
): Promise<PixelData> {
  try {
    const imageBitmap = await normalizeImageSource(imageSource);
    const drawingContext = createCanvasContextFromBitmap(imageBitmap, options);
    return extractPixelDataFromContext(drawingContext);
  } catch (error) {
    if (error instanceof PixeliteError) {
      throw error;
    }
    throw new PixeliteDecodeError(
      `Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      {
        sourceType: typeof imageSource,
        sourceValue:
          imageSource instanceof URL
            ? imageSource.toString()
            : String(imageSource),
      },
      { cause: error as Error },
    );
  } finally {
  }
}
