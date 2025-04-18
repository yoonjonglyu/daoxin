// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { ViteFaviconsPlugin } from 'vite-plugin-favicon';

export default defineConfig({
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
