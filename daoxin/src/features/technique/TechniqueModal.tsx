import React from 'react';
import './TechniqueModal.css';
import useInventory from '../../hooks/useInventory';
import useCategory from '../../hooks/useCategory';
import { useTranslation } from '../../utils/i18n';
import { Technique } from '../../types/inventory';

interface TechniqueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenShop?: () => void;
}

const TechniqueModal: React.FC<TechniqueModalProps> = ({ isOpen, onClose, onOpenShop }) => {
  const { inventory, equipTechnique, unequipTechnique, setTechniqueTargetCategory } = useInventory();
  const { categories } = useCategory();
  const { t } = useTranslation();

  if (!isOpen) return null;

  const equippedTechniqueObjects: Technique[] = inventory.equippedTechniqueIds
    .map(id => inventory.ownedTechniques.find(tech => tech.id === id))
    .filter((tech): tech is Technique => Boolean(tech));

  const maxSlots = inventory.maxEquipSlots;
  const emptySlotsCount = Math.max(0, maxSlots - equippedTechniqueObjects.length);

  return (
    <div className="technique-modal-backdrop" onClick={onClose}>
      <div 
        className="technique-modal-container" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* 모달 헤더 */}
        <div className="technique-modal-header">
          <div className="technique-header-title-box">
            <span className="technique-header-icon">📖</span>
            <div>
              <h2 className="technique-modal-title">{t('manageTechniques')}</h2>
              <p className="technique-modal-subtitle">{t('techniqueSubtitle')}</p>
            </div>
          </div>
          <button className="technique-modal-close" onClick={onClose} aria-label={t('close')}>
            ✕
          </button>
        </div>

        {/* 모달 콘텐츠 */}
        <div className="technique-modal-content">
          {/* 장착 슬롯 섹션 */}
          <section className="technique-section">
            <div className="technique-section-header">
              <span className="technique-section-title">
                {t('equippedSlots')} ({equippedTechniqueObjects.length}/{maxSlots})
              </span>
            </div>

            <div className="equipped-slots-grid">
              {equippedTechniqueObjects.map((tech) => {
                const maxMastery = tech.maxExp || tech.tier * 100;
                const currentExp = tech.exp || 0;
                const techName = tech.nameKey ? t(tech.nameKey as any) : tech.name;
                const techDesc = tech.descKey ? t(tech.descKey as any) : tech.description;

                return (
                  <div key={tech.id} className="equipped-slot-card active">
                    <div className="slot-card-header">
                      <div className="slot-badge">{t('techniqueLevel', { level: tech.tier })}</div>
                      <button 
                        className="unequip-btn"
                        onClick={() => unequipTechnique(tech.id)}
                      >
                        {t('unequip')}
                      </button>
                    </div>
                    <div className="slot-card-body">
                      <div className="slot-tech-icon">{tech.icon}</div>
                      <div className="slot-tech-info">
                        <div className="slot-tech-name">{techName}</div>
                        <div className="slot-tech-desc">{techDesc}</div>
                      </div>
                    </div>
                    {/* 숙련도 바 */}
                    <div className="slot-mastery-wrap">
                      <div className="slot-mastery-label">
                        <span>{t('mastery')}</span>
                        <span>{currentExp} / {maxMastery}</span>
                      </div>
                      <div className="slot-mastery-track">
                        <div 
                          className="slot-mastery-fill" 
                          style={{ width: `${Math.min(100, (currentExp / maxMastery) * 100)}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              {Array.from({ length: emptySlotsCount }).map((_, idx) => (
                <div key={`empty-${idx}`} className="equipped-slot-card empty">
                  <span className="empty-slot-icon">➕</span>
                  <span className="empty-slot-text">{t('emptySlot')}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 보유 공법 목록 섹션 */}
          <section className="technique-section">
            <div className="technique-section-header">
              <span className="technique-section-title">{t('ownedTechniques')}</span>
              {onOpenShop && (
                <button className="goto-shop-btn" onClick={() => { onClose(); onOpenShop(); }}>
                  🏛️ {t('shopTitle')} ↗
                </button>
              )}
            </div>

            <div className="owned-techniques-list">
              {inventory.ownedTechniques.map((tech) => {
                const isEquipped = inventory.equippedTechniqueIds.includes(tech.id);
                const maxMastery = tech.maxExp || tech.tier * 100;
                const currentExp = tech.exp || 0;
                const canEquipMore = inventory.equippedTechniqueIds.length < maxSlots;
                const techName = tech.nameKey ? t(tech.nameKey as any) : tech.name;
                const techDesc = tech.descKey ? t(tech.descKey as any) : tech.description;

                return (
                  <div 
                    key={tech.id} 
                    className={`technique-item-card ${isEquipped ? 'is-equipped' : ''}`}
                  >
                    <div className="tech-item-left">
                      <div className="tech-item-icon">{tech.icon}</div>
                      <div className="tech-item-details">
                        <div className="tech-item-name-row">
                          <span className="tech-item-name">{techName}</span>
                          <span className="tech-tier-pill">{t('techniqueLevel', { level: tech.tier })}</span>
                        </div>
                        <p className="tech-item-desc">{techDesc}</p>

                        {/* 카테고리 특화 공법일 경우 대상 카테고리 선택기 */}
                        {tech.type === 'category_boost' && (
                          <div className="tech-category-picker">
                            <span className="picker-label">{t('focusSector')}:</span>
                            <select 
                              value={tech.targetCategory || ''}
                              onChange={(e) => setTechniqueTargetCategory(tech.id, e.target.value)}
                              className="tech-category-select"
                            >
                              <option value="">{t('autoSector')}</option>
                              {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        
                        {/* 숙련도 게이지 */}
                        <div className="tech-item-mastery-box">
                          <div className="tech-mastery-text">
                            <span>{t('mastery')}</span>
                            <span>{currentExp} / {maxMastery}</span>
                          </div>
                          <div className="tech-mastery-bar">
                            <div 
                              className="tech-mastery-progress" 
                              style={{ width: `${Math.min(100, (currentExp / maxMastery) * 100)}%` }} 
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="tech-item-right">
                      {isEquipped ? (
                        <button 
                          className="tech-action-btn unequip"
                          onClick={() => unequipTechnique(tech.id)}
                        >
                          {t('unequip')}
                        </button>
                      ) : (
                        <button 
                          className="tech-action-btn equip"
                          disabled={!canEquipMore}
                          onClick={() => equipTechnique(tech.id)}
                          title={!canEquipMore ? t('maxSlotsReached', { max: maxSlots }) : undefined}
                        >
                          {t('equip')}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TechniqueModal;
