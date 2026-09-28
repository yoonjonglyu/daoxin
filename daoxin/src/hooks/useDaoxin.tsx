import { useAtom } from 'jotai';

import { DaoXin } from '../store/daoxin';
import type { Daoxin } from '../types/daoxin';

import {
  DAOXIN,
  getTodayString,
  DAOXIN_DEFAULT,
  INVENTORY_STORAGE_KEY,
} from '../value';
import { saveEncryptedData, loadEncryptedData } from '../utils/storage';
import { getDaysDifference } from '../utils/date';
import { applyDailyPenalty } from '../services/daoxinService';

const useDaoxin = () => {
  const [dao, setDao] = useAtom(DaoXin);

  // 앱 구동 시 도심 데이터 초기 로드 및 날짜 경과 처리
  const initDaoxin = async () => {
    const storedData = await loadEncryptedData<Daoxin>(DAOXIN);

    if (!storedData) {
      await saveEncryptedData(DAOXIN, DAOXIN_DEFAULT);
      setDao(DAOXIN_DEFAULT);
      return;
    }
    const nextState: Daoxin = { ...DAOXIN_DEFAULT, ...storedData };
    const today = getTodayString();
    const daysPassed = getDaysDifference(nextState.updateAt, today);
    
    if (daysPassed > 0) {
      let updatedState = applyDailyPenalty(nextState, daysPassed);

      // 스트릭이 끊길 상황(daysPassed > 1)인 경우 방어 아이템 및 공법 확인
      if (daysPassed > 1 && nextState.streak > 0) {
        const inv = await loadEncryptedData<any>(INVENTORY_STORAGE_KEY);
        if (inv) {
          const hasImmortalMind = inv.equippedTechniqueIds?.includes('tech-immortal-mind');
          const hasStreakShield = (inv.consumables?.streakShields || 0) > 0;

          if (hasImmortalMind || hasStreakShield) {
            // 스트릭 보존!
            updatedState = {
              ...updatedState,
              streak: nextState.streak,
            };

            // 보심단 우선 소모 (불멸심인은 패시브)
            if (hasStreakShield) {
              const updatedInv = {
                ...inv,
                consumables: {
                  ...inv.consumables,
                  streakShields: inv.consumables.streakShields - 1,
                },
              };
              await saveEncryptedData(INVENTORY_STORAGE_KEY, updatedInv);
            }
          }
        }
      }

      await saveEncryptedData(DAOXIN, updatedState);
      setDao(updatedState);
      return;
    }

    setDao(nextState);
  };

  return { 
    dao, 
    initDaoxin,
    updateDao: (newDao: Daoxin) => { setDao(newDao); saveEncryptedData(DAOXIN, newDao); } 
  };
};

export default useDaoxin;
