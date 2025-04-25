import type { BrowserImageSource, ServerImageSource } from '../types';

export function isStringOrURL(src: any): src is string | URL {
  return typeof src === 'string' || src instanceof URL;
}

export function isServerImageSource(
  input: unknown,
): input is ServerImageSource {
  if (typeof input === 'string') return true;
  if (Buffer.isBuffer(input)) return true;
  if (input instanceof ArrayBuffer) return true;
  if (
    typeof SharedArrayBuffer !== 'undefined' &&
    input instanceof SharedArrayBuffer
  ) {
    return true;
  }
  return ArrayBuffer.isView(input) && 'BYTES_PER_ELEMENT' in input.constructor;
}

export function isImageBitmapSource(src: any): src is ImageBitmapSource {
  return (
    src instanceof HTMLImageElement ||
    src instanceof SVGImageElement ||
    src instanceof HTMLVideoElement ||
    src instanceof HTMLCanvasElement ||
    src instanceof ImageBitmap ||
    (typeof OffscreenCanvas !== 'undefined' &&
      src instanceof OffscreenCanvas) ||
    src instanceof VideoFrame ||
    src instanceof ImageData ||
    src instanceof Blob
  );
}

export function isBrowserImageSource(
  input: unknown,
): input is BrowserImageSource {
  return (
    // String
    typeof input === 'string' ||
    // URL
    input instanceof URL ||
    // File or Blob
    input instanceof File ||
    input instanceof Blob ||
    // HTML Elements
    input instanceof HTMLImageElement ||
    input instanceof SVGImageElement ||
    input instanceof HTMLVideoElement ||
    input instanceof HTMLCanvasElement ||
    // OffscreenCanvas when available
    (typeof OffscreenCanvas !== 'undefined' &&
      input instanceof OffscreenCanvas) ||
    // Bitmap and VideoFrame
    input instanceof ImageBitmap ||
    input instanceof VideoFrame ||
    // Raw image data
    input instanceof ImageData
  );
}
