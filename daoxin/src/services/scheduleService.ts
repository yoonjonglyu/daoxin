import { Schedule, GoalConfig, IntervalConfig, PeriodicConfig, HabitConfig } from '../types/schedule';
import { TODAY } from '../value';
import { getDaysDifference, calculateNextPeriod } from '../utils/date';

/**
 * 날짜 경과 및 주기에 따른 스케줄 상태 갱신 (초기화 로직)
 */
export const refreshScheduleStatus = (schedule: Schedule): Schedule => {
  const { scheduleCategory, config, completed } = schedule;

  switch (scheduleCategory) {
    case 'habit': {
      const habitConfig = config as HabitConfig;
      // 마지막 완료일이 오늘이 아니라면 완료 상태 초기화
      if (completed && habitConfig.lastExecutedAt !== TODAY) {
        return { ...schedule, completed: false };
      }
      break;
    }

    case 'interval': {
      const intervalConfig = config as IntervalConfig;
      // 설정된 간격(days)이 지났다면 다시 수행 가능하도록 초기화
      if (completed && intervalConfig.lastExecutedAt) {
        const daysPassed = getDaysDifference(intervalConfig.lastExecutedAt, TODAY);
        if (daysPassed >= intervalConfig.intervalDays) {
          return { ...schedule, completed: false };
        }
      }
      break;
    }

    case 'periodic': {
      const periodicConfig = config as PeriodicConfig;
      const type = schedule.type;

      // 주기 종료일이 지났다면 통계 초기화 및 주기 갱신
      if (periodicConfig.periodEnd && TODAY > periodicConfig.periodEnd) {
        let nextRange = calculateNextPeriod(periodicConfig.periodEnd, type);
        
        // 사용자가 아주 오랜만에 접속했을 경우를 대비해 현재 날짜가 포함된 주기까지 밀어줌
        while (TODAY > nextRange.end) {
          nextRange = calculateNextPeriod(nextRange.end, type);
        }

        return {
          ...schedule,
          completed: false,
          config: {
            ...periodicConfig,
            periodCount: 0,
            periodStart: nextRange.start,
            periodEnd: nextRange.end,
            lastResetAt: TODAY,
          },
        };
      }
      break;
    }
  }

  return schedule;
};

/**
 * 스케줄 카테고리에 따른 완료/진행 상태 계산
 */
export const calculateScheduleCompletion = (schedule: Schedule): Schedule => {
  switch (schedule.scheduleCategory) {
    case 'habit':
      // 습관형: 한 번 완료하면 체크 해제 불가
      if (schedule.completed) return schedule;
      return { 
        ...schedule, 
        completed: true, 
        config: { ...schedule.config, lastExecutedAt: TODAY } as HabitConfig 
      };

    case 'goal': {
      const config = schedule.config as GoalConfig;
      if (config.isCompleted) return schedule;
      const nextCount = config.currentCount + 1;
      const isFinished = nextCount >= config.targetCount;
      return {
        ...schedule,
        completed: isFinished,
        config: {
          ...config,
          currentCount: nextCount,
          isCompleted: isFinished,
        },
      };
    }

    case 'interval': {
      if (schedule.completed) return schedule;
      const config = schedule.config as IntervalConfig;
      return {
        ...schedule,
        completed: true,
        config: { 
          ...config, 
          totalCount: config.totalCount + 1,
          lastExecutedAt: TODAY 
        } as IntervalConfig,
      };
    }

    case 'periodic': {
      const config = schedule.config as PeriodicConfig;
      return {
        ...schedule,
        completed: true,
        config: {
          ...config,
          periodCount: config.periodCount + 1,
          totalCount: config.totalCount + 1,
        },
      };
    }

    default:
      return { ...schedule, completed: !schedule.completed };
  }
};