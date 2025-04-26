/**
 * Converts 32-bit ARGB integers to RGBA bytes.
 *
 * @param pixels - ARGB colors (0xAARRGGBB)
 * @returns RGBA pixels as bytes [R, G, B, A]
 * @example
 * packPixels([0xFFFF0000]) // Uint8ClampedArray [255, 0, 0, 255]
 */
export function packPixels(pixels: readonly number[]): Uint8Array {
  const length = pixels.length;
  const output = new Uint8Array(length * 4);
  for (let i = 0, o = 0; i < length; i++, o += 4) {
    const px = pixels[i]! >>> 0; // ensure u32
    output[o] = (px >>> 16) & 0xff;
    output[o + 1] = (px >>> 8) & 0xff;
    output[o + 2] = px & 0xff;
    output[o + 3] = (px >>> 24) & 0xff;
  }
  return output;
}

/**
 * Converts a pixel buffer (RGB or RGBA) to 32-bit ARGB integers.
 * Automatically detects format but can accept explicit pixelSize.
 * RGB pixels become fully opaque (alpha = 0xFF).
 *
 * @param buffer - Input pixel data (ArrayBuffer or TypedArray)
 * @param channels - Optional override: 3 (RGB) or 4 (RGBA)
 * @returns Array of ARGB colors as 32-bit integers (0xAARRGGBB)
 * @throws If buffer length isn't divisible by pixelSize or format is ambiguous
 * @example
 * unpackPixels(new Uint8Array([255, 0, 0])); // [0xFFFF0000] (opaque red)
 */
export function unpackPixels(
  buffer: ArrayBuffer | ArrayBufferView | Buffer | Uint8Array | Uint8ClampedArray,
  channels: 3 | 4 = 4,
): number[] {
  const bytes =
    buffer instanceof ArrayBuffer
      ? new Uint8Array(buffer)
      : new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);

  const len = bytes.length;

  const size =
    channels ??
    (len % 4 === 0 && len % 3 !== 0
      ? 4
      : len % 3 === 0 && len % 4 !== 0
        ? 3
        : (() => {
            throw new Error(`Ambiguous buffer length ${len}`);
          })());

  if (len % size !== 0) {
    throw new Error(`Invalid buffer length ${len}: not a multiple of ${size}`);
  }

  const count = len / size;
  const result: number[] = new Array(count);

  for (let i = 0, j = 0; i < count; i++, j += size) {
    const r = bytes[j]! & 0xff;
    const g = bytes[j + 1]! & 0xff;
    const b = bytes[j + 2]! & 0xff;
    const a = size === 4 ? bytes[j + 3]! & 0xff : 0xff;
    result[i] = (a << 24) | (r << 16) | (g << 8) | b;
  }

  return result;
}
