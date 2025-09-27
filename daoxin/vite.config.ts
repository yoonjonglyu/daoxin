// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { VitePWA } from 'vite-plugin-pwa';
import { ViteFaviconsPlugin } from 'vite-plugin-favicon';

export default defineConfig({
  base: '/daoxin/',
  plugins: [
    react(),
    ViteFaviconsPlugin({
      logo: 'src/assets/favicon.png',
      favicons: {
        appName: 'Daoxin',
        appDescription: 'Daoxin - A simple and elegant habit app',
        developerName: 'ISA',
        path: 'assets/',
      },
    }),
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
            src: 'favicon.ico',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon',
          },
          { src: 'pwa-192x192.png', type: 'image/png', sizes: '192x192' },
          { src: 'pwa-512x512.png', type: 'image/png', sizes: '512x512' },
        ],
      },
    }),
  ],
  build: {
    outDir: 'dist',
    manifest: 'assets/manifest.json',
    rollupOptions: {
      output: {
        // ✅ 해시 제거: 이미지 등 asset에 대해 해시 없이 고정 이름으로 출력
        assetFileNames: (info) => {
          // 이미지인 경우만 hash 제거
          if (/\.(png|jpg|jpeg|svg|ico)$/i.test(info.name ?? '')) {
            return 'assets/[name][extname]';
          }
          return 'assets/[name]-[hash][extname]'; // 다른 건 기본값 유지
        },
      },
    },
  },
});
