import { useAtom } from 'jotai';
import { decryptData, encryptData, encryptedDataProps } from '../utils/crypt';

import { DaoXin, DailyList, DaoXinProps } from '../store/daoxin';

import { DAOXIN, SALT, MIN_GAUGE, MAX_GAUGE, TODAY, DAOXIN_DEFAULT } from '../value';

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
        localStorage.setItem(DAOXIN, JSON.stringify(encryptedValue));
      } else {
        console.error('localStorage is not supported in this environment.');
      }
    } catch (error) {
      console.error('데이터 저장 중 오류 발생:', error);
    }
  };

  const _getDaysDifference = (prevDate: string, currentDate: string) => {
    const prev = new Date(prevDate);
    const curr = new Date(currentDate);
    prev.setHours(0, 0, 0, 0); // 시간을 00:00:00으로 설정
    curr.setHours(0, 0, 0, 0); // 시간을 00:00:00으로 설정
    const diffTime = curr.getTime() - prev.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)); // 밀리초 -> 일(day) 변환
  };

  const initDaoxin = async () => {
    const storedData = localStorage.getItem(DAOXIN);

    if (!storedData) {
      await _saveData(DAOXIN_DEFAULT);
      setDao(DAOXIN_DEFAULT);
      return;
    }

    const encrypted = JSON.parse(storedData) as encryptedDataProps;
    const decryptedState = await decryptData(
      encrypted.encryptedData,
      encrypted.iv,
      SALT,
      SALT,
    );
    const prevState: DaoXinProps = JSON.parse(decryptedState);

    const daysPassed = _getDaysDifference(prevState.updateAt, TODAY);

    if (daysPassed > 0) {
      const allTasksCompleted = prevState.list.every((task) => task.completed);
      if (allTasksCompleted)
        prevState.gauge = Math.min(MAX_GAUGE, prevState.gauge + 1);
      // 일괄적으로 지나간 일자만큼 gague를 감소시킨다.
      prevState.gauge = Math.max(MIN_GAUGE, prevState.gauge - daysPassed);
      // list 초기화 (completed: false, updateAt: today)
      prevState.list = prevState.list.map((task) => ({
        ...task,
        completed: false,
        updateAt: TODAY,
      }));

      prevState.updateAt = TODAY;
    }

    await _saveData(prevState);
    setDao(prevState);
    setDList(prevState.list);
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
      updatedDao.updateAt = TODAY; // YYYY-MM-DD
      updatedDao.gauge = Math.min(MAX_GAUGE, dao.gauge + 1);
    }

    await _saveData(updatedDao);
    setDList(updatedList);
    setDao(updatedDao);
  };

  return { dao, dList, initDaoxin, checkList, editList };
};

export default useDaoxin;
