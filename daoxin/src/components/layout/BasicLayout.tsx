import React from "react";

import './basiclayout.css';

import AdBanner from '../../providers/ads/AdBanner'; // AdBanner 컴포넌트 임포트
import { useAds } from '../../providers/ads/AdsProvider';

const isCapacitor = import.meta.env.VITE_BUILD_TARGET === 'capacitor';
const routerBasename = isCapacitor ? '/' : '/daoxin/';

export interface BasicLayoutProps {
  children?: React.ReactNode;
}

const BasicLayout: React.FC<BasicLayoutProps> = ({ children }) => {
  const { isAdEnabled, environment } = useAds(); // 광고 상태 및 환경 가져오기

  // 실제 앱/웹 환경 판별
  const isApp = environment === 'ios' || environment === 'android';

  // 하단 네비게이션 바와 광고 배너의 높이를 정의
  const navigationBarHeight = 70; // CSS에 정의된 높이 (basiclayout.css 기준)
  const adBannerHeight = 50; // AdMob/AdSense 표준 배너 높이
  
  // 광고 활성화 여부에 따라 콘텐츠 하단 여백 계산
  const totalFixedBottomHeight = isAdEnabled ? navigationBarHeight + adBannerHeight : navigationBarHeight;

  // 앱 환경에서는 AdMob이 오버레이로 뜨므로 네비게이션 바의 bottom 위치를 조정해야 함
  const navBottomOffset = (isAdEnabled && isApp) ? adBannerHeight : 0;
  

  return (
    <div className="basic-layout">
      {/* 메인 콘텐츠 영역: 하단 고정 요소들의 높이만큼 padding-bottom 적용 */}
      <main className="layout-content" style={{ paddingBottom: `${totalFixedBottomHeight}px` }}>
        {children}
      </main>

      {/* 하단 고정 배너 광고 */}
      {(isAdEnabled && isApp) && (
        <div className="fixed-bottom-ad-container" style={{
          position: 'fixed',
          bottom: isApp ? 0 : `${navigationBarHeight}px`, // 앱은 바닥에(오버레이), 웹은 네비 위에
          left: 0, width: '100%', height: `${adBannerHeight}px`,
          zIndex: isApp ? 10001 : 9998, // 앱에서는 AdMob 오버레이 영역 확보를 위해 높게 설정
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          backgroundColor: '#5a5959', // 배경색 추가 (선택 사항)
          boxShadow: '0 -2px 5px rgba(0,0,0,0.1)', // 그림자 효과 (선택 사항)
        }}>
          <AdBanner />
        </div>
      )}

      {/* 하단 네비게이션 바 */}
      <div className="bottom-navigation-container">
      </div>
      <nav 
        className="bottom-navigation" 
        style={{ bottom: `${navBottomOffset}px` }} // 앱에서 광고가 활성화되면 위로 밀림
      >
        <a href={routerBasename} className="nav-item">
          <span className="nav-icon">☯️</span>
          <span className="nav-label">정진</span>
        </a>
        <a href={`${routerBasename}category`} className="nav-item">
          <span className="nav-icon">📜</span>
          <span className="nav-label">경지</span>
        </a>
        <a href={`${routerBasename}schedule`} className="nav-item">
          <span className="nav-icon">⚔️</span>
          <span className="nav-label">수행</span>
        </a>
      </nav>
    </div>
  );
};

export default BasicLayout;