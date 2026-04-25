import { Category } from '../types/category';

const EXP_PER_LEVEL = 100; // 도심 게이지 상한선과 동일하게 100으로 설정

/**
 * 카테고리 누적 경험치를 기반으로 레벨 및 현재 레벨 내의 진행 정보를 계산합니다.
 */
export const getCategoryLevelInfo = (exp: number = 0) => {
  const level = Math.floor(exp / EXP_PER_LEVEL) + 1;
  const currentLevelExp = exp % EXP_PER_LEVEL;
  const progress = (currentLevelExp / EXP_PER_LEVEL) * 100;

  return {
    level,
    currentLevelExp,
    progress,
    expToNextLevel: EXP_PER_LEVEL,
  };
};

/**
 * 카테고리 레벨에 따른 숙련도 칭호를 반환합니다.
 */
export const getCategoryRank = (level: number): string => {
  if (level >= 100) return '현경(玄境)'; // 최상위 단계
  if (level >= 50) return '화경(化境)';
  if (level >= 20) return '전문(專門)';
  if (level >= 5) return '숙련(熟練)';
  return '입문(入門)';
};

/**
 * 카테고리 레벨에 따른 스타일 클래스 이름을 반환합니다.
 */
export const getCategoryRankClass = (level: number): string => {
  if (level >= 100) return 'rank-legendary'; // 현경
  if (level >= 50) return 'rank-epic';      // 화경
  if (level >= 20) return 'rank-rare';      // 전문
  if (level >= 5) return 'rank-uncommon';  // 숙련
  return 'rank-common';                    // 입문
};

/**
 * 카테고리에 경험치를 부여한 새로운 객체를 반환합니다.
 */
export const applyCategoryExp = (category: Category, amount: number): Category => ({
  ...category,
  exp: (category.exp || 0) + amount,
});