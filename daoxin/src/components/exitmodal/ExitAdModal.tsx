import React, { useEffect } from 'react';
import { useAds } from '../../providers/ads/AdsProvider';
import './ExitAdModal.css';

export interface ExitAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ExitAdModal: React.FC<ExitAdModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const { showInterstitial, environment } = useAds();

  // 모달이 열릴 때 AdMob 전면 광고(Interstitial) 실행 시도
  useEffect(() => {
    if (isOpen) {
      showInterstitial();
    }
  }, [isOpen, showInterstitial]);

  if (!isOpen) return null;

  return (
    <div className="exit-modal-overlay">
      <div className="exit-modal-card">
        {/* 장식적 요소: 선협풍 테두리 코너 */}
        <div className="corner-decor top-left"></div>
        <div className="corner-decor top-right"></div>
        <div className="corner-decor bottom-left"></div>
        <div className="corner-decor bottom-right"></div>

        <div className="exit-modal-header">
          <span className="exit-modal-icon">☯️</span>
          <h3 className="exit-modal-title">정진을 중단하시겠습니까?</h3>
        </div>

        <div className="exit-modal-body">
          <p className="exit-modal-desc">
            지금 속세로 돌아가시면 오늘의 정진 기록과 내력 쌓기가 중단됩니다.
            도심(道心)이 흔들리지 않도록 정진을 계속하는 것이 좋습니다.
          </p>

          {/* 광고 영역 */}
          <div className="exit-modal-ad-container">
            <span className="ad-badge">AD</span>
            {environment === 'web' ? (
              <div className="web-fallback-ad" onClick={() => window.open('https://github.com/yoonjonglyu/daoxin', '_blank')}>
                <div className="ad-content">
                  <div className="ad-title">🔮 도천비급 상점 오픈!</div>
                  <div className="ad-desc">일일 수행 효율을 200% 증가시키는 영약 패키지 출시. 지금 바로 확인하세요.</div>
                </div>
                <button className="ad-action-btn">비약 받기</button>
              </div>
            ) : (
              <div className="app-ad-placeholder">
                <div className="ad-content">
                  <div className="ad-title">⚡ AdMob 전면 광고 구동 중</div>
                  <div className="ad-desc">모바일 환경에서는 AdMob 광고가 로드되어 수행자의 도심을 시험합니다.</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="exit-modal-footer">
          <button className="exit-modal-btn cancel-btn" onClick={onClose}>
            수행 계속하기
          </button>
          <button className="exit-modal-btn confirm-btn" onClick={onConfirm}>
            속세로 귀환 (종료)
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExitAdModal;
