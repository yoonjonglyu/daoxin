import { useAtom } from 'jotai';
import { ScheduleList } from '../store/schedule';

const useSchedule = () => {
  const [schedules, setSchedules] = useAtom(ScheduleList);

  const completeSchedule = (id: string) => {
    // 일정 완료 처리 로직 (필요 시 확장)
    console.log(`Schedule ${id} completed`);
  };

  return { schedules, completeSchedule };
};

export default useSchedule;