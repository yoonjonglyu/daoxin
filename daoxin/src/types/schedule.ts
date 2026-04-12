export interface Schedule {
  id: string;
  type: ScheduleType;

  startDate?: string;
  endDate?: string;

  config: IntervalConfig | GoalConfig | PeriodicConfig;
}

export type ScheduleType =
  | "daily"
  | "weekly"
  | "custom"
  | "manual"
    | "interval"     // 1. 간격 기반
  | "goal"         // 2. 목표 달성형
  | "periodic";    // 3. 주기 리셋형

export interface ScheduleConfig {
  interval?: number

  daysOfWeek?: number[]

  specificDates?: Date[]
}
export interface IntervalConfig {
  intervalDays: number;

  lastExecutedAt?: string;
  nextDueAt?: string;

  totalCount: number;
}
export interface GoalConfig {
  targetCount: number;
  currentCount: number;

  isCompleted: boolean;

  deadline?: string;
}
export interface PeriodicConfig {
  periodType: "daily" | "weekly" | "monthly";

  periodStart: string;
  periodEnd: string;

  periodCount: number; // 이번 주기 카운트
  totalCount: number;  // 전체 누적

  lastResetAt: string;
}