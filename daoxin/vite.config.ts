// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/daoxin/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        id: 'daoxin',
        scope: '/daoxin/',
        name: 'Daoxin',
        short_name: 'daoxin',
        start_url: '/daoxin/',
        display: 'standalone',
        description: 'Daoxin - A simple and elegant habit app',
        icons: [
          {
            src: '/favicon.ico',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon',
          },
          { src: '/pwa-192x192.png', type: 'image/png', sizes: '192x192' },
          { src: '/pwa-512x512.png', type: 'image/png', sizes: '512x512' },
        ],
      },
    }),
  ],
});
