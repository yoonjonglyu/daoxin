import type { Daoxin } from './types/daoxin';
import type { Category } from './types/category';
import type { Schedule } from './types/schedule';
import type { UserInventory, Technique, ShopItem } from './types/inventory';

export const DAOXIN = 'daoxin';
export const SALT = '일체유심조';
export const MIN_GAUGE = 1;
export const MAX_GAUGE = 78;
/**
 * 사용자 기기의 현재 로컬 시간 기준 오늘 날짜 문자열 반환 (YYYY/MM/DD)
 */
export const getTodayString = (date: Date = new Date()): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}/${m}/${d}`;
};

export const TODAY = getTodayString();
export const SCHEDULE_STORAGE_KEY = 'DAOXIN_SCHEDULE_LIST';
export const CATEGORY_STORAGE_KEY = 'DAOXIN_CATEGORY_LIST';
export const LOG_STORAGE_KEY = 'DAOXIN_ACTIVITY_LOGS';
export const CONFIG_STORAGE_KEY = 'DAOXIN_CONFIG';
export const DAOXIN_DEFAULT: Daoxin = {
  rank: '발심',
  gauge: 1,
  level: 1,
  exp: 0,
  streak: 0,
  totalCompleted: 0,
  updateAt: TODAY,
};

export const DAOXIN_DEFAULT_CATEGORYS: Category[] = [
  { id: 'cat-1', name: 'Health(신체 수련)', description: '강건한 육신을 위한 정진', exp: 0 },
  { id: 'cat-2', name: 'Mind(심신 안정)', description: '맑은 정신과 도심을 닦는 행위', exp: 0 },
  { id: 'cat-3', name: 'Wisdom(지식 정진)', description: '세상의 이치를 깨닫는 공부', exp: 0 },
];

export const DAOXIN_DEFAULT_SCHEDULES: Schedule[] = [
  {
    id: 'default-s1',
    scheduleCategory: 'habit',
    type: 'daily',
    completed: false,
    categoryId: 'cat-2',
    config: { name: 'Standing Meditation(참장공)', count: 0 }
  },
  {
    id: 'default-s2',
    scheduleCategory: 'habit',
    type: 'daily',
    completed: false,
    categoryId: 'cat-2',
    config: { name: 'Meditation(명상)', count: 0 }
  },
  {
    id: 'default-s3',
    scheduleCategory: 'habit',
    type: 'daily',
    completed: false,
    categoryId: 'cat-1',
    config: { name: 'Strength Training(근력 운동)', count: 0 }
  }
];

export const INVENTORY_STORAGE_KEY = 'DAOXIN_INVENTORY';

/**
 * 기본 제공 및 습득 가능한 공법 목록 프리셋
 */
export const DEFAULT_TECHNIQUES: Technique[] = [
  {
    id: 'tech-breathing',
    name: '토납심법(吐納心法)',
    nameKey: 'techBreathingName',
    description: '호흡을 가다듬어 체내 영기를 모읍니다. 수련 시 공력(Exp) +10% 추가 획득.',
    descKey: 'techBreathingDesc',
    type: 'exp_boost',
    tier: 1,
    maxTier: 5,
    exp: 0,
    maxExp: 100,
    multiplier: 1.1,
    requiredRealm: 1,
    icon: '🧘',
  },
  {
    id: 'tech-iron-body',
    name: '금강보체(金剛寶體)',
    nameKey: 'techIronBodyName',
    description: '육신을 바위처럼 단련합니다. 신체 수련 완료 시 추가 영석 획득.',
    descKey: 'techIronBodyDesc',
    type: 'category_boost',
    targetCategory: 'cat-1',
    tier: 1,
    maxTier: 5,
    exp: 0,
    maxExp: 150,
    multiplier: 1.25,
    requiredRealm: 20,
    icon: '🛡️',
  },
  {
    id: 'tech-purple-dawn',
    name: '자하진기(紫霞眞氣)',
    nameKey: 'techPurpleDawnName',
    description: '아침 해가 뜰 무렵의 동방 자기를 흡수합니다. 오전 8시 이전 수련 완료 시 공력 1.5배.',
    descKey: 'techPurpleDawnDesc',
    type: 'morning_boost',
    tier: 1,
    maxTier: 5,
    exp: 0,
    maxExp: 200,
    multiplier: 1.5,
    requiredRealm: 30,
    icon: '🌅',
  },
  {
    id: 'tech-immortal-mind',
    name: '불멸심인(不滅心印)',
    nameKey: 'techImmortalMindName',
    description: '마음의 중심을 굳건히 세워 하루 수련을 놓쳐도 연속 수련(Streak) 1회 보호.',
    descKey: 'techImmortalMindDesc',
    type: 'streak_shield',
    tier: 1,
    maxTier: 3,
    exp: 0,
    maxExp: 300,
    multiplier: 1.0,
    requiredRealm: 50,
    icon: '💎',
  }
];

export const DEFAULT_INVENTORY: UserInventory = {
  spiritStones: 50, // 초기 장려금 50 영석
  maxEquipSlots: 2,
  equippedTechniqueIds: ['tech-breathing'],
  ownedTechniques: [DEFAULT_TECHNIQUES[0]],
  consumables: {
    streakShields: 1, // 초기 보심단 1개 지급
  },
};

/**
 * 상점 판매 품목 프리셋
 */
export const DAOXIN_SHOP_ITEMS: ShopItem[] = [
  {
    id: 'shop-tech-iron-body',
    name: '금강보체 비급서',
    nameKey: 'shopIronBodyName',
    description: '신체 수련 특화 공법을 전수받을 수 있는 비급서.',
    descKey: 'shopIronBodyDesc',
    category: 'technique',
    price: 100,
    requiredRealm: 20,
    icon: '📜',
    techniqueId: 'tech-iron-body',
  },
  {
    id: 'shop-tech-purple-dawn',
    name: '자하진기 비급서',
    nameKey: 'shopPurpleDawnName',
    description: '미라클 모닝/아침 수련에 강력한 효능을 발휘하는 상급 비급.',
    descKey: 'shopPurpleDawnDesc',
    category: 'technique',
    price: 200,
    requiredRealm: 30,
    icon: '📜',
    techniqueId: 'tech-purple-dawn',
  },
  {
    id: 'shop-tech-immortal-mind',
    name: '불멸심인 비급서',
    nameKey: 'shopImmortalMindName',
    description: '연속 수련 실패를 방어해주는 절세 심법.',
    descKey: 'shopImmortalMindDesc',
    category: 'technique',
    price: 350,
    requiredRealm: 50,
    icon: '📜',
    techniqueId: 'tech-immortal-mind',
  },
  {
    id: 'shop-elixir-shield',
    name: '보심단(保心丹)',
    nameKey: 'shopElixirShieldName',
    description: '연속 수련이 끊겼을 때 사용하여 스트릭을 1회 복구하는 영약.',
    descKey: 'shopElixirShieldDesc',
    category: 'elixir',
    price: 40,
    requiredRealm: 1,
    icon: '💊',
  },
  {
    id: 'shop-elixir-boost',
    name: '청심환(淸心丸)',
    nameKey: 'shopElixirBoostName',
    description: '복용 후 24시간 동안 모든 수련 완료 시 공력 2배 획득.',
    descKey: 'shopElixirBoostDesc',
    category: 'elixir',
    price: 60,
    requiredRealm: 1,
    icon: '🍵',
    effectValue: 24, // 24시간
  },
];