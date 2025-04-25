import type { InputSource, PixelData } from './types';
import { isRunningInNode } from './utils/env.ts';
import { isBrowserImageSource, isServerImageSource } from './utils/guards.ts';

/**
 * Processes the input source and decodes it into pixel data. The behavior of the function
 * depends on the execution environment (server or browser) and the validity of the input.
 *
 * @param {InputSource} input - The input data to be processed and decoded into pixel data.
 *                             The type and validity of the input are environment-specific.
 * @return {Promise<PixelData>} A promise that resolves to the decoded pixel data if the
 *                              input is valid for the corresponding environment.
 *                              If the input is invalid, it throws an error.
 */
export async function pixelift(input: InputSource): Promise<PixelData> {
  if (isRunningInNode()) {
    const decoder = await import('./decode.server.ts');
    if (isServerImageSource(input)) {
      return await decoder.decode(input);
    }
    throw new TypeError(
      `Invalid input type for server environment: ${typeof input}`,
      { cause: new Error('Invalid input type') },
    );
  }

  if (isBrowserImageSource(input)) {
    const decoder = await import('./decode.browser.ts');
    return await decoder.decode(input);
  }

  throw new TypeError(
    `Invalid input type for browser environment: ${typeof input}`,
    { cause: new Error('Invalid input type') },
  );
}
