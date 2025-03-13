import { atom, PrimitiveAtom } from 'jotai';

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
  gauge: 1,
  list: [],
  updateAt: '',
});

export const DailyList = atom(
  (get) => get(DaoXin).list,
  (get, set, value) => {
    const prev = get(DaoXin);
    prev.list = value as Array<DaoXinListProps>;
    set(DaoXin, prev);
  },
);
