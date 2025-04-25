import { defineWorkspace } from 'vitest/config';
import baseConfig from './vitest.config';

export default defineWorkspace([
  {
    test: {
      ...baseConfig.test,
      name: 'node',
      environment: 'node',
      include: ['test/**/*.node.test.ts'],
    },
  },
  {
    test: {
      ...baseConfig.test,
      name: 'browser',
      include: ['test/**/*.browser.test.ts'],
      browser: {
        provider: 'playwright',
        enabled: true,
        headless: true,
        screenshotFailures: false,
        instances: [
          { browser: 'webkit' },
          // { browser: 'chromium' },
          // { browser: 'firefox' },
        ],
      },
    },
  },
]);
