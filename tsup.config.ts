import { defineConfig } from 'tsup';

export default defineConfig(({ watch }) => ({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  dts: {
    entry: ['src/index.ts'],
    resolve: true,
  },
  external: ['sharp'],
  target: ['esnext'],
  watch: watch,
  minify: true,
  splitting: false,
  esbuildOptions(options) {
    options.legalComments = 'none';
  },
}));
