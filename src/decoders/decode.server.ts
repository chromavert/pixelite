import type { PixelData, ServerImageSource } from '../types';
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

export async function decode(input: ServerImageSource): Promise<PixelData> {
  const buffer = await getBuffer(input);
  const sharpModule = await getSharp();
  const sharp = sharpModule.default;
  const image = sharp(buffer).ensureAlpha().raw();
  const { data, info } = await image.toBuffer({ resolveWithObject: true });

  return {
    data: new Uint8Array(data.buffer, data.byteOffset, data.byteLength),
    width: info.width,
    height: info.height,
    channels: info.channels,
  };
}
