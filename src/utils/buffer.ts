import fs from 'node:fs/promises';
import type { ServerInput } from '../types';
import { PixeliftError } from './errors.ts';

export async function getBuffer(input: ServerInput): Promise<Buffer> {
  if (Buffer.isBuffer(input)) {
    return input;
  }

  if (typeof input === 'string') {
    try {
      if (/^https?:\/\//i.test(input)) {
        // Remote URL
        const res = await fetch(input, { mode: 'cors' });
        const ab = await res.arrayBuffer();
        return Buffer.from(ab);
      } else {
        // Local file
        return await fs.readFile(input);
      }
    } catch (err: unknown) {
      if (/^https?:\/\//i.test(input)) {
        throw PixeliftError.networkError(
          `Failed to fetch URL: ${input}`,
          { url: input },
          { cause: err as Error }
        );
      } else {
        throw PixeliftError.fileReadFailed(
          `Failed to read file: ${input}`,
          { path: input },
          { cause: err as Error }
        );
      }
    }
  }

  if (input instanceof ArrayBuffer) {
    try {
      return Buffer.from(input);
    } catch (err: unknown) {
      throw PixeliftError.decodeFailed(
        'ArrayBuffer → Buffer conversion failed',
        { byteLength: input.byteLength },
        { cause: err as Error }
      );
    }
  }

  if (ArrayBuffer.isView(input)) {
    const view = input as ArrayBufferView;
    try {
      return Buffer.from(view.buffer, view.byteOffset, view.byteLength);
    } catch (err: unknown) {
      throw PixeliftError.decodeFailed(
        'TypedArray → Buffer conversion failed',
        { constructor: input.constructor.name, byteLength: view.byteLength },
        { cause: err as Error }
      );
    }
  }

  throw PixeliftError.decodeFailed(
    `Unsupported image source type: ${(input as any)?.constructor?.name || typeof input}`,
    { receivedType: typeof input }
  );
}
