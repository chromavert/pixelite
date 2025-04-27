export type BrowserInput = string | URL | File | ImageBitmapSource;

export type ServerInput = string | Buffer | BufferSource;

export type PixeliftInput = BrowserInput | ServerInput;

export interface PixelData {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  channels: 4;
}

export interface PixeliftOptions {
  width?: number;
  height?: number;
}
