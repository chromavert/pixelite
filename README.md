# Pixelift

A universal TypeScript library for image processing that works seamlessly in both Node.js and browser environments with SSR support and optional native acceleration via [Sharp](https://github.com/lovell/sharp).

## 🔍 Overview

**Pixelift** provides a unified API to decode images from a variety of sources—URLs, file paths, buffers, HTML elements, video frames, canvas elements, blobs and more—into raw pixel data (`Uint8Array`) with width, height, and channel information. It automatically detects your runtime environment and dispatches to the appropriate implementation:

- **Browser**: Uses the Canvas API and `createImageBitmap` to extract pixel data.
- **Server (Node.js)**: Optionally leverages [Sharp](https://github.com/lovell/sharp) for high‑performance, native image decoding and conversion.

Key features:

- **Multi‑format support**: JPG, PNG, GIF, WebP, AVIF, SVG (and more).
- **Multiple source types**: Strings, URLs, Files/Blobs, HTMLImageElements, VideoFrames, Canvas, Buffer, ArrayBuffer, TypedArrays.
- **Error handling**: Robust error classes (`PixeliteError`, `PixeliteDecodeError`, etc.) with clear codes and stack traces.
- **Environment detection**: Automatically adapts to browser vs. server contexts, including build‑time SSR.
- **Pure TypeScript**: Strong typings for pixel data and sources, with built‑in guard utilities.
- **Optional dependencies**: Sharp is optional on install, with fallback to pure‑JS decoding in unsupported environments.

## 📦 Installation

Install via npm, yarn, pnpm or bun:

```bash
# npm
npm install @chromavert/pixelite

# pnpm
pnpm add @chromavert/pixelite

# bun
bun add @chromavert/pixelite
```

> **Note:** [`sharp`](https://sharp.pixelplumbing.com/) is an optional native dependency that provides high-performance image processing on the server. For Node.js environments, install it with `npm install sharp`. It's automatically excluded from browser builds.
## 🚀 Quick Start

```ts
import { pixelite } from 'pixelite';

async function main() {
  // Browser: URL, <img>, <canvas>, Blob, etc.
  const url = 'https://example.com/image.png';
  const pixelData = await pixelite(url);
  console.log(pixelData.width, pixelData.height, pixelData.channels);

  // Server (Node.js): Buffer, file path, ArrayBuffer
  const filePath = './assets/photo.jpg';
  const serverData = await pixelite(filePath);
  console.log(serverData.data.byteLength);
}

main();
```

## 📖 API Reference

### `pixelite(input: InputSource): Promise<PixelData>`

Decodes an image or video source into raw pixel data.

- **Parameters**:
    - `input: InputSource` — one of:
        - **Browser sources**: `string | URL | File | Blob | HTMLImageElement | HTMLVideoElement | HTMLCanvasElement | OffscreenCanvas | ImageBitmap | VideoFrame | ImageData`
        - **Server sources**: `string | Buffer | ArrayBuffer | TypedArray`

- **Returns**: `Promise<PixelData>`:
  ```ts
  interface PixelData {
    data: Uint8Array;    // Pixel bytes in RGBA order
    width: number;       // Pixel width
    height: number;      // Pixel height
    channels: number;    // Number of channels (always 4)
  }
  ```

- **Errors**:
    - `PixeliteDecodeError` — when decoding fails.
    - `PixeliteNetworkError` — fetch failures.
    - `PixeliteFileReadError` — file system read failures.
    - `PixeliteSourceTypeError` — unsupported input type.

## 🛠️ Utility Functions

- **`packPixels(pixels: number[]): Uint8ClampedArray`** — Convert ARGB 32‑bit ints to RGBA byte array.
- **`unpackPixels(buffer: Uint8Array | ArrayBuffer | number[]): number[]`** — Convert RGB(A) buffer to 32‑bit ARGB ints.

## 🧪 Testing

Run tests in watch or CI mode:

```bash
npm run test
npm run dev
```

Browser tests use Playwright under Vitest's browser environment.

## 🤝 Contributing

Contributions welcome! Please open issues and pull requests on [GitHub](https://github.com/your_username/pixelift).

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Commit your changes (`git commit -m "feat: add ..."`)
4. Push to your branch (`git push origin feat/my-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

