import { useAtom, useAtomValue } from 'jotai';
import type { Schedule } from '../types/schedule';
import {
  ScheduleList,
  HabitSchedules,
  GoalSchedules,
  IntervalSchedules,
  PeriodicSchedules,
} from '../store/schedule';
import {
  decryptData,
  encryptData,
  setLocalStorage,
  getLocalStorage,
} from 'isa-util';
import { SALT } from '../value';

const SCHEDULE_STORAGE_KEY = 'DAOXIN_SCHEDULE_LIST';

const useSchedule = () => {
  const [schedules, setSchedules] = useAtom(ScheduleList);
  const habitSchedules = useAtomValue(HabitSchedules);
  const goalSchedules = useAtomValue(GoalSchedules);
  const intervalSchedules = useAtomValue(IntervalSchedules);
  const periodicSchedules = useAtomValue(PeriodicSchedules);

  const _saveData = async (list: Schedule[]) => {
    try {
      const encryptedValue = await encryptData(
        JSON.stringify(list),
        SALT,
        SALT,
      );
      setLocalStorage(SCHEDULE_STORAGE_KEY, encryptedValue);
    } catch (error) {
      console.error('스케줄 저장 중 오류 발생:', error);
    }
  };

  const initSchedules = async () => {
    const storedData = getLocalStorage<any>(SCHEDULE_STORAGE_KEY);
    if (!storedData) return;

    try {
      const decrypted = await decryptData(
        storedData.encryptedData,
        storedData.iv,
        SALT,
        SALT,
      );
      setSchedules(JSON.parse(decrypted));
    } catch (error) {
      console.error('스케줄 로드 중 오류 발생:', error);
    }
  };

  const completeSchedule = (id: string) => {
    const next = schedules.map((s) =>
      s.id === id ? { ...s, completed: !s.completed } : s,
    );
    setSchedules(next);
    _saveData(next);
  };

  const editSchedule = (id: string, updatedFields: Partial<Schedule>) => {
    const next = schedules.map((s) =>
      s.id === id ? { ...s, ...updatedFields } : s,
    );
    setSchedules(next);
    _saveData(next);
  };

  const deleteSchedule = (id: string) => {
    const next = schedules.filter((s) => s.id !== id);
    setSchedules(next);
    _saveData(next);
  };

  const addSchedule = (newSchedule: Schedule) => {
    const next = [...schedules, newSchedule];
    setSchedules(next);
    _saveData(next);
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
