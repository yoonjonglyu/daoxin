import { useAtom } from 'jotai';
import {
  decryptData,
  encryptData,
  setLocalStorage,
  getLocalStorage,
} from 'isa-util';

import { DaoXin } from '../store/daoxin';
import type { Daoxin } from '../types/daoxin';

import {
  DAOXIN,
  SALT,
  MIN_GAUGE,
  TODAY,
  DAOXIN_DEFAULT,
} from '../value';

const useDaoxin = () => {
  const [dao, setDao] = useAtom(DaoXin);

  // 도심 데이터 암호화 저장
  const _saveData = async (value: Daoxin) => {
    try {
      const encryptedValue = await encryptData(
        JSON.stringify(value),
        SALT,
        SALT,
      );
      if (typeof localStorage !== 'undefined') {
        setLocalStorage(DAOXIN, encryptedValue);
      } else {
        console.error('localStorage is not supported in this environment.');
      }
    } catch (error) {
      console.error('데이터 저장 중 오류 발생:', error);
    }
  };

  const _normalizeDate = (date: Date) => {
    const normalized = new Date(date);
    normalized.setHours(6, 0, 0, 0); // 하루 시작을 06:00으로
    // 만약 지금 시간이 6시 이전이라면, 어제를 기준으로 밀어줌
    if (date.getHours() < 6) {
      normalized.setDate(normalized.getDate() - 1);
    }
    return normalized;
  };

  const _getDaysDifference = (prevDate: string, currentDate: string) => {
    const prev = _normalizeDate(new Date(prevDate.replace(/-/g, '/')));
    const curr = _normalizeDate(new Date(currentDate.replace(/-/g, '/')));
    const diffTime = curr.getTime() - prev.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  // 앱 구동 시 도심 데이터 초기 로드 및 날짜 경과 처리
  const initDaoxin = async () => {
    const storedData = getLocalStorage<string>(DAOXIN);

    if (!storedData) {
      await _saveData(DAOXIN_DEFAULT);
      setDao(DAOXIN_DEFAULT);
      return;
    }
    const encrypted = storedData as any;
    const decryptedState = await decryptData(
      encrypted.encryptedData,
      encrypted.iv,
      SALT,
      SALT,
    );
    const prevState: Daoxin = JSON.parse(decryptedState);
    const nextState: Daoxin = { ...DAOXIN_DEFAULT, ...prevState };

    const daysPassed = _getDaysDifference(prevState.updateAt, TODAY);
    
    // 날짜가 지났을 경우 게이지 감소 처리
    if (daysPassed > 0) {
      // 수행을 거른 일수만큼 도심 게이지 감소
      nextState.gauge = Math.max(MIN_GAUGE, nextState.gauge - daysPassed);
      
      // 1일 이상 수행을 하지 않았다면 연속 정진(Streak) 초기화
      if (daysPassed > 1) {
        nextState.streak = 0;
      }

      nextState.updateAt = TODAY;
      await _saveData(nextState);
    }

    setDao(nextState);
  };

  return { 
    dao, 
    initDaoxin,
    updateDao: (newDao: Daoxin) => { setDao(newDao); _saveData(newDao); } 
  };
};

export default useDaoxin;
