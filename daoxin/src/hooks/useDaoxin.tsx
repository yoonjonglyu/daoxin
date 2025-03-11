import { useRecoilState } from 'recoil';

import { DaoXin, DailyList, DaoXinProps } from '../store/daoxin';

const DAOXIN = 'daoxin';
const SALT = '일체유심조'; // 로컬스토리지에 저장되는 데이터를 간단히 암호화해서 관리하자

const useDaoxin = () => {
  const [dao, setDao] = useRecoilState(DaoXin);
  const [dList, setDList] = useRecoilState(DailyList);

  const initDaoxin = () => {
    const state = localStorage.getItem(DAOXIN);
    if (state === null) {
      const defaultValue: DaoXinProps = {
        gauge: 1,
        list: [],
        updateAt: Date.toString(),
      };
      localStorage.setItem(DAOXIN, JSON.stringify(defaultValue));
      setDao(defaultValue);
    } else {
      const prevValue = JSON.parse(state) as DaoXinProps;
      // 시간이 지난 것에 따라서 updateAt를 갱신하고 수행하지 못한 과제가 있을시 하루당 1씩 gauge를 감소시킨다.
      setDao(prevValue);
    }
  };

  const checkList = (idx: number) => {
    // completed를 reduce로 받아서 모든 목록이 끝나면 gauge를 1증가시킨다.
    // list를 중간에 추가할시 관련해서 처리할 로직은 조금 고민해봐야함.
    setDList((prev) =>
      prev.map((i, _i) => (idx === _i ? { ...i, completed: true } : i)),
    );
  };

  return { dao, dList, initDaoxin, checkList };
};

export default useDaoxin;
