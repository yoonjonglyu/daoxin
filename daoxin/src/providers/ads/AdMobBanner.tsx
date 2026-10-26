import React, { useEffect } from 'react';
import { AdMob, BannerAdPosition, BannerAdSize } from '@capacitor-community/admob';
import { useAds } from './AdsProvider';

const AdMobBanner: React.FC = () => {
  const { config, isAdMobReady } = useAds();

  useEffect(() => {
    // UMP 동의 및 AdMob SDK 초기화가 완료될 때까지 대기
    if (!isAdMobReady) return;

    let isMounted = true;

    const initializeAndShowBanner = async () => {
      try {
        await AdMob.showBanner({
          adId: config.admob.bannerUnitId,
          adSize: BannerAdSize.BANNER,
          position: BannerAdPosition.BOTTOM_CENTER,
          margin: 0,
        });
      } catch (err) {
        if (isMounted) {
          console.error('AdMob showBanner Error:', err);
        }
      }
    };

    initializeAndShowBanner();

    // 컴포넌트 언마운트 시 광고 제거
    return () => {
      isMounted = false;
      AdMob.removeBanner().catch(() => {});
    };
  }, [config.admob.bannerUnitId, isAdMobReady]);

  // AdMob 배너는 앱 위에 오버레이로 뜨므로 DOM 요소를 반환할 필요가 없습니다.
  return null;
};

export default AdMobBanner;