import React, {
  createContext,
  useContext,
  useMemo,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
import { Capacitor } from '@capacitor/core';
import { AdMob } from '@capacitor-community/admob';

/**
 * 광고 플랫폼 및 환경 타입 정의
 */
type AdEnvironment = 'web' | 'ios' | 'android';

interface AdConfig {
  adsense: { clientId: string; slotId: string };
  admob: { bannerUnitId: string; interstitialUnitId: string };
  rewarded: { unitId: string };
  coupang: { widgetId: string; trackingCode: string };
}

interface AdsContextValue {
  environment: AdEnvironment;
  config: AdConfig;
  isAdEnabled: boolean;
  showInterstitial: () => Promise<void>;
  showRewardedAd: () => Promise<boolean>;
}

const AdsContext = createContext<AdsContextValue | undefined>(undefined);

/**
 * 광고 설정을 제공하는 Provider
 */
export const AdsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // 1. 환경 감지 로직 (Web vs App/WebView)
  const environment = useMemo((): AdEnvironment => {
    // Capacitor 환경 확인
    if (Capacitor.isNativePlatform()) {
      return Capacitor.getPlatform() === 'ios' ? 'ios' : 'android';
    }

    return 'web';
  }, []);

  // 2. 플랫폼별 광고 ID 설정 (실제 ID로 변경 필요)
  const config = useMemo(
    (): AdConfig => ({
      adsense: {
        clientId: 'ca-pub-XXXXXXXXXXXXXXXX', // 애드센스 퍼블리셔 ID
        slotId: 'XXXXXXXXXX',
      },
      admob: {
        bannerUnitId: 'ca-app-pub-2309708500958644/2710641005', // 테스트용 AdMob 배너 단위 ID (실제 ID로 교체 필요)
        // bannerUnitId: '', // 애드몹 배너 광고 단위 ID
        interstitialUnitId: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
      },
      rewarded: {
        unitId: 'ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY',
      },
      coupang: {
        widgetId: 'XXXXXX',
        trackingCode: 'AFXXXXXXX',
      },
    }),
    [],
  );

  // 3. 광고 활성화 여부
  const isAdEnabled = true;

  // 4. 플랫폼 초기화 (Capacitor AdMob)
  useEffect(() => {
    if (environment === 'ios' || environment === 'android') {
      AdMob.initialize().catch((err) =>
        console.error('AdMob Init Error:', err),
      );
    }
  }, [environment]);

  /**
   * 전면 광고 표시 함수 (앱 환경 전용)
   */
  const showInterstitial = useCallback(async () => {
    if (!isAdEnabled || (environment !== 'ios' && environment !== 'android')) return;
    try {
      await AdMob.prepareInterstitial({
        adId: config.admob.interstitialUnitId,
      });
      await AdMob.showInterstitial();
    } catch (err) {
      console.error('Interstitial Error:', err);
    }
  }, [config.admob.interstitialUnitId, environment, isAdEnabled]);

  /**
   * 보상형 광고 (영약 시스템 등)
   */
  const showRewardedAd = useCallback(async (): Promise<boolean> => {
    if (!isAdEnabled || (environment !== 'ios' && environment !== 'android')) return false;
    try {
      await AdMob.prepareRewardVideoAd({
        adId: config.rewarded.unitId,
      });
      const reward = await AdMob.showRewardVideoAd();
      return !!reward; // 보상 획득 여부 반환
    } catch (err) {
      console.error('Rewarded Ad Error:', err);
      return false;
    }
  }, [config.rewarded.unitId, environment, isAdEnabled]);

  const value = useMemo(
    () => ({
      environment,
      config,
      isAdEnabled,
      showInterstitial,
      showRewardedAd,
    }),
    [environment, config, isAdEnabled, showInterstitial, showRewardedAd],
  );

  return <AdsContext.Provider value={value}>{children}</AdsContext.Provider>;
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
