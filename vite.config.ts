/// <reference types="vitest/config" />

import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const SRC_DIR = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
    // tsconfigPaths only covers script imports, so CSS `@import '@/...'` needs the alias too.
    alias: { '@': SRC_DIR },
  },
  css: {
    transformer: 'lightningcss',
    lightningcss: {
      cssModules: {
        pattern: '[local]_[hash]',
      },
      drafts: {
        customMedia: true,
      },
    },
  },
  build: {
    cssMinify: 'lightningcss',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
