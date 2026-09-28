import React, { useState } from 'react';
import './ShopModal.css';
import useInventory from '../../hooks/useInventory';
import { useAds } from '../../providers/ads/AdsProvider';
import { useTranslation } from '../../utils/i18n';
import { ShopItem } from '../../types/inventory';
import AdConfirmModal from '../../components/ads/AdConfirmModal';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTechniques?: () => void;
}

const ShopModal: React.FC<ShopModalProps> = ({ isOpen, onClose, onOpenTechniques }) => {
  const { inventory, shopItems, buyShopItem, addSpiritStones } = useInventory();
  const { showRewardedAd } = useAds();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'manuals' | 'elixirs'>('manuals');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [isAdCharging, setIsAdCharging] = useState(false);
  const [isAdConfirmOpen, setIsAdConfirmOpen] = useState(false);

  if (!isOpen) return null;

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 2500);
  };

  const handleBuy = async (item: ShopItem) => {
    if (inventory.spiritStones < item.price) {
      showFeedback(t('notEnoughStones'));
      return;
    }

    const result = await buyShopItem(item);
    const itemName = item.nameKey ? t(item.nameKey as any) : item.name;
    if (result.success) {
      showFeedback(t('purchaseSuccess', { name: itemName }));
    } else {
      showFeedback(result.message);
    }
  };

  const handleConfirmAndWatchAd = async () => {
    setIsAdConfirmOpen(false);
    if (isAdCharging) return;
    setIsAdCharging(true);
    showFeedback(t('watchingAd'));

    try {
      const success = await showRewardedAd();
      if (success) {
        await addSpiritStones(30);
        showFeedback(t('rewardReceived'));
      } else {
        showFeedback(t('adWatchFailed'));
      }
    } catch (err) {
      console.error('Ad charge failed:', err);
      showFeedback(t('adWatchFailed'));
    } finally {
      setIsAdCharging(false);
    }
  };

  const manualItems = shopItems.filter(it => it.category === 'technique');
  const elixirItems = shopItems.filter(it => it.category === 'elixir');

  // 청심환 부스트 잔여 여부 및 직관적 남은 시간 계산
  const isExpBoostActive = Boolean(
    inventory.consumables?.expBoostUntil && 
    new Date(inventory.consumables.expBoostUntil).getTime() > Date.now()
  );

  const getRemainingBoostText = () => {
    if (!inventory.consumables?.expBoostUntil) return null;
    const remainingMs = new Date(inventory.consumables.expBoostUntil).getTime() - Date.now();
    if (remainingMs <= 0) return null;
    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) {
      return t('hoursAndMinutesLeft', { hours, minutes });
    }
    return t('minutesOnlyLeft', { minutes: Math.max(1, minutes) });
  };

  const remainingBoostText = getRemainingBoostText();

  return (
    <div className="shop-modal-backdrop" onClick={onClose}>
      <div 
        className="shop-modal-container" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* 헤더 */}
        <div className="shop-modal-header">
          <div className="shop-header-title-box">
            <span className="shop-header-icon">🏛️</span>
            <div>
              <h2 className="shop-modal-title">{t('shopTitle')}</h2>
              <p className="shop-modal-subtitle">{t('shopSubtitle')}</p>
            </div>
          </div>
          <button className="shop-modal-close" onClick={onClose} aria-label={t('close')}>
            ✕
          </button>
        </div>

        {/* 1행: 영석 잔액 및 광고 충전 바 */}
        <div className="shop-balance-bar">
          <div className="balance-info">
            <span className="balance-label">{t('spiritStones')}</span>
            <div className="balance-amount">
              <span className="stone-gem">💎</span>
              <span className="stone-val">{inventory.spiritStones}</span>
            </div>
          </div>
          <button 
            className="charge-ad-btn" 
            onClick={() => setIsAdConfirmOpen(true)}
            disabled={isAdCharging}
            title={t('watchAdReward')}
          >
            📺 {isAdCharging ? t('watchingAd') : `+30 💎`}
          </button>
        </div>

        {/* 2행: 청심환 실시간 남은 지속시간 및 보심단 보유 현황 바 (영석과 별도 줄) */}
        <div className="shop-buff-status-bar">
          <div className={`buff-status-card elixir ${isExpBoostActive ? 'active' : ''}`}>
            <span className="buff-card-icon">🍶</span>
            <div className="buff-card-info">
              <span className="buff-card-name">{t('shopElixirBoostName')}</span>
              <div className="buff-card-detail">
                {isExpBoostActive ? (
                  <>
                    <span className="buff-highlight">{t('boostActiveStatus')}</span>
                    <span className="buff-time-left">({remainingBoostText})</span>
                  </>
                ) : (
                  <span className="buff-inactive">{t('inactiveBuff')}</span>
                )}
              </div>
            </div>
          </div>

          <div className="buff-status-card shield">
            <span className="buff-card-icon">🛡️</span>
            <div className="buff-card-info">
              <span className="buff-card-name">{t('shopElixirShieldName')}</span>
              <div className="buff-card-detail">
                <span className="buff-count-text">
                  {t('streakShieldCount', { count: inventory.consumables?.streakShields || 0 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 알림 메시지 토스트 */}
        {feedbackMsg && (
          <div className="shop-feedback-toast">
            {feedbackMsg}
          </div>
        )}

        {/* 탭 네비게이션 */}
        <div className="shop-tabs">
          <button 
            className={`shop-tab-btn ${activeTab === 'manuals' ? 'active' : ''}`}
            onClick={() => setActiveTab('manuals')}
          >
            📜 {t('tabManuals')}
          </button>
          <button 
            className={`shop-tab-btn ${activeTab === 'elixirs' ? 'active' : ''}`}
            onClick={() => setActiveTab('elixirs')}
          >
            🍶 {t('tabElixirs')}
          </button>
        </div>

        {/* 아이템 리스트 */}
        <div className="shop-items-container">
          {activeTab === 'manuals' ? (
            <div className="shop-grid">
              {manualItems.map((item) => {
                const isOwned = inventory.ownedTechniques.some(tech => tech.id === item.techniqueId);
                const canAfford = inventory.spiritStones >= item.price;
                const itemName = item.nameKey ? t(item.nameKey as any) : item.name;
                const itemDesc = item.descKey ? t(item.descKey as any) : item.description;

                return (
                  <div key={item.id} className={`shop-item-card ${isOwned ? 'owned' : ''}`}>
                    <div className="item-icon-wrap">{item.icon}</div>
                    <div className="item-info">
                      <div className="item-name-row">
                        <span className="item-name">{itemName}</span>
                        {isOwned && <span className="item-owned-badge">{t('alreadyOwned')}</span>}
                      </div>
                      <p className="item-desc">{itemDesc}</p>
                    </div>

                    <div className="item-action-row">
                      <div className="item-price">
                        <span className="price-gem">💎</span>
                        <span className="price-val">{item.price}</span>
                      </div>
                      {isOwned ? (
                        <button 
                          className="item-btn view-tech"
                          onClick={() => { onClose(); onOpenTechniques?.(); }}
                        >
                          📖 {t('manageTechniques')}
                        </button>
                      ) : (
                        <button 
                          className="item-btn buy"
                          disabled={!canAfford}
                          onClick={() => handleBuy(item)}
                        >
                          {t('buy')}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="shop-grid">
              {elixirItems.map((item) => {
                const canAfford = inventory.spiritStones >= item.price;
                const isItemActive = item.id === 'shop-elixir-boost' && isExpBoostActive;
                const itemName = item.nameKey ? t(item.nameKey as any) : item.name;
                const itemDesc = item.descKey ? t(item.descKey as any) : item.description;

                return (
                  <div key={item.id} className="shop-item-card">
                    <div className="item-icon-wrap elixir">{item.icon}</div>
                    <div className="item-info">
                      <div className="item-name-row">
                        <span className="item-name">{itemName}</span>
                        {isItemActive && (
                          <span className="item-active-badge">{t('activeBadge')}</span>
                        )}
                      </div>
                      <p className="item-desc">{itemDesc}</p>
                    </div>

                    <div className="item-action-row">
                      <div className="item-price">
                        <span className="price-gem">💎</span>
                        <span className="price-val">{item.price}</span>
                      </div>
                      <button 
                        className="item-btn buy"
                        disabled={!canAfford}
                        onClick={() => handleBuy(item)}
                      >
                        {t('buy')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 푸터 힌트 */}
        <div className="shop-modal-footer">
          <span className="footer-tip">
            {t('shopDailyRewardTip')}
          </span>
        </div>
      </div>

      {/* 광고 시청 확인 모달 (Google 정책 준수) */}
      <AdConfirmModal
        isOpen={isAdConfirmOpen}
        rewardName={t('stoneRewardName')}
        onConfirm={handleConfirmAndWatchAd}
        onClose={() => setIsAdConfirmOpen(false)}
      />
    </div>
  );
};

export default ShopModal;
