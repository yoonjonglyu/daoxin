export const DAOXIN = 'daoxin';
export const SALT = '일체유심조';
export const MIN_GAUGE = 1;
export const MAX_GAUGE = 78;
export const TODAY = new Date().toISOString().split('T')[0];
export const DAOXIN_LIST = [
  { idx: 0, todo: '참장공', completed: false, updateAt: TODAY },
  { idx: 1, todo: '명상', completed: false, updateAt: TODAY },
  { idx: 2, todo: '3대운동(헬스 또는 맨몸)', completed: false, updateAt: TODAY },
  { idx: 3, todo: '무술(심기체조율)', completed: false, updateAt: TODAY },
  { idx: 4, todo: '경구 묵상', completed: false, updateAt: TODAY },
];
export const DAOXIN_DEFAULT = {
  gauge: 1,
  list: DAOXIN_LIST,
  updateAt: TODAY,
};