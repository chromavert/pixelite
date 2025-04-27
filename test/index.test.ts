import { describe, expect, it } from 'vitest';
import { pixelift } from '../src';

describe('Universal', () => {
  it('should be a function', () => {
    expect(typeof pixelift).toBe('function');
  });

  it('should throw an error if input is not a valid image', async () => {
    const url = new URL('./assets/test.txt', import.meta.url);
    await expect(pixelift(url)).rejects.toThrowError();
  });

  it('should throw an error if no input is provided', async () => {
    // @ts-expect-error - Simulate no input
    await expect(pixelift()).rejects.toThrowError();
  });

  it('should throw an error if input is not valid', async () => {
    // @ts-expect-error - Simulate invalid input
    await expect(pixelift({})).rejects.toThrowError();
  });
});
