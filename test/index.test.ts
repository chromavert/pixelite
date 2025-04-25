import { describe, expect, it } from 'vitest';

import { pixelift } from '../src';

describe('Pixelift', () => {
  it('should be a function', () => {
    expect(typeof pixelift).toBe('function');
  });

  it('should throw an error if no input is provided', async () => {
    // @ts-expect-error
    await expect(pixelift()).rejects.toThrowError();
  });

  it('should throw an error if input is not valid', async () => {
    // @ts-expect-error
    await expect(pixelift({})).rejects.toThrowError();
  });
});
