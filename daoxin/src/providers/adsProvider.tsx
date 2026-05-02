import React, { createContext, useContext, useMemo, ReactNode, useEffect, useCallback } from 'react';
import { AdMob } from '@capacitor-community/admob';
import AdBanner from './ads/AdBanner';

/**
 * 광고 플랫폼 및 환경 타입 정의
 */
type AdEnvironment = 'web' | 'app';

interface AdConfig {
  adsense: { clientId: string; slotId: string };
  admob: { bannerUnitId: string; interstitialUnitId: string };
  coupang: { widgetId: string; trackingCode: string };
}

interface AdsContextValue {
  environment: AdEnvironment;
  config: AdConfig;
  isAdEnabled: boolean;
}

const AdsContext = createContext<AdsContextValue | undefined>(undefined);

/**
 * 광고 설정을 제공하는 Provider
 */
export const AdsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. 환경 감지 로직 (Web vs App/WebView)
  const environment = useMemo((): AdEnvironment => {
    if (typeof window === 'undefined') return 'web';
    
    // ReactNative WebView나 특정 앱 유저에이전트 확인
    const isApp = 
      // @ts-ignore
      window.ReactNativeWebView || 
      /YourAppName|AppInternal/i.test(window.navigator.userAgent);
    
    return isApp ? 'app' : 'web';
  }, []);

  // 2. 플랫폼별 광고 ID 설정 (실제 ID로 변경 필요)
  const config = useMemo((): AdConfig => ({
    adsense: {
      clientId: 'ca-pub-XXXXXXXXXXXXXXXX', // 애드센스 퍼블리셔 ID
      slotId: 'XXXXXXXXXX',
    },
    admob: {
      bannerUnitId: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
      interstitialUnitId: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
    },
    coupang: {
      widgetId: 'XXXXXX',
      trackingCode: 'AFXXXXXXX',
    }
  }), []);

  // 3. 광고 활성화 여부
  const isAdEnabled = true;

  // 4. 플랫폼 초기화 (Capacitor AdMob)
  useEffect(() => {
    if (environment === 'app') {
      AdMob.initialize().catch(err => console.error('AdMob Init Error:', err));
    }
  }, [environment]);

  /**
   * 전면 광고 표시 함수 (앱 환경 전용)
   */
  const showInterstitial = useCallback(async () => {
    if (!isAdEnabled || environment !== 'app') return;
    try {
      await AdMob.prepareInterstitial({
        adId: config.admob.interstitialUnitId,
      });
      await AdMob.showInterstitial();
    } catch (err) {
      console.error('Interstitial Error:', err);
    }
  }, [config.admob.interstitialUnitId, environment, isAdEnabled]);

  const value = useMemo(() => ({
    environment,
    config,
    isAdEnabled,
    showInterstitial
  }), [environment, config, isAdEnabled, showInterstitial]);

  return (
    <AdsContext.Provider value={value}>
      {children}
      {/* 전역 하단 광고 배너 자동 배치 */}
      {isAdEnabled && (
        <div className="global-ad-slot" style={{ marginTop: 'auto' }}>
          <AdBanner />
        </div>
      )}
    </AdsContext.Provider>
  );
};

/**
 * 광고 정보 사용을 위한 커스텀 훅
 */
export const useAds = () => {
  const context = useContext(AdsContext);
  if (!context) {
    throw new Error('useAds must be used within an AdsProvider');
  }
  return context;
};

export default AdsProvider;