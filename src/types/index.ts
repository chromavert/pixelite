export type BrowserInput =
  | string
  | URL
  | File
  | HTMLOrSVGImageElement
  | HTMLVideoElement
  | HTMLCanvasElement
  | ImageBitmap
  | OffscreenCanvas
  | VideoFrame
  | Blob
  | ImageData;

export type BufferInput = Buffer | BufferSource;

export type ServerInput = string | BufferInput;

export type PixeliteInput = BrowserInput | ServerInput;

export interface PixelData {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  channels: 4;
}

export interface PixeliteOptions {
  width?: number;
  height?: number;
}
