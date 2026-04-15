export interface Schedule {
  id: string;
  scheduleCategory: ScheduleCategory;
  type: ScheduleType;

  categoryId?: string;
  startDate?: string;
  endDate?: string;

  config: IntervalConfig | GoalConfig | PeriodicConfig | habitConfig;
}

export type ScheduleCategory =
  | 'habit' // 0. 습관형
  | 'interval' // 1. 간격 기반
  | 'goal' // 2. 목표 달성형
  | 'periodic'; // 3. 주기 리셋형

export type ScheduleType = 'daily' | 'weekly' | 'monthly' | 'custom';
export interface ScheduleConfig {
  interval?: number;

  daysOfWeek?: number[];

  specificDates?: Date[];
}
interface BasicConfig  {
  name: string;
  description?: string;
}
export interface IntervalConfig extends BasicConfig {
  intervalDays: number;

  lastExecutedAt?: string;
  nextDueAt?: string;

  totalCount: number;
}
export interface GoalConfig extends BasicConfig {
  targetCount: number;
  currentCount: number;

  isCompleted: boolean;

  deadline?: string;
}
export interface PeriodicConfig extends BasicConfig {
  periodStart: string;
  periodEnd: string;

  periodCount: number; // 이번 주기 카운트
  totalCount: number; // 전체 누적

  lastResetAt: string;
}
export interface habitConfig extends BasicConfig {
  lastExecutedAt?: string;
  count: number;
}
