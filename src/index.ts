import type { PixelData, PixeliteInput, PixeliteOptions } from './types';
import { isNodeEnvironment } from './utils/env.ts';
import { isBrowserImageSource, isServerImageSource } from './utils/validation.ts';

async function pixelite(
  input: PixeliteInput,
  options: PixeliteOptions = {}
): Promise<PixelData> {
  if (isNodeEnvironment()) {
    const decoder = await import('./decoders/decode.server.ts');
    if (isServerImageSource(input)) {
      return await decoder.decode(input, options);
    }
    throw new TypeError(
      `Invalid input type for server environment. Expected an image source compatible with the server, but received: ${typeof input}. Make sure you're passing the correct server-side image format.`,
      { cause: new Error('Invalid input type for server-side decoding') }
    );
  }

  if (isBrowserImageSource(input)) {
    const decoder = await import('./decoders/decode.browser.ts');
    return await decoder.decode(input, options);
  }

  throw new TypeError(
    `Invalid input type for browser environment. Expected a browser-compatible image source, but received: ${typeof input}. Ensure the input is in a valid browser-readable format.`,
    { cause: new Error('Invalid input type for browser-side decoding') }
  );
}

export { pixelite };
export { unpackPixels, packPixels } from './utils/conversion.ts';

export type { PixelData, PixeliteInput, ServerInput, BrowserInput } from './types/index.ts';
