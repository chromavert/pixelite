import type { PixelData, PixeliteOptions, ServerInput } from '../types';
import { getBuffer } from '../utils/get-buffer.ts';

let sharpPromise: Promise<typeof import('sharp')> | null = null;

async function getSharp() {
  if (!sharpPromise) {
    try {
      sharpPromise = import('sharp') as Promise<typeof import('sharp')>;
    } catch (err) {
      throw new Error(
        'Optional dependency "sharp" is not installed. ' +
          'Install it with `npm install sharp` or disable image decoding. ' +
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

  // Canvas ImageData uses Uint8ClampedArray
  const clamped = new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength);

  return {
    data: clamped,
    width: info.width,
    height: info.height,
    channels: info.channels
  };
}
