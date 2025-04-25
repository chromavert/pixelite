import { describe, expect, it } from 'vitest';

import { pixelite } from '../src';

describe('Decode (Client)', () => {
  it('should be a function', () => {
    expect(typeof pixelite).toBe('function');
  });

  describe('Image formats', () => {
    const formats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'] as const;

    for (const format of formats) {
      it(`should decode a ${format} image from a URL`, async () => {
        const url = new URL(`./assets/test.${format}`, import.meta.url);
        const { data, width, height } = await pixelite(url);
        expect(width).toBeDefined();
        expect(height).toBeDefined();
        expect(data.filter(Boolean).length).toBeGreaterThan(0);
      });
    }

    describe('SVG support', () => {
      it('should decode the `test.svg` image from a URL', async () => {
        const url = new URL('./assets/test.svg', import.meta.url);
        const { data, width, height } = await pixelite(url);
        expect(width).toBeDefined();
        expect(height).toBeDefined();
        expect(data.filter(Boolean).length).toBeGreaterThan(0);
      });

      it('should decode the `rainbow.svg` image from a URL', async () => {
        const url = new URL('./assets/rainbow.svg', import.meta.url);
        const { data, width, height } = await pixelite(url);
        expect(width).toBeDefined();
        expect(height).toBeDefined();
        expect(data.filter(Boolean).length).toBeGreaterThan(0);
      });
    });
  });

  it('should throw an error if no input is provided', async () => {
    // @ts-expect-error
    await expect(pixelite()).rejects.toThrowError();
  });

  it('should throw an error if input is not valid', async () => {
    // @ts-expect-error
    await expect(pixelite({})).rejects.toThrowError();
  });
});
