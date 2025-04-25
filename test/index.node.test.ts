import { describe, expect, it } from 'vitest';
import { decode } from '../src/decode.server';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('decode (SSR)', () => {
  const formats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg'] as const;
  it.each(formats)('should handle %s format correctly', async ext => {
    const filePath = resolve(__dirname, 'assets', `test.${ext}`);
    const buffer = readFileSync(filePath);
    const result = await decode(buffer);

    expect(result.channels).toBe(4);
    expect(result.data.some(v => v !== 0)).toBe(true);
  });
});
