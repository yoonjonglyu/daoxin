/**
 * 도심(道心): 시스템 전체의 정진 상태 및 통계를 담당하는 루트 모델
 */
export interface Daoxin {
  rank: DaoxinRank;
  gauge: number;       // 현재 도심 게이지 (0 ~ MAX_GAUGE)
  level: number;       // 수련 단계 (Level)
  exp: number;         // 현재 경험치
  streak: number;      // 연속 정진 일수
  totalCompleted: number; // 누적 수련 완료 횟수
  // 통계 관점에서의 마지막 업데이트 날짜
  updateAt: string;    // 마지막 갱신 일자 (YYYY/MM/DD)
  penalty?: PenaltyRule;
}

/**
 * 수련 경지: 게이지나 레벨에 따른 칭호
 */
export type DaoxinRank = '발심' | '승화' | '응심' | '천교';

export interface PenaltyRule {
  enabled: boolean;
  type: 'exp_loss' | 'streak_reset';
  value: number;
}
