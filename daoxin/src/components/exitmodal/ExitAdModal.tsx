import React, { useEffect } from 'react';

import './ExitAdModal.css';

import { useAds } from '../../providers/ads/AdsProvider';

import { useTranslation } from '../../utils/i18n';

export interface ExitAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ExitAdModal: React.FC<ExitAdModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const { showInterstitial, environment } = useAds();
  const { t } = useTranslation();
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
          <h3 className="exit-modal-title">{t('exitmodalTitle')}</h3>
        </div>

        <div className="exit-modal-body">
          <p className="exit-modal-desc">
              {t('exitmodalDesc')}
          </p>

          {/* 광고 영역 */}
          <div className="exit-modal-ad-container">
            <span className="ad-badge">AD</span>
            {environment === 'web' ? (
              <div className="web-fallback-ad" onClick={() => window.open('https://github.com/yoonjonglyu/daoxin', '_blank')}>
                <div className="ad-content">
                  <div className="ad-title">🔮 {t('adTitle')}</div>
                  <div className="ad-desc">{t('adDesc')}</div>
                </div>
                <button className="ad-action-btn">{t('getPotion')}</button>
              </div>
            ) : (
              <div className="app-ad-placeholder">
                <div className="ad-content">
                  <div className="ad-title">⚡ {t('adTitle')}</div>
                  <div className="ad-desc">{t('adDesc')}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="exit-modal-footer">
          <button className="exit-modal-btn cancel-btn" onClick={onClose}>
            {t('continuePractice')}
          </button>
          <button className="exit-modal-btn confirm-btn" onClick={onConfirm}>
            {t('confirmExit')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExitAdModal;
