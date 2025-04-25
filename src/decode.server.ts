import type { PixelData, ServerImageSource } from './types.ts';
import { getBuffer } from './get-buffer.ts';

export async function decode(input: ServerImageSource): Promise<PixelData> {
  const buffer = await getBuffer(input);
  const sharp = await import('sharp');
  const image = sharp.default(buffer).ensureAlpha().raw();
  const { data, info } = await image.toBuffer({ resolveWithObject: true });
  return {
    data: new Uint8Array(data.buffer, data.byteOffset, data.byteLength),
    width: info.width,
    height: info.height,
    channels: info.channels,
  };
}
