import { describe, it, expect } from 'vitest';
import { applyDailyPenalty, earnExp, earnGauge, CATEGORY_REWARDS } from '../daoxinService';
import type { Daoxin } from '../../types/daoxin';
import { MIN_GAUGE, MAX_GAUGE } from '../../value';

const createMockDaoxin = (overrides?: Partial<Daoxin>): Daoxin => ({
  rank: '발심',
  gauge: 10,
  level: 1,
  exp: 50,
  streak: 5,
  totalCompleted: 10,
  updateAt: '2026/10/25',
  ...overrides,
});

describe('daoxinService - Daily Penalty (감산 및 패널티)', () => {
  it('어제 수련 후 오늘 정상 접속한 경우(daysPassed=1) 도심 게이지가 감산되지 않고 스트릭이 유지되어야 한다', () => {
    const initialState = createMockDaoxin({ gauge: 10, streak: 5 });
    const result = applyDailyPenalty(initialState, 1);

    expect(result.gauge).toBe(10); // 연속 접속이므로 감산 0
    expect(result.streak).toBe(5); // 스트릭 유지
  });

  it('하루를 결석하고 접속한 경우(daysPassed=2) 도심 게이지가 1 감산되고 스트릭이 0으로 초기화되어야 한다', () => {
    const initialState = createMockDaoxin({ gauge: 10, streak: 5 });
    const result = applyDailyPenalty(initialState, 2);

    expect(result.gauge).toBe(9); // 건너뛴 1일 감산
    expect(result.streak).toBe(0); // 결석으로 스트릭 초기화
  });

  it('사흘을 결석하고 접속한 경우(daysPassed=4) 건너뛴 3일만큼 게이지가 감산되어야 한다', () => {
    const initialState = createMockDaoxin({ gauge: 10, streak: 5 });
    const result = applyDailyPenalty(initialState, 4);

    expect(result.gauge).toBe(7); // 10 - 3 = 7
    expect(result.streak).toBe(0);
  });

  it('게이지가 대폭 감산되더라도 MIN_GAUGE(1) 이하로 떨어지지 않아야 한다', () => {
    const initialState = createMockDaoxin({ gauge: 2, streak: 3 });
    const result = applyDailyPenalty(initialState, 10);

    expect(result.gauge).toBe(MIN_GAUGE);
    expect(result.streak).toBe(0);
  });

  it('패널티가 비활성화(enabled: false)되어 있으면 날짜만 갱신되고 감산 및 스트릭 초기화가 발생하지 않아야 한다', () => {
    const initialState = createMockDaoxin({
      gauge: 10,
      streak: 5,
      penalty: { enabled: false, type: 'streak_reset', value: 1 },
    });
    const result = applyDailyPenalty(initialState, 5);

    expect(result.gauge).toBe(10);
    expect(result.streak).toBe(5);
  });

  it('당일 재접속(daysPassed <= 0)인 경우 상태가 그대로 유지되어야 한다', () => {
    const initialState = createMockDaoxin({ gauge: 10, streak: 5 });
    const result = applyDailyPenalty(initialState, 0);

    expect(result).toBe(initialState);
  });
});

describe('daoxinService - earnGauge & earnExp', () => {
  it('도심 게이지는 1씩 오르고 스트릭이 1 증가해야 한다', () => {
    const initialState = createMockDaoxin({ gauge: 1, streak: 0 });
    const result = earnGauge(initialState, 1);

    expect(result.gauge).toBe(2);
    expect(result.streak).toBe(1);
  });

  it('게이지는 MAX_GAUGE(100)을 초과하지 않아야 한다', () => {
    const initialState = createMockDaoxin({ gauge: 100, streak: 10 });
    const result = earnGauge(initialState, 1);

    expect(result.gauge).toBe(MAX_GAUGE);
    expect(result.streak).toBe(11);
  });

  it('경험치 획득 시 100 단위로 레벨이 상승하고 totalCompleted가 증가해야 한다', () => {
    const initialState = createMockDaoxin({ exp: 90, level: 1, totalCompleted: 5 });
    const result = earnExp(initialState, 20);

    expect(result.exp).toBe(110);
    expect(result.level).toBe(2); // 110 / 100 + 1 = 2
    expect(result.totalCompleted).toBe(6);
  });

  it('습관 카테고리 기본 보상이 올바르게 정의되어 있어야 한다', () => {
    expect(CATEGORY_REWARDS.habit).toBe(2);
    expect(CATEGORY_REWARDS.goal).toBe(5);
    expect(CATEGORY_REWARDS.interval).toBe(3);
    expect(CATEGORY_REWARDS.periodic).toBe(2);
  });
});
