import { getTodayString } from "../value";

/**
 * 로컬 Date 객체를 YYYY/MM/DD 형식의 문자열로 변환합니다.
 */
export const formatDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}/${m}/${d}`;
};

/**
 * 날짜 문자열(YYYY/MM/DD, YYYY-MM-DD, ISO 문자열 등)을 기기 로컬 시간 기준 00:00:00 Date로 안전하게 파싱합니다.
 */
export const parseLocalDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  
  // YYYY/MM/DD 또는 YYYY-MM-DD 분리 처리
  const parts = dateStr.slice(0, 10).split(/[/ -]/).map(Number);
  if (parts.length >= 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
  }
  
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * 로컬 자정(00:00:00) 기준으로 표준화합니다.
 */
export const normalizeDate = (date: Date): Date => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

/**
 * 기기 로컬 날짜 기준 두 날짜 사이의 순수 일수(Day) 차이를 계산합니다.
 * @returns currentDate - prevDate 일수 차이 (예: 어제와 오늘 = 1, 같은 날 = 0)
 */
export const getDaysDifference = (prevDate: string, currentDate: string): number => {
  const prev = parseLocalDate(prevDate);
  const curr = parseLocalDate(currentDate);
  const diffTime = curr.getTime() - prev.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * 주기에 따른 다음 기간의 시작일과 종료일을 계산 (로컬 시간 기준)
 */
export const calculateNextPeriod = (currentEnd: string, type: string): { start: string; end: string } => {
  const startDate = parseLocalDate(currentEnd);
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

  return { start: formatDate(startDate), end: formatDate(endDate) };
};

/**
 * Interval 스케줄의 다음 수행 가능일까지 남은 일수를 계산합니다.
 * @param lastExecutedAt 마지막 수행일 (YYYY/MM/DD)
 * @param intervalDays 간격 (일)
 * @returns 남은 일수 (0이면 오늘부터 가능, 양수면 남은 일수)
 */
export const getIntervalRemainingDays = (lastExecutedAt: string, intervalDays: number): number => {
  const lastExecutionDate = parseLocalDate(lastExecutedAt);
  const nextAvailableDate = new Date(lastExecutionDate);
  nextAvailableDate.setDate(nextAvailableDate.getDate() + intervalDays); // 다음 수행 가능일

  const remainingDays = getDaysDifference(getTodayString(), formatDate(nextAvailableDate));
  return Math.max(0, remainingDays); // 0보다 작으면 0으로 처리 (이미 지났거나 오늘 가능)
};