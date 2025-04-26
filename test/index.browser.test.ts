import { describe, expect, test } from 'vitest';
import { pixelite } from '../src';

describe('Browser', () => {
  const formats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg'] as const;

  test.each(formats)('should decode a %s image from a URL', async (format) => {
    const url = new URL(`./assets/test.${format}`, import.meta.url);
    const { data, width, height } = await pixelite(url);

    expect(width).toBeDefined();
    expect(height).toBeDefined();
    expect(data.filter(Boolean).length).toBeGreaterThan(0);
  });
});
