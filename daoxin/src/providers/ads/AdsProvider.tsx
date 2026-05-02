
import React, { createContext, useContext, useMemo, ReactNode } from 'react';

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

  // 광고 활성화 여부 (예: 프리미엄 유저 체크 등 로직 추가 가능)
  const isAdEnabled = true;

  const value = useMemo(() => ({
    environment,
    config,
    isAdEnabled
  }), [environment, config, isAdEnabled]);

  return (
    <AdsContext.Provider value={value}>
      {children}
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