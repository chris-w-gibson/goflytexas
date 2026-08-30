import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['lib/**/__tests__/**/*.test.ts'],
  },
  resolve: {
    // Mirrors tsconfig "@/*" so tests can vi.mock('@/lib/db') etc.
    alias: { '@': fileURLToPath(new URL('.', import.meta.url)) },
  },
});
