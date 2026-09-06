import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    // .claude/worktrees/* are separate git worktrees other agent sessions
    // left behind, each with its own stale copy of the whole src tree.
    // Without this, vitest's default include picks up every one of them
    // too — running old, sometimes-since-fixed code as if it were current,
    // and reporting failures that have nothing to do with this checkout.
    // tests/e2e/** are Playwright specs (playwright.config.ts), not vitest —
    // vitest's default include glob was sweeping them in too, and they fail
    // immediately since @playwright/test's API isn't vitest's.
    exclude: ['**/node_modules/**', '**/dist/**', '**/.{idea,git,cache,output,temp}/**', '.claude/worktrees/**', 'tests/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
      ],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 60,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});