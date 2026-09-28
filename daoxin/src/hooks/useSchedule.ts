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
import { calculateNextPeriod, formatDate } from '../utils/date';
import { earnExp, earnGauge, CATEGORY_REWARDS } from '../services/daoxinService';
import { calculateScheduleCompletion, refreshScheduleStatus } from '../services/scheduleService';

import useDaoxin from './useDaoxin';
import useCategory from './useCategory';
import useActivityLog from './useActivityLog';
import useInventory from './useInventory';
import { calculateCultivationReward, trainEquippedTechniques } from '../services/techniqueService';

import { DAOXIN_DEFAULT_SCHEDULES, getTodayString, SCHEDULE_STORAGE_KEY } from '../value';

const useSchedule = () => {
  const [schedules, setSchedules] = useAtom(ScheduleList);
  const habitSchedules = useAtomValue(HabitSchedules);
  const goalSchedules = useAtomValue(GoalSchedules);
  const intervalSchedules = useAtomValue(IntervalSchedules);
  const periodicSchedules = useAtomValue(PeriodicSchedules);
  const { dao, updateDao } = useDaoxin();
  const { categories, addCategoryExp } = useCategory();
  const { addLog } = useActivityLog();
  const { inventory, addSpiritStones, updateInventory } = useInventory();

  const initSchedules = async () => {
    const data = await loadEncryptedData<Schedule[]>(SCHEDULE_STORAGE_KEY);
    let list = data || DAOXIN_DEFAULT_SCHEDULES;

    const today = getTodayString();
    // 각 스케줄의 주기/날짜 기반 상태 갱신 (로컬 오늘 날짜 기준)
    const refreshedList = list.map(s => refreshScheduleStatus(s, today));
    
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
    const baseReward = CATEGORY_REWARDS[updated.scheduleCategory];
    let currentDao = dao;
    let earnedExp = 0;
    let earnedGauge = 0;

    // 공법 및 영약 버프를 적용한 보상 계산
    const currentCategory = categories.find((c) => c.id === updated.categoryId);
    const calculated = calculateCultivationReward(inventory, {
      baseExp: baseReward,
      baseGauge: 0,
      scheduleCategory: updated.scheduleCategory,
      categoryId: updated.categoryId,
      categoryName: currentCategory?.name,
      currentDate: new Date(),
    });

    // 1. 경험치(Exp): 어떤 스케줄이든 개별 항목이 완료될 때마다 즉시 반영
    if (target.scheduleCategory === 'periodic' || (!target.completed && updated.completed)) {
      currentDao = earnExp(currentDao, calculated.finalExp);
      if (updated.categoryId) addCategoryExp(updated.categoryId, calculated.finalExp);
      earnedExp = calculated.finalExp;

      // 영석(Spirit Stones) 획득 및 장착 공법 숙련도 상승
      addSpiritStones(calculated.spiritStones);
      const { updatedTechniques } = trainEquippedTechniques(
        inventory.ownedTechniques,
        inventory.equippedTechniqueIds,
        15
      );
      updateInventory({
        ...inventory,
        ownedTechniques: updatedTechniques,
      });
    }

    // 2. 게이지(Gauge): 습관(habit) 카테고리의 모든 항목을 마쳤을 때만 상승
    if (updated.scheduleCategory === 'habit') {
      const prevHabits = schedules.filter((s) => s.scheduleCategory === 'habit');
      const nextHabits = next.filter((s) => s.scheduleCategory === 'habit');
      const wasAllDone = prevHabits.length > 0 && prevHabits.every((h) => h.completed);
      const isAllDone = nextHabits.length > 0 && nextHabits.every((h) => h.completed);

      if (!wasAllDone && isAllDone) {
        const finalGauge = baseReward + calculated.finalGauge;
        currentDao = earnGauge(currentDao, finalGauge);
        earnedGauge = finalGauge;
        // 하루 모든 습관 완수 보너스 영석 지급
        addSpiritStones(20);
      }
    }

    if (currentDao !== dao) {
      updateDao(currentDao);

      // 액티비티 로그 저장
      const category = categories.find(c => c.id === updated.categoryId);
      addLog({
        id: Date.now().toString(),
        daoxinId: 'root', // 시스템 기본 ID
        scheduleId: updated.id,
        scheduleName: updated.config.name,
        categoryId: updated.categoryId,
        categoryName: category?.name || '기타',
        scheduleCategory: updated.scheduleCategory,
        executedAt: new Date().toISOString(),
        earnedExp,
        earnedGauge,
      });
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
    const today = getTodayString();
    if (selectedCategory === 'habit') {
      config = { ...base, count: 0, lastExecutedAt: today };
    } else if (selectedCategory === 'goal') {
      config = { ...base, targetCount: goalTarget || 1, currentCount: 0, isCompleted: false };
    } else if (selectedCategory === 'interval') {
      config = { ...base, intervalDays: intervalDays || 1, totalCount: 0 };
    } else {
      // periodic: 추가 시점 기준 첫 주기 계산
      // 어제가 종료일이었다고 가정하고 오늘부터 시작되는 주기를 계산함
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const initialRange = calculateNextPeriod(formatDate(yesterday), type);

      config = {
        ...base,
        periodStart: initialRange.start,
        periodEnd: initialRange.end,
        periodCount: 0,
        totalCount: 0,
        lastResetAt: today,
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
