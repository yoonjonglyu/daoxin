import { Daoxin } from '../types/daoxin';
import { MIN_GAUGE, TODAY } from '../value';

/**
 * 날짜 경과에 따른 도심(Daoxin) 패널티 적용
 */
export const applyDailyPenalty = (state: Daoxin, daysPassed: number): Daoxin => {
  if (daysPassed <= 0) return state;

  const nextGauge = Math.max(MIN_GAUGE, state.gauge - daysPassed);
  const nextStreak = daysPassed > 1 ? 0 : state.streak;

  return {
    ...state,
    gauge: nextGauge,
    streak: nextStreak,
    updateAt: TODAY,
  };
};