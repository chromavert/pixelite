import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { pixelite } from '../src';

describe('Decoder Options', () => {
  it('should set width and height when provided', async () => {
    const input = readFileSync('test/assets/test.png');

    const { data, width, height } = await pixelite(input, {
      width: 100,
      height: 200,
    });

    expect(data).toBeInstanceOf(Uint8Array);
    expect(width).toBe(100);
    expect(height).toBe(200);
  });
});
