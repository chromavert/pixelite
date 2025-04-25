import { defineConfig } from 'tsup';

export default defineConfig(({ watch }) => ({
  // Entry point for the library
  entry: ['src/index.ts'],

  // Output formats: ESM and CommonJS
  format: ['esm', 'cjs'],

  // Directory for generated files
  outDir: 'dist',

  // Clean the output directory before each build
  clean: true,

  // Generate source maps for easier debugging
  sourcemap: true,

  // Generate TypeScript declaration files (.d.ts)
  dts: {
    // Entry file(s) for declarations
    entry: ['src/index.ts'],
    resolve: true,
  },

  // Do not bundle "sharp" so that it remains an external optional dependency
  external: ['sharp'],

  // Build target (Node >=18 and modern browsers)
  target: ['esnext'],

  // Enable watch mode in dev for faster iteration
  watch: watch,

  // Minification disabled by default for better readability
  minify: true,

  // Disable code splitting (one file per entry)
  splitting: false,

  // Ensure consistent legal comments handling (remove licenses)
  esbuildOptions(options) {
    options.legalComments = 'none';
  },
}));
