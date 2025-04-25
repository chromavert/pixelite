import fs from 'node:fs/promises';
import type { ServerImageSource } from './types.ts';
import {
  PixeliteDecodeError,
  PixeliteFileReadError,
  PixeliteNetworkError,
  PixeliteSourceTypeError,
} from './errors.ts';

export async function getBuffer(input: ServerImageSource): Promise<Buffer> {
  // Already a Buffer
  if (Buffer.isBuffer(input)) {
    return input;
  }

  // String: file path or URL
  if (typeof input === 'string') {
    try {
      if (/^https?:\/\//i.test(input)) {
        // Remote URL
        const res = await fetch(input);
        const ab = await res.arrayBuffer();
        return Buffer.from(ab);
      } else {
        // Local filesystem path
        return await fs.readFile(input);
      }
    } catch (err) {
      // Distinguish network vs. file errors
      if (/^https?:\/\//i.test(input)) {
        throw new PixeliteNetworkError(
          `Failed to fetch URL: ${input}`,
          { url: input },
          { cause: err as Error },
        );
      } else {
        throw new PixeliteFileReadError(
          `Failed to read file: ${input}`,
          { path: input },
          { cause: err as Error },
        );
      }
    }
  }

  // ArrayBuffer
  if (input instanceof ArrayBuffer) {
    try {
      return Buffer.from(input);
    } catch (err) {
      throw new PixeliteDecodeError(
        'ArrayBuffer → Buffer conversion failed',
        { byteLength: input.byteLength },
        { cause: err as Error },
      );
    }
  }

  // Any typed‐array view
  if (ArrayBuffer.isView(input)) {
    const view = input as ArrayBufferView;
    try {
      return Buffer.from(view.buffer, view.byteOffset, view.byteLength);
    } catch (err) {
      throw new PixeliteDecodeError(
        'TypedArray → Buffer conversion failed',
        { constructor: input.constructor.name, byteLength: view.byteLength },
        { cause: err as Error },
      );
    }
  }

  // Unsupported type
  throw new PixeliteSourceTypeError(
    `Unsupported image source type: ${(input as any)?.constructor?.name || typeof input}`,
    { receivedType: typeof input },
  );
}
