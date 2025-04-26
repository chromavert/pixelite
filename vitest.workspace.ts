import { defineWorkspace } from 'vitest/config';
import baseConfig from './vitest.config';

export default defineWorkspace([
  {
    test: {
      ...baseConfig.test,
      name: 'server',
      environment: 'node',
      include: [
        '**/*.server.{test,spec}.ts',
        'test/**/*.server.{test,spec}.ts',
        'src/**/*.server.{test,spec}.ts',
        '**/*.universal.{test,spec}.ts',
      ],
    },
  },
  {
    test: {
      ...baseConfig.test,
      name: 'browser',
      include: [
        'test/**/*.browser.{test,spec}.ts',
        'src/**/*.browser.{test,spec}.ts',
        '**/*.universal.{test,spec}.ts',
      ],
      browser: {
        provider: 'playwright',
        enabled: true,
        headless: true,
        screenshotFailures: false,
        instances: [
          { browser: 'webkit' },
          { browser: 'chromium' },
          { browser: 'firefox' },
        ],
      },
    },
  },
]);
