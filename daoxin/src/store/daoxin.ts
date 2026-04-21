import { atom } from 'jotai';
import type { Daoxin } from '../types/daoxin';

export const DaoXin = atom<Daoxin>({
  rank: '발심',
  gauge: 0,
  level: 1,
  exp: 0,
  streak: 0,
  totalCompleted: 0,
  updateAt: new Date().toISOString(),
});
