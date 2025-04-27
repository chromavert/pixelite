# Pixelift

[![npm version](https://img.shields.io/npm/v/pixelift.svg)](https://www.npmjs.com/package/pixelift) [![Build Status](https://img.shields.io/github/actions/workflow/status/yourusername/pixelift/ci.yml?branch=main)](https://github.com/yourusername/pixelift/actions) [![Downloads](https://img.shields.io/npm/dm/pixelift.svg)](https://www.npmjs.com/package/pixelift) [![License](https://img.shields.io/npm/l/pixelift.svg)](LICENSE)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Examples](#examples)
  - [Basic Pixel Manipulation](#basic-pixel-manipulation)
  - [Inverting Colors](#inverting-colors)
  - [Canvas Integration (Browser)](#canvas-integration-browser)
  - [File Input Integration (Browser)](#file-input-integration-browser)
- [API Reference](#api-reference)
- [Performance](#performance)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Changelog](#changelog)

---

## Overview

**Pixelift** is a universal, promise-based TypeScript library for image processing that decodes images into raw pixel data in both Node.js and browser environments. It automatically leverages [`sharp`](https://github.com/lovell/sharp) on the server for native speed and uses built-in browser APIs for a zero-dependency client bundle.

## Features

- 🚀 **Universal API**: One `pixelift()` function works across Node.js, the browser, and SSR.
- ⚡ **Native Performance**: Auto-detects and uses `sharp` on server; 100% web‑native pipeline in browsers.
- 🔧 **TypeScript First**: Full type definitions and strict interfaces out of the box.
- 📐 **Flexible Resizing**: Optional `width`/`height` arguments for nearest-neighbor resizing.
- 🔄 **Utility Functions**: `packPixels` and `unpackPixels` for 32‑bit ARGB ⇄ RGBA conversions.

## Installation

Install via npm:

```bash
npm install pixelift
```

To enable high-performance decoding on the server, install `sharp` (optional peer dependency):

```bash
npm install sharp
```

## Quick Start

```ts
import { pixelift } from 'pixelift';

async function run() {
  const { data, width, height } = await pixelift('https://example.com/image.png');
  console.log(`Image size: ${width}×${height}`);
  // `data` is a Uint8ClampedArray of RGBA bytes
}

run().catch(console.error);
```

## Examples

### Basic Pixel Manipulation

```ts
import { unpackPixels, packPixels } from 'pixelift';

// Decode first:
const { data } = await pixelift('image.jpg');

// Turn into 32-bit ARGB integers:
const pixelArray = unpackPixels(data);
// Add a red tint (0xffff0000) to every pixel:
const tinted = pixelArray.map(px => px | 0xffff0000);
// Back to RGBA bytes:
const output = packPixels(tinted);
```

### Inverting Colors

```ts
const inverted = pixelArray.map(px => {
  const a = (px >>> 24) & 0xff;
  const r = 255 - ((px >>> 16) & 0xff);
  const g = 255 - ((px >>> 8) & 0xff);
  const b = 255 - (px & 0xff);
  return (a << 24) | (r << 16) | (g << 8) | b;
});
const invertedBytes = packPixels(inverted);
```

### Canvas Integration (Browser)

```html
<canvas id="canvas"></canvas>
<script type="module">
import { pixelift } from 'pixelift';

(async () => {
  const { data, width, height } = await pixelift('/assets/photo.png');
  const canvas = document.querySelector('#canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').putImageData(new ImageData(data, width, height), 0, 0);
})();
</script>
```

### File Input Integration (Browser)

```html
<input type="file" id="file" accept="image/*" />
<canvas id="preview"></canvas>
<script type="module">
import { pixelift } from 'pixelift';

const input = document.getElementById('file');
input.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const { data, width, height } = await pixelift(file);
  const canvas = document.getElementById('preview');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').putImageData(new ImageData(data, width, height), 0, 0);
});
</script>
```

## API Reference

### `pixelift(input, options?) → Promise<PixelData>`

Decode an image to raw pixel data.

- **`input`**: `string | File | Blob | Buffer | URL | Uint8Array | ArrayBuffer`
- **`options`**:
  - `width?: number` — target width for nearest‑neighbor resize
  - `height?: number` — target height

**Returns**: `Promise<PixelData>`

```ts
interface PixelData {
  data: Uint8ClampedArray; // RGBA byte array
  width: number;
  height: number;
  channels: 4;
}
```

### `unpackPixels(buffer, options?) → Uint32Array`

Convert RGBA bytes into 32-bit ARGB integers.

- **`buffer`**: `Uint8ClampedArray`
- **`options.bytesPerPixel`**: `3 | 4` (default: 4)

### `packPixels(pixels) → Uint8ClampedArray`

Convert 32-bit ARGB integers back into RGBA bytes.

- **`pixels`**: `Uint32Array | number[]`

## Roadmap

- [ ] Streaming decode & progressive rendering
- [ ] Additional options for `pixelift()`
- [ ] `unpack` property for `pixelift()` to return `number[]` instead of `Uint8ClampedArray`

## Contributing

1. Fork the repo
2. `git checkout -b feature/awesome`
3. Implement & test
4. `git commit -m "feat: awesome feature"`
5. `git push origin feature/awesome`
6. Open a Pull Request

Please adhere to our [Code of Conduct](CODE_OF_CONDUCT.md).

## License

MIT © [Maikel Eckelboom](https://github.com/maikeleckelboom)

## Changelog

For detailed changes, see [CHANGELOG.md](CHANGELOG.md)

