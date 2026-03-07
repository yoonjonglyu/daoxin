import type { Schedule } from './schedule';

export interface Daoxin {
  id: string;
  title: string;
  description?: string;

  categoryId: string;

  schedule: Schedule;
  rank: DaoxinRank;
  expReward: number;
  gauge: number; // 0-100
  penalty?: PenaltyRule;

  createdAt: Date;
  updatedAt: Date;

  progress: Progress;
}

export type DaoxinRank = 'S' | 'A' | 'B' | 'C' | 'D';

export interface Progress {
  totalCompleted: number;
  currentStreak: number;
  longestStreak: number;

  lastCompletedAt?: Date;
}
export interface PenaltyRule {
  enabled: boolean;

  type: 'exp_loss' | 'streak_reset';

  value: number;
}
