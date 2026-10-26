import { describe, it, expect } from 'vitest';
import { calculateCultivationReward, trainEquippedTechniques } from '../techniqueService';
import type { UserInventory, Technique } from '../../types/inventory';

const createMockInventory = (overrides?: Partial<UserInventory>): UserInventory => ({
  spiritStones: 100,
  maxEquipSlots: 2,
  ownedTechniques: [],
  equippedTechniqueIds: [],
  consumables: { streakShields: 2 },
  ...overrides,
});

describe('techniqueService - calculateCultivationReward (보상 계산)', () => {
  it('기본 습관 완료 시 baseGauge는 1, baseExp는 전달된 값이어야 한다', () => {
    const inv = createMockInventory();
    const reward = calculateCultivationReward(inv, {
      baseExp: 2,
      baseGauge: 1,
      scheduleCategory: 'habit',
      currentDate: new Date('2026-10-26T14:00:00'),
    });

    expect(reward.finalGauge).toBe(1); // 도심 게이지는 1
    expect(reward.finalExp).toBe(2);
    expect(reward.spiritStones).toBe(5); // 기본 수련 보너스 영석 5
  });

  it('게이지 보너스 공법(gauge_boost) 장착 시 finalGauge가 1 증가해야 한다', () => {
    const gaugeTech: Technique = {
      id: 'tech-gauge',
      name: '도심강화공법',
      type: 'gauge_boost',
      tier: 1,
      maxTier: 5,
      exp: 0,
      maxExp: 100,
      description: '도심 게이지 상승',
      multiplier: 1,
      icon: '🛡️',
      requiredRealm: 0,
    };

    const inv = createMockInventory({
      ownedTechniques: [gaugeTech],
      equippedTechniqueIds: ['tech-gauge'],
    });

    const reward = calculateCultivationReward(inv, {
      baseExp: 2,
      baseGauge: 1,
      scheduleCategory: 'habit',
      currentDate: new Date('2026-10-26T14:00:00'),
    });

    expect(reward.finalGauge).toBe(2); // 1 + 1 = 2
  });

  it('신체/운동 관련 카테고리 특화 공법 장착 시 영석 보너스와 경험치 배율이 적용되어야 한다', () => {
    const bodyTech: Technique = {
      id: 'tech-iron-body',
      name: '철포삼(Iron Body)',
      type: 'category_boost',
      tier: 1,
      maxTier: 5,
      exp: 0,
      maxExp: 100,
      description: '신체 특화',
      multiplier: 1.5,
      icon: '🥋',
      requiredRealm: 0,
    };

    const inv = createMockInventory({
      ownedTechniques: [bodyTech],
      equippedTechniqueIds: ['tech-iron-body'],
    });

    const reward = calculateCultivationReward(inv, {
      baseExp: 2,
      baseGauge: 1,
      scheduleCategory: 'habit',
      categoryName: 'Health(신체 단련)',
      currentDate: new Date('2026-10-26T14:00:00'),
    });

    expect(reward.spiritStones).toBe(10); // 기본 5 + 특화 영석 5 = 10
    expect(reward.finalExp).toBe(3); // 2 * 1.5 = 3
  });
});

describe('techniqueService - trainEquippedTechniques (공법 숙련도 훈련)', () => {
  it('장착된 공법만 숙련도가 오르고, maxExp 도달 시 제2성으로 승급해야 한다', () => {
    const tech: Technique = {
      id: 'tech-1',
      name: '태극혜검',
      type: 'gauge_boost',
      tier: 1,
      maxTier: 5,
      exp: 90,
      maxExp: 100,
      description: '',
      multiplier: 1,
      icon: '🗡️',
      requiredRealm: 0,
    };

    const { updatedTechniques, leveledUpNames } = trainEquippedTechniques(
      [tech],
      ['tech-1'],
      20
    );

    expect(updatedTechniques[0].tier).toBe(2);
    expect(updatedTechniques[0].exp).toBe(10); // 110 - 100 = 10
    expect(leveledUpNames).toContain('태극혜검 제2성');
  });
});
