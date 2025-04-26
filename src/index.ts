import type { PixelData, PixeliteInput, PixeliteOptions } from './types';
import { isRunningInNode } from './utils/env.ts';
import {
  isBrowserImageSource,
  isServerImageSource,
} from './utils/validation.ts';

async function pixelite(
  input: PixeliteInput,
  options: PixeliteOptions = {},
): Promise<PixelData> {
  if (isRunningInNode()) {
    const decoder = await import('./decoders/decode.server.ts');
    if (isServerImageSource(input)) {
      return await decoder.decode(input, options);
    }
    throw new TypeError(
      `Invalid input type for server environment: ${typeof input}`,
      { cause: new Error('Invalid input type') },
    );
  }

  if (isBrowserImageSource(input)) {
    const decoder = await import('./decoders/decode.browser.ts');
    return await decoder.decode(input, options);
  }

  throw new TypeError(
    `Invalid input type for browser environment: ${typeof input}`,
    { cause: new Error('Invalid input type') },
  );
}

export { pixelite };
export { unpackPixels, packPixels } from './utils/conversion.ts';

export type {
  PixelData,
  PixeliteInput,
  ServerInput,
  BrowserInput,
} from './types/index.ts';
