import type { PixelData, PixeliteOptions, ServerInput } from '../types';
import { getBuffer } from '../utils/buffer.ts';
import { PixeliteDecodeError } from '../utils/errors.ts';

let sharpPromise: Promise<typeof import('sharp')> | null = null;

async function getSharp() {
  if (!sharpPromise) {
    try {
      sharpPromise = import('sharp') as Promise<typeof import('sharp')>;
    } catch (err) {
      throw new Error(
        'The "sharp" dependency is required for server-side image processing. ' +
          'To enable this feature on the server, please install it with:\n' +
          '`npm install sharp`\n' +
          'If server-side image processing is not needed, you can opt out of this feature.\n' +
          `\nOriginal error: ${(err as Error).message}`
      );
    }
  }
  return sharpPromise;
}

export async function decode(
  input: ServerInput,
  options: PixeliteOptions = {}
): Promise<PixelData> {
  try {
    const buffer = await getBuffer(input);
    const sharpModule = await getSharp();
    let pipeline = sharpModule.default(buffer).toColorspace('srgb').ensureAlpha();

    if (options.width || options.height) {
      pipeline = pipeline.resize(options.width ?? null, options.height ?? null, {
        fit: 'fill',
        kernel: 'nearest',
        fastShrinkOnLoad: true
      });
    }

    // Explicit 8-bit RGBA raw output
    const { data, info } = await pipeline
      .raw({ depth: 'uchar', channels: 4 })
      .toBuffer({ resolveWithObject: true });

    // Match the browser's Uint8ClampedArray behavior
    const clamped = new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength);

    return {
      data: clamped,
      width: info.width,
      height: info.height,
      channels: info.channels
    };
  } catch (err) {
    throw new PixeliteDecodeError(
      `Server error: failed to process image.`,
      { inputType: typeof input },
      { cause: err as Error }
    );
  }
}
