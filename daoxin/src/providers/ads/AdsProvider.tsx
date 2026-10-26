import React, {
  createContext,
  useContext,
  useMemo,
  ReactNode,
  useEffect,
  useCallback,
  useState,
} from 'react';
import { Capacitor } from '@capacitor/core';
import {
  AdMob,
  AdmobConsentStatus,
  type AdmobConsentInfo,
} from '@capacitor-community/admob';

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
  isAdMobReady: boolean;
  consentInfo: AdmobConsentInfo | null;
  showInterstitial: () => Promise<void>;
  showRewardedAd: () => Promise<boolean>;
  showPrivacyConsentForm: () => Promise<boolean>;
  resetConsentInfo: () => Promise<void>;
}

const AdsContext = createContext<AdsContextValue | undefined>(undefined);

/**
 * 광고 설정을 제공하는 Provider (AdMob + UMP 동의 관리)
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

  const [isAdMobReady, setIsAdMobReady] = useState<boolean>(
    !Capacitor.isNativePlatform(),
  );
  const [consentInfo, setConsentInfo] = useState<AdmobConsentInfo | null>(null);

  // 2. 플랫폼별 광고 ID 설정
  const config = useMemo(
    (): AdConfig => ({
      adsense: {
        clientId: 'ca-pub-XXXXXXXXXXXXXXXX', // 애드센스 퍼블리셔 ID
        slotId: 'XXXXXXXXXX',
      },
      admob: {
        bannerUnitId: 'ca-app-pub-2309708500958644/2710641005', // 안드로이드 배너 광고 ID
        interstitialUnitId: 'ca-app-pub-2309708500958644/5945145178', // 안드로이드 전면 광고 ID
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

  // 4. 플랫폼 초기화 및 UMP (User Messaging Platform) 동의 처리
  useEffect(() => {
    let isMounted = true;

    const initializeAdsAndConsent = async () => {
      if (environment !== 'ios' && environment !== 'android') {
        if (isMounted) setIsAdMobReady(true);
        return;
      }

      try {
        // 1단계: AdMob SDK 초기화
        await AdMob.initialize().catch((err) =>
          console.error('AdMob Init Error:', err),
        );

        // 2단계: iOS 환경일 경우 앱 추적 투명성(ATT) 요청
        if (environment === 'ios') {
          try {
            const tracking = await AdMob.trackingAuthorizationStatus();
            if (tracking.status === 'notDetermined') {
              await AdMob.requestTrackingAuthorization();
            }
          } catch (attErr) {
            console.warn('iOS Tracking Authorization Error:', attErr);
          }
        }

        // 3단계: UMP 동의 정보 요청 (User Messaging Platform)
        try {
          const info = await AdMob.requestConsentInfo();
          if (isMounted) setConsentInfo(info);

          // 동의 양식이 필요하고 사용 가능한 경우 UMP 동의 폼 노출
          if (
            info.isConsentFormAvailable &&
            info.status === AdmobConsentStatus.REQUIRED
          ) {
            const consentResult = await AdMob.showConsentForm();
            if (isMounted) setConsentInfo(consentResult);
          }
        } catch (consentErr) {
          console.warn('AdMob UMP Consent Request Error:', consentErr);
        }

        if (!isMounted) return;
        setIsAdMobReady(true);

        // 4단계: UMP 동의 완료 후 전면 광고 미리 로드 (Preload)
        if (isAdEnabled) {
          try {
            await AdMob.prepareInterstitial({
              adId: config.admob.interstitialUnitId,
            });
          } catch (e) {
            console.error('Initial Preload Error:', e);
          }
        }
      } catch (err) {
        console.error('AdMob & UMP Setup Error:', err);
        if (isMounted) setIsAdMobReady(true);
      }
    };

    initializeAdsAndConsent();

    return () => {
      isMounted = false;
    };
  }, [environment, config.admob.interstitialUnitId, isAdEnabled]);

  /**
   * 전면 광고 표시 함수 (앱 환경 전용)
   */
  const showInterstitial = useCallback(async () => {
    if (!isAdEnabled || !isAdMobReady || (environment !== 'ios' && environment !== 'android')) {
      return;
    }

    try {
      // 표시를 시도하고, 만약 로드가 안 되어 있다면 다시 준비
      await AdMob.showInterstitial();

      // 다음번 노출을 위해 다시 로드
      await AdMob.prepareInterstitial({ adId: config.admob.interstitialUnitId });
    } catch (err) {
      console.warn('Ad not ready or failed to show, retrying load:', err);
      try {
        await AdMob.prepareInterstitial({ adId: config.admob.interstitialUnitId });
      } catch (retryErr) {
        console.error('Retry prepareInterstitial error:', retryErr);
      }
    }
  }, [config.admob.interstitialUnitId, environment, isAdEnabled, isAdMobReady]);

  /**
   * 보상형 광고 (영약 및 영석 충전 시스템)
   */
  const showRewardedAd = useCallback(async (): Promise<boolean> => {
    if (!isAdEnabled) return false;

    // 네이티브 앱 환경 (Android / iOS)
    if (environment === 'ios' || environment === 'android') {
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
    }

    // 웹 환경 Fallback: 1.5초 시뮬레이션 후 보상 지급
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 1500);
    });
  }, [config.rewarded.unitId, environment, isAdEnabled]);

  /**
   * 개인정보 보호 동의 설정 양식 호출 (GDPR / UMP 재동의 및 옵션 변경)
   * Google EU 사용자 동의 정책 요구사항: 사용자가 언제든지 동의 철회/변경 가능하도록 제공
   */
  const showPrivacyConsentForm = useCallback(async (): Promise<boolean> => {
    if (environment !== 'ios' && environment !== 'android') return false;

    try {
      const info = await AdMob.requestConsentInfo();
      setConsentInfo(info);

      if (info.isConsentFormAvailable) {
        const result = await AdMob.showConsentForm();
        setConsentInfo(result);
        return true;
      }

      // 동의 폼이 준비되지 않은 경우 UMP 정보 리셋 후 재시도
      await AdMob.resetConsentInfo();
      const refreshedInfo = await AdMob.requestConsentInfo();
      setConsentInfo(refreshedInfo);

      if (refreshedInfo.isConsentFormAvailable) {
        const result = await AdMob.showConsentForm();
        setConsentInfo(result);
        return true;
      }

      return false;
    } catch (err) {
      console.warn('showPrivacyConsentForm Error:', err);
      return false;
    }
  }, [environment]);

  /**
   * UMP 동의 정보 초기화 함수
   */
  const resetConsentInfo = useCallback(async (): Promise<void> => {
    if (environment !== 'ios' && environment !== 'android') return;
    try {
      await AdMob.resetConsentInfo();
      const refreshed = await AdMob.requestConsentInfo();
      setConsentInfo(refreshed);
    } catch (err) {
      console.warn('resetConsentInfo Error:', err);
    }
  }, [environment]);

  const value = useMemo(
    () => ({
      environment,
      config,
      isAdEnabled,
      isAdMobReady,
      consentInfo,
      showInterstitial,
      showRewardedAd,
      showPrivacyConsentForm,
      resetConsentInfo,
    }),
    [
      environment,
      config,
      isAdEnabled,
      isAdMobReady,
      consentInfo,
      showInterstitial,
      showRewardedAd,
      showPrivacyConsentForm,
      resetConsentInfo,
    ],
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
