import { atom } from 'jotai';
import { ActivityLog } from '../types/activitylog';
import { 
  aggregateStats, 
  getDailyStats, 
  getWeeklyStats, 
  getMonthlyStats 
} from '../services/statisticsService';
import { TODAY } from '../value';

// 전체 로그를 저장하는 기본 아톰
export const activityLogsAtom = atom<ActivityLog[]>([]);

// 모든 로그를 기반으로 한 전체 통계 (파생 아톰)
export const totalStatsAtom = atom((get) => {
  const logs = get(activityLogsAtom);
  return aggregateStats(logs);
});

// 오늘 날짜 기준의 통계 (파생 아톰)
export const dailyStatsAtom = atom((get) => {
  const logs = get(activityLogsAtom);
  return getDailyStats(logs, TODAY.replace(/\//g, '-')); // YYYY-MM-DD 형식 대응
});

// 이번 주 통계 (파생 아톰)
export const weeklyStatsAtom = atom((get) => {
  const logs = get(activityLogsAtom);
  return getWeeklyStats(logs, new Date());
});