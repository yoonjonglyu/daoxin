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
        bannerUnitId: 'ca-app-pub-2309708500958644/2710641005', // 'ca-app-pub-3940256099942544/6300978111', // 안드로이드 배너 광고 테스트 ID
        // bannerUnitId: '', // 애드몹 배너 광고 단위 ID
        interstitialUnitId: 'ca-app-pub-2309708500958644/5945145178', //'ca-app-pub-3940256099942544/1033173712', // 안드로이드 전면 광고 테스트 ID
      },
      rewarded: {
        unitId: 'ca-app-pub-3940256099942544/5224354917', // 안드로이드 보상형 광고 테스트 ID
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

      // 앱 시작 시 전면 광고 미리 로드 (Preload)
      if (isAdEnabled) {
        AdMob.prepareInterstitial({
          adId: config.admob.interstitialUnitId,
        }).catch(e => console.error('Initial Preload Error:', e));
      }
    }
  }, [environment]);

  /**
   * 전면 광고 표시 함수 (앱 환경 전용)
   */
  const showInterstitial = useCallback(async () => {
    if (!isAdEnabled || (environment !== 'ios' && environment !== 'android')) return;
    try {
      // 표시를 시도하고, 만약 로드가 안 되어 있다면 다시 준비
      await AdMob.showInterstitial();
      
      // 다음번 노출을 위해 다시 로드
      await AdMob.prepareInterstitial({ adId: config.admob.interstitialUnitId });
    } catch (err) {
      console.warn('Ad not ready or failed to show, retrying load:', err);
      await AdMob.prepareInterstitial({ adId: config.admob.interstitialUnitId });
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
