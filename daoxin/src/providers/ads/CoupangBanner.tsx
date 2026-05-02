import React from 'react';
import { useAds } from '../adsProvider';

const CoupangBanner: React.FC = () => {
  const { config } = useAds();

  // 쿠팡 파트너스 다이나믹 배너는 iframe 방식으로 간단히 구현 가능합니다.
  const bannerUrl = `https://link.coupang.com/widgets/banner/hp?id=${config.coupang.widgetId}&trackingCode=${config.coupang.trackingCode}`;

  return (
    <div className="coupang-banner" style={{ textAlign: 'center', overflow: 'hidden' }}>
      <iframe
        src={bannerUrl}
        width="100%"
        height="90"
        frameBorder="0"
        scrolling="no"
        referrerPolicy="unsafe-url"
        title="Coupang Ad"
      />
    </div>
  );
};

export default CoupangBanner;