import { TODAY } from "../value";

export const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}/${m}/${d}`;
};

export const normalizeDate = (date: Date) => {
  const normalized = new Date(date);
  normalized.setHours(6, 0, 0, 0); // 하루 시작을 06:00으로
  // 만약 지금 시간이 6시 이전이라면, 어제를 기준으로 밀어줌
  if (date.getHours() < 6) {
    normalized.setDate(normalized.getDate() - 1);
  }
  return normalized;
};

export const getDaysDifference = (prevDate: string, currentDate: string) => {
  const prev = normalizeDate(new Date(prevDate.replace(/-/g, '/')));
  const curr = normalizeDate(new Date(currentDate.replace(/-/g, '/')));
  const diffTime = curr.getTime() - prev.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * 주기에 따른 다음 기간의 시작일과 종료일을 계산
 */
export const calculateNextPeriod = (currentEnd: string, type: string) => {
  const startDate = new Date(currentEnd.replace(/\//g, '-'));
  startDate.setDate(startDate.getDate() + 1); // 기존 종료일 다음날부터 시작

  const endDate = new Date(startDate);
  if (type === 'daily') {
    // daily는 시작일과 종료일이 같음
  } else if (type === 'weekly') {
    endDate.setDate(endDate.getDate() + 6);
  } else if (type === 'monthly') {
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(endDate.getDate() - 1);
  }
  // custom 등은 기본적으로 일주일 단위로 처리하거나 확장이 필요함

  return { start: formatDate(startDate), end: formatDate(endDate) };
};

/**
 * Interval 스케줄의 다음 수행 가능일까지 남은 일수를 계산합니다.
 * @param lastExecutedAt 마지막 수행일 (YYYY/MM/DD)
 * @param intervalDays 간격 (일)
 * @returns 남은 일수 (0이면 오늘부터 가능, 양수면 남은 일수)
 */
export const getIntervalRemainingDays = (lastExecutedAt: string, intervalDays: number): number => {
  const lastExecutionDate = new Date(lastExecutedAt.replace(/\//g, '-'));
  const nextAvailableDate = new Date(lastExecutionDate);
  nextAvailableDate.setDate(nextAvailableDate.getDate() + intervalDays); // 다음 수행 가능일

  const remainingDays = getDaysDifference(TODAY, formatDate(nextAvailableDate));
  return Math.max(0, remainingDays); // 0보다 작으면 0으로 처리 (이미 지났거나 오늘 가능)
};