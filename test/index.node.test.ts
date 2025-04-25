import { describe, expect, it } from 'vitest';

import { decode } from '../src/decode.server';
import { readFileSync } from 'node:fs';

describe('Pixelift in a server environment', () => {
  it('should run in a server environment', () => {
    expect(typeof decode).toBe('function');
  });

  it('converts RGB JPEG to RGBA format with alpha channel', async () => {
    const image = readFileSync('./test/assets/test.jpg');
    const result = await decode(image);
    expect(result.channels).toBe(4);
    expect(result.data.filter(Boolean).length).toBeGreaterThan(0);
  });
});
