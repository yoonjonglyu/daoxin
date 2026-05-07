import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import StoreProvider from './store/index.tsx';
import { AdsProvider } from './providers/ads/AdsProvider'; // 광고 관련 Provider 임포트

import './index.css';

import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <AdsProvider>
        <App />
      </AdsProvider>
    </StoreProvider>
  </StrictMode>,
);
