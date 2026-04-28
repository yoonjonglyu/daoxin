import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { VitePWA } from 'vite-plugin-pwa';

// Capacitor 빌드일 경우 루트(/), 아닐 경우(GitHub Pages) /daoxin/ 사용
const isCapacitor = process.env.VITE_BUILD_TARGET === 'capacitor';
const base = isCapacitor ? '/' : '/daoxin/';

export default defineConfig({
  base: base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        id: 'daoxin',
        scope: base, // 동적 경로 적용
        name: 'Daoxin',
        short_name: 'daoxin',
        start_url: base, // 동적 경로 적용
        display: 'standalone',
        description: 'Daoxin - A simple and elegant habit app',
        icons: [
          {
            // 경로를 `${base}favicon.ico` 형태로 바꾸면 더 안전합니다.
            src: `${base}favicon.ico`, 
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon',
          },
          { src: `${base}pwa-192x192.png`, type: 'image/png', sizes: '192x192' },
          { src: `${base}pwa-512x512.png`, type: 'image/png', sizes: '512x512' },
        ],
      },
    }),
  ],
});