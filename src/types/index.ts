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

export type ServerInput =
  | string
  | Buffer
  | ArrayBuffer
  | Uint8Array
  | Uint8ClampedArray
  | Int8Array
  | Uint16Array
  | Int16Array
  | Uint32Array
  | Int32Array
  | Float32Array
  | Float64Array;

export type PixeliteInput = BrowserInput | ServerInput;

export interface PixelData {
  data: Uint8Array;
  width: number;
  height: number;
  channels: 4;
}

export interface PixeliteOptions {
  width?: number;
  height?: number;
}
