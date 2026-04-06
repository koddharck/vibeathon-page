import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  // Fixes the white screen by ensuring paths start from root
  base: "/", 

  plugins: [
    react(),
    tailwindcss()
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },

  server: {
    // Keeps HMR active unless explicitly disabled
    hmr: process.env.DISABLE_HMR !== 'true',
  },
});
