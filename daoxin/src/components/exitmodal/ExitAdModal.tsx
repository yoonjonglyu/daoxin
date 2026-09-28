import React, { useEffect, useState } from 'react';

import './ExitAdModal.css';

import { useAds } from '../../providers/ads/AdsProvider';
import { useTranslation } from '../../utils/i18n';
import useInventory from '../../hooks/useInventory';
import AdConfirmModal from '../ads/AdConfirmModal';

export interface ExitAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onOpenShop?: () => void;
}

const ExitAdModal: React.FC<ExitAdModalProps> = ({ isOpen, onClose, onConfirm, onOpenShop }) => {
  const { showInterstitial, showRewardedAd } = useAds();
  const { activateExpBoost, addSpiritStones } = useInventory();
  const { t } = useTranslation();
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [rewardToast, setRewardToast] = useState<string | null>(null);
  const [isAdConfirmOpen, setIsAdConfirmOpen] = useState(false);

  // 모달이 열릴 때 AdMob 전면 광고(Interstitial) 실행 시도
  useEffect(() => {
    if (isOpen) {
      showInterstitial();
    }
  }, [isOpen, showInterstitial]);

  if (!isOpen) return null;

  const executeClaimPotion = async () => {
    setIsAdConfirmOpen(false);
    if (isAdLoading) return;
    setIsAdLoading(true);

    try {
      const rewardSuccess = await showRewardedAd();
      if (rewardSuccess) {
        // 비약(청심환 24시간 부스트) 활성화 및 보너스 영석 20개 지급
        await activateExpBoost(24);
        await addSpiritStones(20);
        
        setRewardToast(t('exitModalRewardSuccess'));
        setTimeout(() => {
          onClose();
          onOpenShop?.();
        }, 1200);
      } else {
        alert(t('adWatchFailed'));
      }
    } catch (err) {
      console.error('Reward claim error:', err);
      alert(t('adWatchFailed'));
    } finally {
      setIsAdLoading(false);
    }
  };

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

          {rewardToast && (
            <div className="exit-modal-reward-toast">
              ✨ {rewardToast}
            </div>
          )}

          {/* 광고 / 비약 수령 배너 영역 */}
          <div 
            className="exit-modal-ad-container clickable" 
            onClick={() => setIsAdConfirmOpen(true)}
            role="button"
            tabIndex={0}
          >
            <span className="ad-badge">REWARD</span>
            <div className="ad-content">
              <div className="ad-title">
                {isAdLoading ? `⏳ ${t('watchingAd')}` : `🔮 ${t('adTitle')}`}
              </div>
              <div className="ad-desc">{t('adDesc')}</div>
            </div>
            <button 
              className="ad-action-btn" 
              disabled={isAdLoading}
              onClick={(e) => { e.stopPropagation(); setIsAdConfirmOpen(true); }}
            >
              {isAdLoading ? t('watchingAd') : t('getPotion')}
            </button>
          </div>
        </div>

        <div className="exit-modal-footer">
          <button className="exit-modal-btn cancel-btn" onClick={onClose} disabled={isAdLoading}>
            {t('continuePractice')}
          </button>
          <button className="exit-modal-btn confirm-btn" onClick={onConfirm} disabled={isAdLoading}>
            {t('confirmExit')}
          </button>
        </div>
      </div>

      {/* 보상형 광고 시청 확인 다이얼로그 (Google AdMob 정책 준수) */}
      <AdConfirmModal
        isOpen={isAdConfirmOpen}
        rewardName={t('potionRewardName')}
        onConfirm={executeClaimPotion}
        onClose={() => setIsAdConfirmOpen(false)}
      />
    </div>
  );
};

export default ExitAdModal;
