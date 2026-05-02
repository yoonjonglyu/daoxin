import React, { useEffect } from 'react';
import { AdMob, BannerAdPosition, BannerAdSize } from '@capacitor-community/admob';
import { useAds } from './AdsProvider';

const AdMobBanner: React.FC = () => {
  const { config } = useAds();

  useEffect(() => {
    const initializeAndShowBanner = async () => {
      await AdMob.showBanner({
        adId: config.admob.bannerUnitId,
        adSize: BannerAdSize.BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
      });
    };

    initializeAndShowBanner();

    // 컴포넌트 언마운트 시 광고 제거
    return () => {
      AdMob.removeBanner();
    };
  }, [config.admob.bannerUnitId]);

  // AdMob 배너는 앱 위에 오버레이로 뜨므로 DOM 요소를 반환할 필요가 없습니다.
  return null;
};

export default AdMobBanner;