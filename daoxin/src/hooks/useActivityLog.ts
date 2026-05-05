import { useAtom, useAtomValue } from 'jotai';
import { activityLogsAtom, dailyStatsAtom, weeklyStatsAtom, totalStatsAtom, monthlyStatsAtom } from '../store/activityLog';
import { ActivityLog } from '../types/activitylog';
import { saveEncryptedData, loadEncryptedData } from '../utils/storage';
import { LOG_STORAGE_KEY } from '../value';




export const useActivityLog = () => {
  const [logs, setLogs] = useAtom(activityLogsAtom);
  
  // 실시간 계산된 통계값들 (ReadOnly)
  const totalStats = useAtomValue(totalStatsAtom);
  const dailyStats = useAtomValue(dailyStatsAtom);
  const weeklyStats = useAtomValue(weeklyStatsAtom);
  const monthlyStats = useAtomValue(monthlyStatsAtom);
  // 초기 데이터 로드
  const initLogs = async () => {
    const savedLogs = await loadEncryptedData<ActivityLog[]>(LOG_STORAGE_KEY);
    if (savedLogs) {
      setLogs(savedLogs);
    } else {
      await saveEncryptedData(LOG_STORAGE_KEY, []);
      setLogs([]);
    }

  };

  // 새 로그 추가 및 저장
  const addLog = async (newLog: ActivityLog) => {
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    await saveEncryptedData(LOG_STORAGE_KEY, updatedLogs);
  };

  // 로그 삭제 (필요 시)
  const removeLog = async (logId: string) => {
    const updatedLogs = logs.filter(log => log.id !== logId);
    setLogs(updatedLogs);
    await saveEncryptedData(LOG_STORAGE_KEY, updatedLogs);
  };

  return {
    logs,
    dailyStats,
    weeklyStats,
    monthlyStats,
    totalStats,
    initLogs,
    addLog,
    removeLog,
  };
};

export default useActivityLog;