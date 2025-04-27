# Pixelift

## Overview

**Pixelift** is a universal TypeScript library for image processing that seamlessly decodes images into raw pixel data
in both Node.js and browser environments. Leveraging [`sharp`](https://github.com/lovell/sharp) on the server and native
browser APIs, pixelift supports every major image format (JPEG, PNG, GIF, WebP, AVIF, SVG) under a consistent,
promise-based API.

Key features:

- **Universal API**: Use the same `pixelift()` function in Node.js, browser, or SSR contexts.
- **Native performance**: Automatically uses `sharp` on the server; 100% web‑native in browsers.
- **TypeScript first**: Full typings and strict interfaces out of the box.
- **Flexible resizing**: Optional `width`/`height` parameters with nearest‑neighbor resizing.
- **Utility functions**: `packPixels`/`unpackPixels` for 32‑bit ARGB ⇄ RGBA conversions.

## Installation

Install via npm or yarn:

```bash
npm install pixelift
# or
yarn add pixelift
```

> **Note**: On the server, `sharp` is an optional dependency. To enable high‑performance decoding in Node.js, install
> it:

```bash
npm install sharp
```

## Usage

### Node.js / Server

```ts
import { pixelift, unpackPixels, packPixels } from 'pixelift';
import fs from 'fs';

async function decodeLocalImage() {
  // Read a file into a Buffer
  const buffer = fs.readFileSync('assets/photo.png');

  // Decode into raw pixel data
  const pixelData = await pixelift(buffer, { width: 200, height: 200 });

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
import { pixelift } from 'pixelift';

async function decodeFromURL() {
  const url = new URL('/images/logo.svg', import.meta.url);
  const { data, width, height, channels } = await pixelift(url, { width: 100 });

  console.log(`Decoded ${width}×${height} with ${channels} channels`);
  // `data` is a Uint8Array of [R,G,B,A,...]
}
```

You can also decode `File`, `Blob`, `<canvas>`, `ImageBitmap`, etc.

## API Reference

### `pixelift(input: InputSource, options?: pixeliftOptions): Promise<PixelData>`

- **`input`**:
  `Buffer | ArrayBuffer | Uint8Array | string | URL | File | Blob | HTMLImageElement | ImageBitmap | OffscreenCanvas | ...`
- **`options`**:
    - `width?: number` – target width (nearest‑neighbor).
    - `height?: number` – target height.

**Returns** a `Promise<PixelData>`:

```ts
interface PixelData {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  channels: 4;
}
```

Throws a `pixeliftError` (or subclass) on failure:

- `pixeliftDecodeError` for decode or fetch issues.
- `pixeliftSourceTypeError` for unsupported inputs.

### `unpackPixels(buffer: ArrayBufferView, pixelSize?: 3|4): number[]`

Converts RGBA (or RGB) byte data into 32‑bit ARGB integers.

```ts
const rgba = new Uint8Array([255, 0, 0, 255]);
const ints = unpackPixels(rgba); // [0xFFFF0000]
```

### `packPixels(pixels: number[]): Uint8Array`

Turns 32‑bit ARGB integers back into RGBA bytes.

```ts
const arr = packPixels([0x80ff00ff]); // Uint8Array [255,0,255,128]
```

## Examples

#### Resize and Inspect Raw Data

```ts
import fs from 'fs';
import { pixelift } from 'pixelift';

const buf = fs.readFileSync('photo.jpg');
const { data, width, height } = await pixelift(buf, {
  width: 50,
  height: 50
});
console.log(`Buffer length: ${data.length}`);
```

#### Decode Canvas Element

```html

<canvas id="myCanvas" width="150" height="150"></canvas>
<script type="module">
  import { pixelift } from 'pixelift';

  const canvas = document.getElementById('myCanvas');
  // ... draw something on canvas ...

  const pixelData = await pixelift(canvas);
  console.log(pixelData);
</script>
```

## Testing

This project uses [Vitest](https://vitest.dev/) for unit tests across server and browser:

```bash
npm test
```

## Contributing

Contributions welcome! Please open an issue or PR on [GitHub](https://github.com/chromavert/pixelift).

1. Fork the repo
2. Install dependencies: `npm install`
3. Run tests: `npm test`
4. Ensure linting & formatting: `npm run format`

## License

MIT © Maikel Eckelboom
