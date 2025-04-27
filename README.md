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

Install Pixelift via npm:

```bash
npm install pixelift
```

For Node.js server-side processing, install `sharp` as an optional dependency:

```bash
npm install sharp
```

## Examples

## For Browser Usage

```javascript
import { pixelift } from 'pixelift';

const pixelData = await pixelift('https://example.com/image.png');
```

## Data Structure

```ts
interface PixelData {
  data: Uint8ClampedArray,  // Pixel values (type depends on normalize option)
  width: number,            // Image width in pixels
  height: number            // Image height in pixels
  channels: 4               // Number of color channels
}
```

## Conversion Utilities

### Do some pixel manipulation using the `unpackPixels` and `packPixels` functions.

```ts
import { unpackPixels, packPixels } from 'pixelift';

// Convert pixel data to ARGB integers
const colors = unpackPixels(pixels.data);

// Modify pixels (example: add red tint)
const modified = colors.map(color => color | 0xffff0000);

// Convert back to Uint8ClampedArray
const modifiedData = packPixels(modified);
```

### Inverting Colors

```ts
import { unpackPixels, packPixels } from 'pixelift';

// Convert pixel data to ARGB integers
const colors = unpackPixels(pixels.data);

// Invert the colors for each pixel
const invertedColors = colors.map(color => {
  const a = (color >> 24) & 0xff;
  const r = (color >> 16) & 0xff;
  const g = (color >> 8) & 0xff;
  const b = color & 0xff;

  // Invert RGB channels while preserving the original alpha channel
  const invR = 255 - r;
  const invG = 255 - g;
  const invB = 255 - b;

  return (a << 24) | (invR << 16) | (invG << 8) | invB;
});

// Convert back to Uint8ClampedArray
const invertedData = packPixels(invertedColors);
```

### Canvas Integration Browser

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Canvas Example</title>
</head>
<body>
<canvas id="canvas"></canvas>
<script type="module">
  import { pixelift } from 'pixelift';

  const imageUrl = 'path/to/image.jpg';
  const { data, width, height } = await pixelift(imageUrl);
  const canvas = document.getElementById('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imageData = new ImageData(data, width, height);
  ctx.putImageData(imageData, 0, 0);
</script>
</body>
</html>
```

## API Reference

### `pixelift(input: PixeliftInput, options?: PixeliftOptions): Promise<PixelData>`

Decodes an image into raw pixel data.

- **Parameters:**
    - `input`: Image source (string, URL, File, Blob, Buffer, etc.)
    - `options` (optional):
        - `width?: number` - Target width
        - `height?: number` - Target height
- **Returns:** `Promise<PixelData>`

    ```typescript
    interface PixelData {
      data: Uint8ClampedArray;
      width: number;
      height: number;
      channels: 4;
    }
    ```

### `unpackPixels(buffer: BinaryData, options?: { bytesPerPixel?: 3 | 4; useTArray?: boolean }): number[] | Uint32Array`

Converts raw pixel data into an array of 32-bit ARGB integers.

### `packPixels(pixels: ArrayLike<number>): Uint8ClampedArray`

Converts an array of 32-bit ARGB integers back into raw pixel data.

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Submit a Pull Request

## License

Pixelift is released under the MIT License. See the LICENSE file for details.
