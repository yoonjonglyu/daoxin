import React from 'react';
import './AdConfirmModal.css';
import { useTranslation } from '../../utils/i18n';

export interface AdConfirmModalProps {
  isOpen: boolean;
  rewardName: string;
  onConfirm: () => void;
  onClose: () => void;
}

const AdConfirmModal: React.FC<AdConfirmModalProps> = ({
  isOpen,
  rewardName,
  onConfirm,
  onClose,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="ad-confirm-backdrop" onClick={onClose}>
      <div 
        className="ad-confirm-card" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="ad-confirm-icon-wrap">
          <span className="ad-confirm-icon">📺</span>
        </div>

        <h3 className="ad-confirm-title">{t('adConfirmTitle')}</h3>
        <p className="ad-confirm-desc">
          {t('adConfirmDesc', { reward: rewardName })}
        </p>

        <div className="ad-confirm-reward-box">
          <span className="reward-box-label">Reward:</span>
          <span className="reward-box-value">{rewardName}</span>
        </div>

        <div className="ad-confirm-actions">
          <button className="ad-confirm-btn cancel" onClick={onClose}>
            {t('cancel')}
          </button>
          <button className="ad-confirm-btn confirm" onClick={onConfirm}>
            {t('watchAdBtn')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdConfirmModal;
