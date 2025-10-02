import { useAtom } from 'jotai';
import {
  decryptData,
  encryptData,
  setLocalStorage,
  getLocalStorage,
} from 'isa-util';

import { DaoXin, DailyList, DaoXinProps } from '../store/daoxin';

import {
  DAOXIN,
  SALT,
  MIN_GAUGE,
  MAX_GAUGE,
  TODAY,
  DAOXIN_DEFAULT,
} from '../value';

const useDaoxin = () => {
  const [dao, setDao] = useAtom(DaoXin);
  const [dList, setDList] = useAtom(DailyList);

  const _saveData = async (value: DaoXinProps) => {
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
    const prev = _normalizeDate(new Date(prevDate));
    const curr = _normalizeDate(new Date(currentDate));
    const diffTime = curr.getTime() - prev.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

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
    const prevState: DaoXinProps = JSON.parse(decryptedState);
    const nextState = { ...DAOXIN_DEFAULT, ...prevState };

    const daysPassed = _getDaysDifference(prevState.updateAt, TODAY);
    if (daysPassed > 0) {
      const allTasksCompleted = prevState.list.every((task) => task.completed);
      if (allTasksCompleted)
        nextState.gauge = Math.min(MAX_GAUGE, prevState.gauge + 1);
      // 일괄적으로 지나간 일자만큼 gague를 감소시킨다.
      nextState.gauge = Math.max(MIN_GAUGE, prevState.gauge - daysPassed);
      // list 초기화 (completed: false, updateAt: today)
      nextState.list = prevState.list.map((task) => ({
        ...task,
        completed: false,
        updateAt: TODAY,
      }));

      nextState.updateAt = TODAY;
    }

    await _saveData(nextState);
    setDao(nextState);
  };
  const editList = (value: typeof dList) => {
    const updatedDao = {
      ...dao,
      list: value,
    };
    _saveData(updatedDao);
    setDList(value);
  };
  const checkList = async (idx: number) => {
    const { updatedList, allCompleted } = dList.reduce(
      (result, item, i) => {
        // list check.
        result.updatedList.push(
          i === idx
            ? {
                ...item,
                completed: true,
              }
            : item,
        );
        // allCompleted check.
        if (i !== idx && !item.completed) result.allCompleted = false;
        return result;
      },
      { updatedList: [] as typeof dList, allCompleted: true },
    );

    const updatedDao = {
      ...dao,
      list: updatedList,
    };

    if (allCompleted) {
      updatedDao.gauge = Math.min(MAX_GAUGE, dao.gauge + 1);
    }

    await _saveData(updatedDao);
    setDao(updatedDao);
  };

  return { dao, dList, initDaoxin, checkList, editList };
};

export default useDaoxin;
