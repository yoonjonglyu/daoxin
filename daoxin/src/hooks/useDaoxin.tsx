import { useAtom } from 'jotai';
import { decryptData, encryptData, encryptedDataProps } from '../utils/crypt';

import { DaoXin, DailyList, DaoXinProps } from '../store/daoxin';

const DAOXIN = 'daoxin';
const SALT = '일체유심조';

const useDaoxin = () => {
  const [dao, setDao] = useAtom(DaoXin);
  const [dList, setDList] = useAtom(DailyList);

  const initDaoxin = async () => {
    const state = localStorage.getItem(DAOXIN);
    if (state === null) {
      const defaultValue: DaoXinProps = {
        gauge: 1,
        list: [
          {
            idx: 0,
            todo: '참장공',
            completed: false,
            updateAt: new Date().toLocaleDateString(),
          },
          {
            idx: 1,
            todo: '명상',
            completed: false,
            updateAt: new Date().toLocaleDateString(),
          },
          {
            idx: 2,
            todo: '운동',
            completed: false,
            updateAt: new Date().toLocaleDateString(),
          },
        ],
        updateAt: new Date().toLocaleDateString(),
      };
      localStorage.setItem(
        DAOXIN,
        JSON.stringify(
          await encryptData(JSON.stringify(defaultValue), SALT, SALT),
        ),
      );
      setDao(defaultValue);
    } else {
      const encrypt = JSON.parse(state) as encryptedDataProps;
      const prevState = await decryptData(
        encrypt.encryptedData,
        encrypt.iv,
        SALT,
        SALT,
      );
      // 시간이 지난 것에 따라서 updateAt를 갱신하고 수행하지 못한 과제가 있을시 하루당 1씩 gauge를 감소시킨다.
      setDao(JSON.parse(prevState));
    }
  };

  const checkList = (idx: number) => {
    // completed를 reduce로 받아서 모든 목록이 끝나면 gauge를 1증가시킨다.
    // list를 중간에 추가할시 관련해서 처리할 로직은 조금 고민해봐야함.
    setDList((prev: any[]) =>
      prev.map((i: any, _i: number) =>
        idx === _i ? { ...i, completed: true } : i,
      ),
    );
  };

  return { dao, dList, initDaoxin, checkList };
};

export default useDaoxin;
