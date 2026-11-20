import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  define: {
    // Blanket fallback FIRST so specific keys below always win
    'process.env': '{}',
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env.NEXT_PUBLIC_API_BASE_URL': JSON.stringify('https://delta-labs-agbn.onrender.com'),
    'process.env.NEXT_PUBLIC_FEED_DEBUG_WORKER_HEALTH': JSON.stringify('false'),
    // Show built-in mock videos when the backend returns 0 items (e.g. cold start on Render free tier)
    'process.env.NEXT_PUBLIC_FEED_DEBUG_USE_LOCAL_VIDEOS_WHEN_EMPTY': JSON.stringify('true'),
    'process.env.NEXT_PUBLIC_FEED_DEBUG_LOADING_MS': JSON.stringify(''),

  },
  base: './', // Enforce relative asset paths for Electron loading
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'next/link': path.resolve(__dirname, 'src/shims/next-link.tsx'),
      'next/navigation': path.resolve(__dirname, 'src/shims/next-navigation.ts'),
      'next/image': path.resolve(__dirname, 'src/shims/next-image.tsx'),
    }
  },
  build: {
    outDir: path.resolve(__dirname, 'dist', 'out'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      }
    }
  },
  server: {
    port: 4000,
    strictPort: true,
  }
});
