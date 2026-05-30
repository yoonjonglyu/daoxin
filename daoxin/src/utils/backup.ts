import { loadEncryptedData, saveEncryptedData } from './storage';
import { DAOXIN, SCHEDULE_STORAGE_KEY, CATEGORY_STORAGE_KEY, LOG_STORAGE_KEY } from '../value';

export interface DaoxinBackupData {
  daoxin: any;
  schedules: any[];
  categories: any[];
  logs: any[];
  version: string;
  exportedAt: string;
}

export const exportAllData = async (): Promise<DaoxinBackupData> => {
  const daoxin = await loadEncryptedData<any>(DAOXIN);
  const schedules = await loadEncryptedData<any[]>(SCHEDULE_STORAGE_KEY);
  const categories = await loadEncryptedData<any[]>(CATEGORY_STORAGE_KEY);
  const logs = await loadEncryptedData<any[]>(LOG_STORAGE_KEY);
  
  return {
    daoxin,
    schedules: schedules || [],
    categories: categories || [],
    logs: logs || [],
    version: '2.0.0',
    exportedAt: new Date().toISOString()
  };
};

export const importAllData = async (backup: DaoxinBackupData): Promise<boolean> => {
  if (
    !backup || 
    !backup.daoxin || 
    !Array.isArray(backup.schedules) || 
    !Array.isArray(backup.categories)
  ) {
    return false;
  }
  
  try {
    await saveEncryptedData(DAOXIN, backup.daoxin);
    await saveEncryptedData(SCHEDULE_STORAGE_KEY, backup.schedules);
    await saveEncryptedData(CATEGORY_STORAGE_KEY, backup.categories);
    await saveEncryptedData(LOG_STORAGE_KEY, backup.logs || []);
    return true;
  } catch (err) {
    console.error('Import failed:', err);
    return false;
  }
};
