import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      clawguard: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      'openclaw/plugin-sdk/core': fileURLToPath(
        new URL('./openclaw/src/plugin-sdk/core.ts', import.meta.url),
      ),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
