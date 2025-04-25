import type { InputSource, PixelData } from './types.ts';
import { isServerEnv } from './env.ts';
import { isValidBrowserInput, isValidServerInput } from './utils.ts';

export async function pixelift(input: InputSource): Promise<PixelData> {
  if (isServerEnv()) {
    const decoder = await import('./decode.server.ts');
    if (isValidServerInput(input)) {
      return await decoder.decode(input);
    }
    throw new TypeError(
      `Invalid input type for server environment: ${typeof input}`,
      { cause: new Error('Invalid input type') },
    );
  }

  if (isValidBrowserInput(input)) {
    const decoder = await import('./decode.browser.ts');
    return await decoder.decode(input);
  }

  throw new TypeError(
    `Invalid input type for browser environment: ${typeof input}`,
    { cause: new Error('Invalid input type') },
  );
}
