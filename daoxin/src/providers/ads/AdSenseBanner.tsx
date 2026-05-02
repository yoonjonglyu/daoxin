import React, { useEffect } from 'react';
import { useAds } from './AdsProvider';

const AdSenseBanner: React.FC = () => {
  const { config } = useAds();

  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense Error:', err);
    }
  }, []);

  return (
    <div 
      className="adsense-container" 
      style={{ display: 'flex', justifyContent: 'center', margin: '10px 0', minHeight: '90px' }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={config.adsense.clientId}
        data-ad-slot={config.adsense.slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdSenseBanner;