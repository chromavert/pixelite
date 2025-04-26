## Overview

**Pixelite** is a universal TypeScript library for image processing that seamlessly decodes images into raw pixel data in both Node.js and browser environments. Leveraging [`sharp`](https://github.com/lovell/sharp) on the server and native browser APIs, Pixelite supports every major image format (JPEG, PNG, GIF, WebP, AVIF, SVG) under a consistent, promise-based API.

Key features:

- **Universal API**: Use the same `pixelite()` function in Node.js, browser, or SSR contexts.
- **Native performance**: Automatically uses `sharp` on the server; 100% web‑native in browsers.
- **TypeScript first**: Full typings and strict interfaces out of the box.
- **Flexible resizing**: Optional `width`/`height` parameters with nearest‑neighbor resizing.
- **Utility functions**: `packPixels`/`unpackPixels` for 32‑bit ARGB ⇄ RGBA conversions.

## Installation

Install via npm or yarn:

```bash
npm install @chromavert/pixelite
# or
yarn add @chromavert/pixelite
```

> **Note**: On the server, `sharp` is an optional dependency. To enable high‑performance decoding in Node.js, install it:
>
```bash
npm install sharp
```

## Usage

### Node.js / Server

```ts
import { pixelite, unpackPixels, packPixels } from '@chromavert/pixelite';
import fs from 'fs';

async function decodeLocalImage() {
  // Read a file into a Buffer
  const buffer = fs.readFileSync('assets/photo.png');

  // Decode into raw pixel data
  const pixelData = await pixelite(buffer, { width: 200, height: 200 });

  console.log(pixelData.width, pixelData.height); // 200 200
  console.log(pixelData.data.length); // 200 * 200 * 4

  // Convert to 32-bit ARGB integers
  const argb = unpackPixels(pixelData.data);

  // Convert back to RGBA byte buffer
  const rgba = packPixels(argb);
}
```

### Browser

```ts
import { pixelite } from '@chromavert/pixelite';

async function decodeFromURL() {
  const url = new URL('/images/logo.svg', import.meta.url);
  const { data, width, height, channels } = await pixelite(url, { width: 100 });

  console.log(`Decoded ${width}×${height} with ${channels} channels`);
  // `data` is a Uint8Array of [R,G,B,A,...]
}
```

You can also decode `File`, `Blob`, `<canvas>`, `ImageBitmap`, etc.

## API Reference

### `pixelite(input: InputSource, options?: PixeliteOptions): Promise<PixelData>`

- **`input`**: `Buffer | ArrayBuffer | Uint8Array | string | URL | File | Blob | HTMLImageElement | ImageBitmap | OffscreenCanvas | ...`
- **`options`**:
    - `width?: number` – target width (nearest‑neighbor).
    - `height?: number` – target height.

**Returns** a `Promise<PixelData>`:

```ts
interface PixelData {
  data: Uint8Array; // RGBA bytes
  width: number;
  height: number;
  channels: 4;
}
```

Throws a `PixeliteError` (or subclass) on failure:

- `PixeliteDecodeError` for decode or fetch issues.
- `PixeliteSourceTypeError` for unsupported inputs.

### `unpackPixels(buffer: ArrayBufferView, pixelSize?: 3|4): number[]`

Converts RGBA (or RGB) byte data into 32‑bit ARGB integers.

```ts
const rgba = new Uint8Array([255,0,0,255]);
const ints = unpackPixels(rgba); // [0xFFFF0000]
```

### `packPixels(pixels: number[]): Uint8Array`

Turns 32‑bit ARGB integers back into RGBA bytes.

```ts
const arr = packPixels([0x80FF00FF]); // Uint8Array [255,0,255,128]
```

## Examples

#### Resize and Inspect Raw Data

```ts
import fs from 'fs';
import { pixelite } from '@chromavert/pixelite';

(async () => {
  const buf = fs.readFileSync('photo.jpg');
  const { data, width, height } = await pixelite(buf, { width: 50, height: 50 });
  console.log(`Buffer length: ${data.length}`);
  // e.g., Buffer length: 10000
})();
```

#### Decode Canvas Element

```html
<canvas id="myCanvas" width="150" height="150"></canvas>
<script type="module">
  import { pixelite } from '@chromavert/pixelite';

  const canvas = document.getElementById('myCanvas');
  // ... draw something on canvas ...

  const pixelData = await pixelite(canvas);
  console.log(pixelData);
</script>
```

## Testing

This project uses [Vitest](https://vitest.dev/) for unit tests across server and browser:

```bash
npm test
```

## Contributing

Contributions welcome! Please open an issue or PR on [GitHub](https://github.com/chromavert/pixelite).

1. Fork the repo
2. Install dependencies: `npm install`
3. Run tests: `npm test`
4. Ensure linting & formatting: `npm run format`

## License

MIT © Maikel Eckelboom

