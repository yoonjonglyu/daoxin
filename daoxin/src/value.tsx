import type { Daoxin } from './types/daoxin';
import type { Category } from './types/category';
import type { Schedule } from './types/schedule';

export const DAOXIN = 'daoxin';
export const SALT = '일체유심조';
export const MIN_GAUGE = 1;
export const MAX_GAUGE = 78;
const now = new Date();
export const TODAY = `${now.getFullYear()}/${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')}`;
export const SCHEDULE_STORAGE_KEY = 'DAOXIN_SCHEDULE_LIST';
export const CATEGORY_STORAGE_KEY = 'DAOXIN_CATEGORY_LIST';
export const LOG_STORAGE_KEY = 'DAOXIN_ACTIVITY_LOGS';
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
  { id: 'cat-1', name: '신체 수련', description: '강건한 육신을 위한 정진', exp: 0 },
  { id: 'cat-2', name: '심신 안정', description: '맑은 정신과 도심을 닦는 행위', exp: 0 },
  { id: 'cat-3', name: '지식 정진', description: '세상의 이치를 깨닫는 공부', exp: 0 },
];

export const DAOXIN_DEFAULT_SCHEDULES: Schedule[] = [
  {
    id: 'default-s1',
    scheduleCategory: 'habit',
    type: 'daily',
    completed: false,
    categoryId: 'cat-2',
    config: { name: '참장공', count: 0 }
  },
  {
    id: 'default-s2',
    scheduleCategory: 'habit',
    type: 'daily',
    completed: false,
    categoryId: 'cat-2',
    config: { name: '명상', count: 0 }
  },
  {
    id: 'default-s3',
    scheduleCategory: 'habit',
    type: 'daily',
    completed: false,
    categoryId: 'cat-1',
    config: { name: '근력 운동', count: 0 }
  }
];