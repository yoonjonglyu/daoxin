import { describe, it, expect } from 'vitest';
import { refreshScheduleStatus, calculateScheduleCompletion } from '../scheduleService';
import type { Schedule, HabitConfig, IntervalConfig, PeriodicConfig } from '../../types/schedule';

describe('scheduleService - refreshScheduleStatus (초기화 및 리셋)', () => {
  it('habit: 어제 완료된 습관은 오늘(날짜 변경 시) 미완료로 리셋되어야 한다', () => {
    const habit: Schedule = {
      id: 'h1',
      scheduleCategory: 'habit',
      type: 'daily',
      completed: true,
      categoryId: 'cat-1',
      config: { name: '명상', count: 1, lastExecutedAt: '2026/10/25' } as HabitConfig,
    };

    const refreshed = refreshScheduleStatus(habit, '2026/10/26');
    expect(refreshed.completed).toBe(false);
  });

  it('habit: 오늘 이미 완료한 습관은 완료 상태가 유지되어야 한다', () => {
    const habit: Schedule = {
      id: 'h1',
      scheduleCategory: 'habit',
      type: 'daily',
      completed: true,
      categoryId: 'cat-1',
      config: { name: '명상', count: 1, lastExecutedAt: '2026/10/26' } as HabitConfig,
    };

    const refreshed = refreshScheduleStatus(habit, '2026/10/26');
    expect(refreshed.completed).toBe(true);
  });

  it('interval: 설정된 간격(intervalDays)이 지나면 미완료로 리셋되어야 한다', () => {
    const intervalSchedule: Schedule = {
      id: 'i1',
      scheduleCategory: 'interval',
      type: 'daily',
      completed: true,
      config: {
        name: '단식 수련',
        totalCount: 1,
        intervalDays: 3,
        lastExecutedAt: '2026/10/20',
      } as IntervalConfig,
    };

    // 3일 이상 경과 (2026/10/24)
    const refreshed = refreshScheduleStatus(intervalSchedule, '2026/10/24');
    expect(refreshed.completed).toBe(false);
  });

  it('interval: 설정된 간격이 아직 지나지 않았다면 완료 상태가 유지되어야 한다', () => {
    const intervalSchedule: Schedule = {
      id: 'i1',
      scheduleCategory: 'interval',
      type: 'daily',
      completed: true,
      config: {
        name: '단식 수련',
        totalCount: 1,
        intervalDays: 3,
        lastExecutedAt: '2026/10/20',
      } as IntervalConfig,
    };

    // 2일 경과 (2026/10/22)
    const refreshed = refreshScheduleStatus(intervalSchedule, '2026/10/22');
    expect(refreshed.completed).toBe(true);
  });

  it('periodic: 주기 종료일(periodEnd)이 지나면 새로운 주기가 계산되고 periodCount가 0으로 리셋되어야 한다', () => {
    const periodicSchedule: Schedule = {
      id: 'p1',
      scheduleCategory: 'periodic',
      type: 'weekly',
      completed: true,
      config: {
        name: '주간 등산',
        periodTarget: 2,
        periodCount: 2,
        totalCount: 10,
        periodStart: '2026/10/12',
        periodEnd: '2026/10/18',
        lastResetAt: '2026/10/12',
      } as PeriodicConfig,
    };

    const refreshed = refreshScheduleStatus(periodicSchedule, '2026/10/26');
    const newConfig = refreshed.config as PeriodicConfig;

    expect(refreshed.completed).toBe(false);
    expect(newConfig.periodCount).toBe(0);
    expect(newConfig.periodStart).toBeDefined();
    expect(newConfig.periodEnd).toBeDefined();
    expect(newConfig.periodEnd >= '2026/10/26').toBe(true);
  });
});

describe('scheduleService - calculateScheduleCompletion (수행 완료 계산)', () => {
  it('habit: 완료 시 completed가 true가 되고 lastExecutedAt이 오늘로 기록되어야 한다', () => {
    const habit: Schedule = {
      id: 'h1',
      scheduleCategory: 'habit',
      type: 'daily',
      completed: false,
      config: { name: '명상', count: 0 } as HabitConfig,
    };

    const completed = calculateScheduleCompletion(habit, '2026/10/26');
    expect(completed.completed).toBe(true);
    expect((completed.config as HabitConfig).lastExecutedAt).toBe('2026/10/26');
  });

  it('habit: 이미 완료된 습관을 다시 완료 시도하면 중복 완료되지 않고 원본 객체를 반환해야 한다', () => {
    const habit: Schedule = {
      id: 'h1',
      scheduleCategory: 'habit',
      type: 'daily',
      completed: true,
      config: { name: '명상', count: 1, lastExecutedAt: '2026/10/26' } as HabitConfig,
    };

    const result = calculateScheduleCompletion(habit, '2026/10/26');
    expect(result).toBe(habit); // 중복 방어
  });
});
