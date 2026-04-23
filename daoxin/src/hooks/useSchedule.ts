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
import { DAOXIN_DEFAULT_SCHEDULES, TODAY } from '../value';
import { saveEncryptedData, loadEncryptedData } from '../utils/storage';
import { calculateScheduleCompletion, refreshScheduleStatus } from '../services/scheduleService';
import { calculateNextPeriod } from '../utils/date';

const SCHEDULE_STORAGE_KEY = 'DAOXIN_SCHEDULE_LIST';

const useSchedule = () => {
  const [schedules, setSchedules] = useAtom(ScheduleList);
  const habitSchedules = useAtomValue(HabitSchedules);
  const goalSchedules = useAtomValue(GoalSchedules);
  const intervalSchedules = useAtomValue(IntervalSchedules);
  const periodicSchedules = useAtomValue(PeriodicSchedules);

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
    const next = schedules.map((s) =>
      s.id === id ? calculateScheduleCompletion(s) : s
    );

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
      config = { ...base, count: 0 };
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
      completed: false,
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
