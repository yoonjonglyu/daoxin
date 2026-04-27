import { ActivityLog } from '../types/activitylog';

/**
 * 통계 결과 인터페이스
 */
export interface ActivityStats {
  totalExp: number;
  totalGauge: number;
  completedCount: number;
  // 카테고리별 정진 횟수 distribution (예: { "신체 수련": 5, "지식 정진": 2 })
  categoryDistribution: Record<string, number>;
  // 일정 타입별 정진 횟수 (예: { "habit": 10, "goal": 3 })
  typeDistribution: Record<string, number>;
}

/**
 * 주어진 로그 배열을 기반으로 통계를 집계합니다.
 */
export const aggregateStats = (logs: ActivityLog[]): ActivityStats => {
  const initialStats: ActivityStats = {
    totalExp: 0,
    totalGauge: 0,
    completedCount: 0,
    categoryDistribution: {},
    typeDistribution: {},
  };

  return logs.reduce((acc, log) => {
    acc.totalExp += log.earnedExp;
    acc.totalGauge += log.earnedGauge;
    acc.completedCount += 1;

    // 카테고리별 분포 계산
    const catName = log.categoryName || '기타';
    acc.categoryDistribution[catName] = (acc.categoryDistribution[catName] || 0) + 1;

    // 일정 타입별 분포 계산
    acc.typeDistribution[log.scheduleCategory] = (acc.typeDistribution[log.scheduleCategory] || 0) + 1;

    return acc;
  }, initialStats);
};

/**
 * 일간 통계: 특정 날짜(YYYY-MM-DD)의 로그만 필터링하여 집계
 */
export const getDailyStats = (logs: ActivityLog[], dateStr: string): ActivityStats => {
  const filtered = logs.filter(log => log.executedAt.startsWith(dateStr));
  return aggregateStats(filtered);
};

/**
 * 주간 통계: 특정 날짜를 기준으로 해당 주의 시작(월요일)부터 끝(일요일)까지 집계
 */
export const getWeeklyStats = (logs: ActivityLog[], targetDate: Date): ActivityStats => {
  const start = new Date(targetDate);
  const day = start.getDay();
  // 월요일로 세팅 (일요일이 0인 경우 처리)
  const diff = start.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(start.setDate(diff));
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const filtered = logs.filter(log => {
    const logDate = new Date(log.executedAt);
    return logDate >= monday && logDate <= sunday;
  });

  return aggregateStats(filtered);
};

/**
 * 월간 통계: 특정 년/월의 로그 집계
 */
export const getMonthlyStats = (logs: ActivityLog[], year: number, month: number): ActivityStats => {
  // month는 0부터 시작 (Jan=0)
  const start = new Date(year, month, 1, 0, 0, 0, 0);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);

  const filtered = logs.filter(log => {
    const logDate = new Date(log.executedAt);
    return logDate >= start && logDate <= end;
  });

  return aggregateStats(filtered);
};