import { useAtom, useAtomValue } from 'jotai';
import type {
  Schedule,
} from '../types/schedule';
import {
  ScheduleList,
  HabitSchedules,
  GoalSchedules,
  IntervalSchedules,
  PeriodicSchedules,
} from '../store/schedule';

import { saveEncryptedData, loadEncryptedData } from '../utils/storage';
import { calculateNextPeriod } from '../utils/date';
import { earnExp, earnGauge, CATEGORY_REWARDS } from '../services/daoxinService';
import { calculateScheduleCompletion, refreshScheduleStatus } from '../services/scheduleService';

import useDaoxin from './useDaoxin';
import useCategory from './useCategory';

import { DAOXIN_DEFAULT_SCHEDULES, TODAY, SCHEDULE_STORAGE_KEY } from '../value';

const useSchedule = () => {
  const [schedules, setSchedules] = useAtom(ScheduleList);
  const habitSchedules = useAtomValue(HabitSchedules);
  const goalSchedules = useAtomValue(GoalSchedules);
  const intervalSchedules = useAtomValue(IntervalSchedules);
  const periodicSchedules = useAtomValue(PeriodicSchedules);
  const { dao, updateDao } = useDaoxin();
  const { addCategoryExp } = useCategory();

  const initSchedules = async () => {
    const data = await loadEncryptedData<Schedule[]>(SCHEDULE_STORAGE_KEY);
    let list = data || DAOXIN_DEFAULT_SCHEDULES;

    // 각 스케줄의 주기/날짜 기반 상태 갱신
    const refreshedList = list.map(s => refreshScheduleStatus(s));
    
    // 변경사항이 있거나 신규 데이터인 경우 저장
    await saveEncryptedData(SCHEDULE_STORAGE_KEY, refreshedList);
    setSchedules(refreshedList);
  };

  const completeSchedule = (id: string) => {
    const target = schedules.find((s) => s.id === id);
    if (!target) return;

    const updated = calculateScheduleCompletion(target);
    if (target === updated && target.scheduleCategory !== 'periodic') return; // 변화가 없으면 종료 (예: 이미 완료된 습관 중복 클릭)

    const next = schedules.map((s) => (s.id === id ? updated : s));

    // 보상 로직 분리
    const reward = CATEGORY_REWARDS[updated.scheduleCategory];
    let currentDao = dao;

    // 1. 경험치(Exp): 어떤 스케줄이든 개별 항목이 완료될 때마다 즉시 반영
    if (target.scheduleCategory === 'periodic' || (!target.completed && updated.completed)) {
      currentDao = earnExp(currentDao, reward);
      if (updated.categoryId) addCategoryExp(updated.categoryId, reward);
    }

    // 2. 게이지(Gauge): 습관(habit) 카테고리의 모든 항목을 마쳤을 때만 상승
    if (updated.scheduleCategory === 'habit') {
      const prevHabits = schedules.filter((s) => s.scheduleCategory === 'habit');
      const nextHabits = next.filter((s) => s.scheduleCategory === 'habit');
      const wasAllDone = prevHabits.length > 0 && prevHabits.every((h) => h.completed);
      const isAllDone = nextHabits.length > 0 && nextHabits.every((h) => h.completed);

      if (!wasAllDone && isAllDone) {
        currentDao = earnGauge(currentDao, reward);
      }
    }

    if (currentDao !== dao) {
      updateDao(currentDao);
    }

    setSchedules(next);
    saveEncryptedData(SCHEDULE_STORAGE_KEY, next);
  };

  const editSchedule = (id: string, updatedFields: Partial<Schedule>) => {
    const next = schedules.map((s) =>
      s.id === id ? { ...s, ...updatedFields } : s,
    );
    setSchedules(next);
    saveEncryptedData(SCHEDULE_STORAGE_KEY, next);
  };

  const deleteSchedule = (id: string) => {
    const next = schedules.filter((s) => s.id !== id);
    setSchedules(next);
    saveEncryptedData(SCHEDULE_STORAGE_KEY, next);
  };

  const addSchedule = ({
    newTaskName,
    selectedCategory,
    type,
    selectedUserCategoryId,
    goalTarget,
    intervalDays,
  }: {
    newTaskName: string;
    selectedCategory: Schedule['scheduleCategory'];
    type: Schedule['type'];
    selectedUserCategoryId?: string;
    goalTarget?: number;
    intervalDays?: number;
  }) => {
    let config: Schedule['config'];
    const base = { name: newTaskName };

    // 카테고리에 따른 필수 데이터 초기화
    if (selectedCategory === 'habit') {
      config = { ...base, count: 0, lastExecutedAt: TODAY };
    } else if (selectedCategory === 'goal') {
      config = { ...base, targetCount: goalTarget || 1, currentCount: 0, isCompleted: false };
    } else if (selectedCategory === 'interval') {
      config = { ...base, intervalDays: intervalDays || 1, totalCount: 0 };
    } else {
      // periodic: 추가 시점 기준 첫 주기 계산
      // 어제가 종료일이었다고 가정하고 오늘부터 시작되는 주기를 계산함
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const initialRange = calculateNextPeriod(yesterday.toISOString(), type);

      config = {
        ...base,
        periodStart: initialRange.start,
        periodEnd: initialRange.end,
        periodCount: 0,
        totalCount: 0,
        lastResetAt: TODAY,
      };
    }

    const newSchedule: Schedule = {
      id: Date.now().toString(),
      scheduleCategory: selectedCategory,
      type: type,
      completed: selectedCategory === 'habit' ? true : false,
      categoryId: selectedUserCategoryId || undefined,
      config,
    };
    const next = [...schedules, newSchedule];
    setSchedules(next);
    saveEncryptedData(SCHEDULE_STORAGE_KEY, next);
  };

  return {
    schedules,
    habitSchedules,
    goalSchedules,
    intervalSchedules,
    periodicSchedules,
    completeSchedule,
    editSchedule,
    deleteSchedule,
    addSchedule,
    initSchedules,
  };
};

export default useSchedule;
