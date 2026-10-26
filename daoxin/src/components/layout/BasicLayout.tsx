import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { Capacitor, PluginListenerHandle } from '@capacitor/core';

import './basiclayout.css';

import AdBanner from '../../providers/ads/AdBanner';
import { useAds } from '../../providers/ads/AdsProvider';
import ExitAdModal from '../exitmodal/ExitAdModal';
import TechniqueModal from '../../features/technique/TechniqueModal';
import ShopModal from '../../features/shop/ShopModal';
import useInventory from '../../hooks/useInventory';
import { useTranslation } from '../../utils/i18n';

export interface BasicLayoutProps {
  children?: React.ReactNode;
  onSettingsClick?: () => void;
}

const BasicLayout: React.FC<BasicLayoutProps> = ({ children, onSettingsClick }) => {
  const { isAdEnabled, environment } = useAds();
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isTechniqueModalOpen, setIsTechniqueModalOpen] = useState(false);
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const { inventory } = useInventory();
  const location = useLocation();
  const { t } = useTranslation();

  // 실제 앱/웹 환경 판별
  const isApp = environment === 'ios' || environment === 'android';

  // 하단 네비게이션 바와 광고 배너의 높이를 정의
  const navigationBarHeight = 64; // 모바일 최적화 높이
  const adBannerHeight = 50; // AdMob/AdSense 표준 배너 높이
  
  // 광고 활성화 여부에 따라 콘텐츠 하단 여백 계산
  const totalFixedBottomHeight = isAdEnabled ? navigationBarHeight + adBannerHeight : navigationBarHeight;

  // 앱 환경에서는 AdMob이 바닥 오버레이(50px)로 뜨므로 네비게이션 바를 배너 위로 올림
  const navBottomOffset = (isAdEnabled && isApp) ? adBannerHeight : 0;

  // 1. 웹 환경 뒤로가기(popstate) 방지 및 모달 제어
  useEffect(() => {
    if (Capacitor.isNativePlatform()) return;

    // 홈 화면('/')에서만 뒤로가기 인터셉트
    if (location.pathname !== '/') return;

    if (!window.history.state || !window.history.state.noBack) {
      window.history.pushState({ noBack: true }, '', window.location.href);
    }

    const handlePopState = () => {
      setIsExitModalOpen(true);
      window.history.pushState({ noBack: true }, '', window.location.href);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location.pathname]);

  // 2. Capacitor 네이티브 앱 환경 하드웨어 뒤로가기 제어
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let handlerPromise: Promise<PluginListenerHandle> | null = null;

    import('@capacitor/app').then(({ App }) => {
      handlerPromise = App.addListener('backButton', () => {
        if (location.pathname === '/') {
          setIsExitModalOpen(true);
        } else {
          window.history.back();
        }
      });
    });

    return () => {
      if (handlerPromise) {
        handlerPromise.then((h) => h.remove());
      }
    };
  }, [location.pathname]);

  const handleConfirmExit = () => {
    setIsExitModalOpen(false);
    if (Capacitor.isNativePlatform()) {
      import('@capacitor/app').then(({ App }) => {
        App.exitApp();
      });
    } else {
      window.history.go(-2);
      setTimeout(() => {
        window.close();
      }, 100);
    }
  };

  return (
    <div className="basic-layout">
      {/* 메인 콘텐츠 영역: 노치/상단바 및 하단 네비게이션/광고 배너 영역 자동 보정 */}
      <main 
        className="layout-content" 
        style={{ 
          paddingTop: 'calc(68px + env(safe-area-inset-top, 0px))', 
          paddingBottom: isApp
            ? `calc(${totalFixedBottomHeight}px + 12px)`
            : `calc(${totalFixedBottomHeight}px + env(safe-area-inset-bottom, 0px) + 12px)` 
        }}
      >
        {children}
      </main>

      {/* 하단 배너 광고 컨테이너 (앱: 바닥 50px 오버레이 영역, 웹: 하단바 위) */}
      {isAdEnabled && (
        <div className="fixed-bottom-ad-container" style={{
          position: 'fixed',
          bottom: isApp ? 0 : `calc(${navigationBarHeight}px + env(safe-area-inset-bottom, 0px))`,
          left: 0,
          width: '100%',
          height: `${adBannerHeight}px`,
          zIndex: isApp ? 10001 : 999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'var(--ink-black, #0c0c0e)',
        }}>
          <AdBanner />
        </div>
      )}

      {/* 상단 통합 액션 바 (노치 및 상태표시줄 safe-area-inset 자동 대응) */}
      <header className="top-action-bar">
        <button 
          className="spirit-stone-badge-btn" 
          onClick={() => setIsShopModalOpen(true)}
          title={t('spiritStones')}
          aria-label={t('spiritStones')}
        >
          <span className="stone-gem-icon">💎</span>
          <span className="stone-count-text">{inventory.spiritStones}</span>
        </button>

        <div className="top-action-buttons">
          <button
            className="top-action-icon-btn"
            onClick={() => setIsTechniqueModalOpen(true)}
            title={t('manageTechniques')}
            aria-label={t('manageTechniques')}
          >
            📖
          </button>
          <button
            className="top-action-icon-btn"
            onClick={() => setIsShopModalOpen(true)}
            title={t('shopTitle')}
            aria-label={t('shopTitle')}
          >
            🏛️
          </button>
          <button
            id="settings-trigger-btn"
            className="top-action-icon-btn settings-trigger-btn"
            onClick={onSettingsClick}
            title={t('settings')}
            aria-label="Open Settings"
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* 하단 네비게이션 바 (SPA Router Link 사용으로 깜빡임 없는 고속 탭 전환) */}
      <nav 
        className="bottom-navigation" 
        style={{ 
          bottom: `${navBottomOffset}px`,
          paddingBottom: isApp ? '0px' : 'env(safe-area-inset-bottom, 0px)',
          height: isApp ? `${navigationBarHeight}px` : `calc(${navigationBarHeight}px + env(safe-area-inset-bottom, 0px))`
        }}
      >
        <Link 
          to="/" 
          className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
        >
          <span className="nav-icon">☯️</span>
          <span className="nav-label">{t('practice')}</span>
        </Link>
        <Link 
          to="/category" 
          className={`nav-item ${location.pathname === '/category' ? 'active' : ''}`}
        >
          <span className="nav-icon">📜</span>
          <span className="nav-label">{t('realm')}</span>
        </Link>
        <Link 
          to="/schedule" 
          className={`nav-item ${location.pathname === '/schedule' ? 'active' : ''}`}
        >
          <span className="nav-icon">⚔️</span>
          <span className="nav-label">{t('manual')}</span>
        </Link>
      </nav>

      {/* 공법 수련관 모달 */}
      <TechniqueModal
        isOpen={isTechniqueModalOpen}
        onClose={() => setIsTechniqueModalOpen(false)}
        onOpenShop={() => setIsShopModalOpen(true)}
      />

      {/* 만물각(상점) 모달 */}
      <ShopModal
        isOpen={isShopModalOpen}
        onClose={() => setIsShopModalOpen(false)}
        onOpenTechniques={() => setIsTechniqueModalOpen(true)}
      />

      {/* 앱 종료 / 뒤로가기 광고 모달 */}
      <ExitAdModal 
        isOpen={isExitModalOpen} 
        onClose={() => setIsExitModalOpen(false)} 
        onConfirm={handleConfirmExit} 
        onOpenShop={() => setIsShopModalOpen(true)}
      />
    </div>
  );
};

export default BasicLayout;