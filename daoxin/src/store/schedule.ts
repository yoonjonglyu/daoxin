import { atom } from 'jotai';
import type { Schedule } from '../types/schedule';

/**
 * 독립적인 스케줄(반복 규칙) 데이터 목록입니다.
 * 특정 카테고리 ID를 가질 수 있어 category와 느슨하게 연결됩니다.
 */
export const ScheduleList = atom<Schedule[]>([]);

export const SelectedScheduleId = atom<string | null>(null);

/**
 * [파생 상태] 습관형(habit) 수행 목록
 */
export const HabitSchedules = atom((get) => get(ScheduleList).filter((s) => s.scheduleCategory === 'habit'));

/**
 * [파생 상태] 간격 기반(interval) 수행 목록
 */
export const IntervalSchedules = atom((get) => get(ScheduleList).filter((s) => s.scheduleCategory === 'interval'));

/**
 * [파생 상태] 목표 달성형(goal) 수행 목록
 */
export const GoalSchedules = atom((get) => get(ScheduleList).filter((s) => s.scheduleCategory === 'goal'));

/**
 * [파생 상태] 주기 리셋형(periodic) 수행 목록
 */
export const PeriodicSchedules = atom((get) => get(ScheduleList).filter((s) => s.scheduleCategory === 'periodic'));