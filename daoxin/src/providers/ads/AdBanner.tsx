import React from 'react';
import { useAds } from '../adsProvider';
import AdSenseBanner from './AdSenseBanner';
import AdMobBanner from './AdMobBanner';
import CoupangBanner from './CoupangBanner';

/**
 * 환경(Web/App)에 따라 적절한 광고를 렌더링하는 통합 컴포넌트
 */
const AdBanner: React.FC = () => {
  const { environment, isAdEnabled } = useAds();

  if (!isAdEnabled) return null;

  // 앱 환경이면 AdMob, 웹 환경이면 AdSense 반환
  if (environment === 'app') {
    return <AdMobBanner />;
  }

  return (
    <div className="web-ads-container">
      <AdSenseBanner />
      <CoupangBanner />
    </div>
  );
};

export default AdBanner;