import { Technique, UserInventory } from '../types/inventory';
import { DEFAULT_TECHNIQUES } from '../value';

export interface RewardContext {
  baseExp: number;
  baseGauge: number;
  scheduleCategory: string;
  categoryId?: string;
  categoryName?: string;
  currentDate?: Date;
}

export interface CalculatedReward {
  finalExp: number;
  finalGauge: number;
  spiritStones: number;
  buffDescriptions: string[];
}

/**
 * 장착된 공법 및 활성 버프를 적용하여 최종 보상(공력, 게이지, 영석)을 산출합니다.
 */
export const calculateCultivationReward = (
  inventory: UserInventory,
  context: RewardContext
): CalculatedReward => {
  const { baseExp, baseGauge, categoryId, categoryName, currentDate = new Date() } = context;
  
  let expMultiplier = 1.0;
  let gaugeBonus = 0;
  let spiritStones = 5; // 기본 수련 완료 시 5 영석 획득
  const buffDescriptions: string[] = [];

  // 1. 소모품(청심환 등 24시간 공력 부스트) 확인
  if (inventory.consumables.expBoostUntil) {
    const boostUntil = new Date(inventory.consumables.expBoostUntil);
    if (boostUntil.getTime() > currentDate.getTime()) {
      expMultiplier *= 2.0;
      buffDescriptions.push('청심환 효능 (공력 2배)');
    }
  }

  // 2. 장착된 공법(Technique) 효과 적용
  const equippedTechniques = inventory.ownedTechniques.filter(t =>
    inventory.equippedTechniqueIds.includes(t.id)
  );

  for (const tech of equippedTechniques) {
    const tierBonus = (tech.tier - 1) * 0.05; // 성(Tier)이 오를 때마다 +5% 추가 효과

    switch (tech.type) {
      case 'exp_boost': {
        const boost = (tech.multiplier + tierBonus);
        expMultiplier *= boost;
        buffDescriptions.push(`${tech.name} (공력 +${Math.round((boost - 1) * 100)}%)`);
        break;
      }
      case 'category_boost': {
        // 1. 사용자가 직접 지정한 카테고리 ID 일치 여부
        // 2. 또는 카테고리 명칭(신체/Health/운동/헬스/근력 등) 스마트 키워드 매칭
        const isExplicitMatch = Boolean(tech.targetCategory && tech.targetCategory === categoryId);
        const isSmartNameMatch = Boolean(
          categoryName &&
          /(신체|운동|체력|건강|근력|몸|단련|health|body|workout|gym|training|exercise|fitness)/i.test(categoryName)
        );

        if (isExplicitMatch || isSmartNameMatch) {
          spiritStones += 5; // 특화 카테고리 수련 시 영석 +5 보너스
          expMultiplier *= (tech.multiplier + tierBonus);
          buffDescriptions.push(`${tech.name} (특화 수련 보너스)`);
        }
        break;
      }
      case 'morning_boost': {
        // 오전 8시 이전 수련인지 체크 (로컬 시간 기준)
        if (currentDate.getHours() < 8) {
          const boost = (tech.multiplier + tierBonus);
          expMultiplier *= boost;
          spiritStones += 3;
          buffDescriptions.push(`${tech.name} (새벽 수련 보너스)`);
        }
        break;
      }
      case 'gauge_boost': {
        gaugeBonus += 1;
        buffDescriptions.push(`${tech.name} (도심 게이지 보너스)`);
        break;
      }
    }
  }

  const finalExp = Math.max(1, Math.round(baseExp * expMultiplier));
  const finalGauge = baseGauge + gaugeBonus;

  return {
    finalExp,
    finalGauge,
    spiritStones,
    buffDescriptions,
  };
};

/**
 * 수련 완료 시 장착된 공법의 숙련도를 올리고 성(Tier) 상승을 처리합니다.
 */
export const trainEquippedTechniques = (
  ownedTechniques: Technique[],
  equippedIds: string[],
  expGain: number = 10
): { updatedTechniques: Technique[]; leveledUpNames: string[] } => {
  const leveledUpNames: string[] = [];

  const updatedTechniques = ownedTechniques.map(tech => {
    if (!equippedIds.includes(tech.id) || tech.tier >= tech.maxTier) {
      return tech;
    }

    let nextExp = tech.exp + expGain;
    let nextTier = tech.tier;
    let nextMaxExp = tech.maxExp;

    while (nextExp >= nextMaxExp && nextTier < tech.maxTier) {
      nextExp -= nextMaxExp;
      nextTier += 1;
      nextMaxExp = Math.round(nextMaxExp * 1.5);
      leveledUpNames.push(`${tech.name} 제${nextTier}성`);
    }

    return {
      ...tech,
      tier: nextTier,
      exp: nextExp,
      maxExp: nextMaxExp,
    };
  });

  return { updatedTechniques, leveledUpNames };
};

/**
 * ID로 비급 프리셋에서 공법 객체를 조회합니다.
 */
export const findTechniquePreset = (techId: string): Technique | undefined => {
  return DEFAULT_TECHNIQUES.find(t => t.id === techId);
};
