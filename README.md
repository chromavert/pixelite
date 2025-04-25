# @chromavert/pixelite

Pixelite is a versatile JavaScript library for extracting pixel data from various sources like images, videos, and HTML elements (including `<canvas>`). It's designed to work seamlessly in both client-side and server-side rendering (SSR) environments, making it a great fit for modern web frameworks like Nuxt.js and Next.js.

## Features

- **Extract Pixel Data:** Get detailed pixel information (RGBA values) from images, video frames, and canvas elements.
- **Multiple Sources:** Supports `<img>`, `<video>`, `<canvas>`, and potentially other HTML elements.
- **SSR Compatibility:** Works reliably in server-side environments.
- **Framework Friendly:** Designed for easy integration with frameworks like Nuxt.js and Next.js.
- **Flexible API:** Provides a straightforward API for accessing pixel data.

## Installation

Install the package using npm or yarn:

```bash
npm install @chromavert/pixelite
# or
pnpm add @chromavert/pixelite
# or
bun add @chromavert/pixelite
```

## Usage

```typescript
import { pixelift } from '@chromavert/pixelite';

// Example usage
const pixelData = await pixelift('https://example.com/image.png');
console.log(pixelData); // number[]
```

## API Reference
