export type TechniqueType =
  | 'exp_boost'        // 공력 획득 배율 증가
  | 'gauge_boost'      // 도심 게이지 획득 보너스
  | 'streak_shield'    // 연속 수련 실패 방어
  | 'morning_boost'    // 아침 수련 시 추가 보너스
  | 'category_boost';  // 특정 카테고리(신체, 심신, 지식) 수련 시 보너스

/**
 * 공법 (수련 패시브 및 무공)
 */
export interface Technique {
  id: string;
  name: string;             // 공법명 (예: 토납심법, 자하진기)
  nameKey?: string;         // i18n 번역 키
  description: string;      // 설명
  descKey?: string;         // i18n 설명 키
  type: TechniqueType;
  tier: number;             // 현재 성(Tier, 예: 제1성 ~ 제5성)
  maxTier: number;          // 최대 성
  exp: number;              // 현재 숙련도
  maxExp: number;           // 다음 성으로 가기 위한 필요 숙련도
  multiplier: number;       // 기본 효과 배율 (예: 1.1 = +10%)
  targetCategory?: string;  // category_boost일 경우 대상 카테고리 ID
  requiredRealm: number;    // 습득에 필요한 최소 도심 게이지 또는 레벨
  icon: string;             // 아이콘 이모지
}

export type ShopCategory = 'technique' | 'elixir' | 'artifact';

/**
 * 상점 아이템
 */
export interface ShopItem {
  id: string;
  name: string;
  nameKey?: string;
  description: string;
  descKey?: string;
  category: ShopCategory;
  price: number;            // 필요 영석(Spirit Stones)
  requiredRealm: number;    // 구매 가능 최소 도심 게이지
  icon: string;
  techniqueId?: string;     // 공법 비급인 경우 연결된 공법 ID
  effectValue?: number;     // 영약인 경우 효과 수치
}

/**
 * 사용자 인벤토리 상태
 */
export interface UserInventory {
  spiritStones: number;             // 보유 영석 (화폐)
  maxEquipSlots: number;            // 최대 장착 가능한 공법 슬롯 수 (기본 2)
  equippedTechniqueIds: string[];   // 현재 장착된 공법 ID 목록
  ownedTechniques: Technique[];     // 보유한 공법 목록
  consumables: {
    streakShields: number;          // 보심단(스트릭 보호 알약) 보유 개수
    expBoostUntil?: string;         // 청심환(공력 부스트) 종료 일시 (ISO 문자열)
  };
}
