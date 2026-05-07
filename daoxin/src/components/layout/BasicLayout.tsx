import React from "react";

import './basiclayout.css';

import AdBanner from '../../providers/ads/AdBanner'; // AdBanner 컴포넌트 임포트
import { useAds } from '../../providers/ads/AdsProvider'; // useAds 훅 임포트

const isCapacitor = import.meta.env.VITE_BUILD_TARGET === 'capacitor';
const routerBasename = isCapacitor ? '/' : '/daoxin/';

export interface BasicLayoutProps {
  children?: React.ReactNode;
}

const BasicLayout: React.FC<BasicLayoutProps> = ({ children }) => {
  const { isAdEnabled, environment} = useAds(); // 광고 활성화 여부 확인

  // 하단 네비게이션 바와 광고 배너의 높이를 정의
  // 실제 CSS에 정의된 bottom-navigation의 높이와 AdBanner의 예상 높이에 맞춰 조정 필요
  const navigationBarHeight = 60; // 예시: bottom-navigation의 높이
  const adBannerHeight = 50; // 예시: AdBanner의 높이
  const isAdsEnabled = environment === 'app' && isAdEnabled ? true : false; // 앱에서는 광고 활성화, 웹에서는 비활성화 (예시)
  // 광고 활성화 여부에 따라 콘텐츠 하단 여백 계산
  const totalFixedBottomHeight = isAdsEnabled ? navigationBarHeight + adBannerHeight : navigationBarHeight;

  return (
    <div className="basic-layout">
      {/* 메인 콘텐츠 영역: 하단 고정 요소들의 높이만큼 padding-bottom 적용 */}
      <main className="layout-content" style={{ paddingBottom: `${totalFixedBottomHeight}px` }}>
        {children}
      </main>

      {/* 하단 고정 배너 광고 */}
      {(isAdsEnabled) && (
        <div className="fixed-bottom-ad-container" style={{
          position: 'fixed',
          bottom: `${navigationBarHeight}px`, // 네비게이션 바 바로 위에 위치
          left: 0, width: '100%', height: `${adBannerHeight}px`,
          zIndex: 9998, // 네비게이션 바(9999)보다 낮고, 일반 콘텐츠보다 높게
          display: 'flex', justifyContent: 'center', alignItems: 'center', // AdBanner 중앙 정렬
          backgroundColor: '#5a5959', // 배경색 추가 (선택 사항)
          boxShadow: '0 -2px 5px rgba(0,0,0,0.1)', // 그림자 효과 (선택 사항)
        }}>
          <AdBanner />
        </div>
      )}

      {/* 하단 네비게이션 바 */}
      <div className="bottom-navigation-container">
      </div>
      <nav className="bottom-navigation">
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