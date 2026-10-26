import { Daoxin } from '../types/daoxin';
import { ScheduleCategory } from '../types/schedule';
import { MIN_GAUGE, MAX_GAUGE, getTodayString } from '../value';

/**
 * 수련 종류별 기본 공력(Exp) 보상 설정
 */
export const CATEGORY_REWARDS: Record<ScheduleCategory, number> = {
  habit: 2,
  goal: 5,
  interval: 3,
  periodic: 2,
};

/**
 * 날짜 경과에 따른 도심(Daoxin) 패널티 적용 (게이지 감소)
 */
export const applyDailyPenalty = (state: Daoxin, daysPassed: number): Daoxin => {
  const today = getTodayString();
  if (daysPassed <= 0) return state;

  // 패널티 설정이 꺼져있다면 날짜만 갱신하고 게이지는 유지
  if (state.penalty && !state.penalty.enabled) return { ...state, updateAt: today };

  // 수행을 온전히 건너뛴 결석 일수 (어제 수련 후 오늘 접속 시 daysPassed=1 이므로 결석 0일, 하루 건너뛰면 1일)
  const missedDays = Math.max(0, daysPassed - 1);
  const nextGauge = Math.max(MIN_GAUGE, state.gauge - missedDays);
  const nextStreak = daysPassed > 1 ? 0 : state.streak;

  return {
    ...state,
    gauge: nextGauge,
    streak: nextStreak,
    updateAt: today,
  };
};

/**
 * 수련 완료 시 도심(Daoxin) 경험치 상승 및 통계 업데이트
 */
export const earnExp = (state: Daoxin, amount: number = 1): Daoxin => {
  const nextExp = state.exp + amount;
  const nextLevel = Math.floor(nextExp / 100) + 1;

  return {
    ...state,
    exp: nextExp,
    level: nextLevel,
    totalCompleted: state.totalCompleted + 1,
    updateAt: getTodayString(),
  };
};

/**
 * 모든 습관 달성 시 도심(Daoxin) 게이지 상승
 */
export const earnGauge = (state: Daoxin, amount: number = 1): Daoxin => {
  return {
    ...state,
    streak: state.streak + 1,
    gauge: Math.min(MAX_GAUGE, state.gauge + amount),
    updateAt: getTodayString(),
  };
};
