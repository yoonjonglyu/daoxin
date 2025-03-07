import { atom, selector } from 'recoil';

export interface DaoXinProps {
  list: Array<DaoXinListProps>;
  gauge: number;
  updateAt: string;
}

export type DaoXinListProps = {
  idx: number;
  todo: string;
  completed: boolean;
  updateAt: string;
};

export const DaoXin = atom<DaoXinProps>({
  key: 'daoxin',
  default: {
    gauge: 1,
    list: [],
    updateAt: '',
  },
});

export const DailyList = selector({
  key: 'dailylist',
  get: ({ get }) => {
    return get(DaoXin).list;
  },
  set: ({ get, set }, value) => {
    const prev = get(DaoXin);
    prev.list = value as Array<DaoXinListProps>;
    set(DaoXin, prev);
  },
});
