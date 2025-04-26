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
          `\nOriginal error: ${(err as Error).message}`,
      );
    }
  }
  return sharpPromise;
}

export async function decode(
  input: ServerInput,
  options: PixeliteOptions = {},
): Promise<PixelData> {
  const buffer = await getBuffer(input);
  const sharpModule = await getSharp();

  let pipeline = sharpModule
    .default(buffer)
    .pipelineColorspace('srgb')
    .ensureAlpha()
    .unflatten();

  if (options.width || options.height) {
    pipeline = pipeline.resize(options.width ?? null, options.height ?? null, {
      fit: 'fill',
      kernel: 'nearest',
    });
  }

  const image = pipeline.raw({ resolveWithObject: true, channels: 4 });
  const { data, info } = await image.toBuffer({ resolveWithObject: true });

  return {
    data: new Uint8Array(data.buffer, data.byteOffset, data.byteLength),
    width: info.width,
    height: info.height,
    channels: info.channels,
  };
}
