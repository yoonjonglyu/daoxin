import { useAtom } from 'jotai';

import { DaoXin } from '../store/daoxin';
import type { Daoxin } from '../types/daoxin';

import {
  DAOXIN,
  TODAY,
  DAOXIN_DEFAULT,
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
    const daysPassed = getDaysDifference(nextState.updateAt, TODAY);
    
    if (daysPassed > 0) {
      const updatedState = applyDailyPenalty(nextState, daysPassed);
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
