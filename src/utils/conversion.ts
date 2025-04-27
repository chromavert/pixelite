import type { BufferInput } from '../types';

/**
 * Converts 32-bit ARGB integers to a clamped RGBA byte buffer.
 *
 * @param pixels  Array-like of 0xAARRGGBB words
 * @returns       Uint8ClampedArray of [R, G, B, A, …]
 */
export function packPixels(pixels: ArrayLike<number>): Uint8ClampedArray {
  const count = pixels.length;
  const out = new Uint8ClampedArray(count * 4);

  for (let i = 0, j = 0; i < count; i++, j += 4) {
    const argb = pixels[i]! >>> 0;
    out[j] = (argb >>> 16) & 0xff;
    out[j + 1] = (argb >>> 8) & 0xff;
    out[j + 2] = argb & 0xff;
    out[j + 3] = (argb >>> 24) & 0xff;
  }

  return out;
}

/**
 * Converts an RGB(A) byte buffer into 32-bit ARGB integers.
 *
 * @param buffer    ArrayBuffer or TypedArray of raw bytes
 * @param options
 * @returns         Uint32Array of 0xAARRGGBB words when useTArray is true, or number[] when false
 * @template T      Whether to return a TypedArray (true) or number array (false)
 */
export function unpackPixels<T extends boolean = false>(
  buffer: BufferInput,
  options: {
    bytesPerPixel?: 3 | 4;
    useTArray?: T;
  } = {}
): T extends false ? number[] : Uint32Array {
  let { bytesPerPixel, useTArray = false as T } = options;

  const bytes =
    buffer instanceof ArrayBuffer
      ? new Uint8Array(buffer)
      : new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);

  const len = bytes.length;

  // Enforce or detect channel count
  if (bytesPerPixel) {
    if (len % bytesPerPixel !== 0) {
      throw new Error(`Invalid length ${len}: not a multiple of ${bytesPerPixel}`);
    }
  } else {
    const div3 = len % 3 === 0;
    const div4 = len % 4 === 0;
    // Prefer RGBA when both divide evenly
    if (div4) bytesPerPixel = 4;
    else if (div3) bytesPerPixel = 3;
    else throw new Error(`Invalid buffer length ${len}: must be multiple of 3 or 4`);
  }

  const count = len / bytesPerPixel;
  const result = new Uint32Array(count);

  for (let i = 0, j = 0; i < count; i++, j += bytesPerPixel) {
    const r = bytes[j]! & 0xff;
    const g = bytes[j + 1]! & 0xff;
    const b = bytes[j + 2]! & 0xff;
    const a = bytesPerPixel === 4 ? bytes[j + 3]! & 0xff : 0xff;
    // Build ARGB word, force to unsigned
    result[i] = ((a << 24) | (r << 16) | (g << 8) | b) >>> 0;
  }

  // Return a TypedArray or number array based on the useTArray flag
  return (useTArray ? result : Array.from(result)) as T extends false ? number[] : Uint32Array;
}
