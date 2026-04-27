import { type FC, useEffect, useMemo } from 'react';
import useSchedule from '../../hooks/useSchedule';
import { getIntervalRemainingDays } from '../../utils/date';
import type { GoalConfig, IntervalConfig, PeriodicConfig } from '../../types/schedule';

const DaoXinSchedule: FC = () => {
  const {
    schedules,
    completeSchedule,
    initSchedules,
  } = useSchedule();

  useEffect(() => {
    initSchedules();
  }, []);

  // 스케줄을 타입별로 그룹화 (habit 제외, 빈 그룹 제외)
  const sections = useMemo(() => [
    { name: 'goal', title: '🎯 대업 목표', items: schedules.filter((s) => s.scheduleCategory === 'goal') },
    { name: 'interval', title: '⏳ 주기 연마', items: schedules.filter((s) => s.scheduleCategory === 'interval') },
    { name: 'periodic', title: '🔄 순환 정진', items: schedules.filter((s) => s.scheduleCategory === 'periodic') },
  ].filter(section => section.items.length > 0), [schedules]);

  if (sections.length === 0) {
    return (
      <div className='empty-state'>
        <span className='empty-icon'>📅</span>
        <p className='empty-text'>정진할 일정이 없습니다.</p>
        <p className='empty-subtext'>
          수련 일정 관리에서 새로운 목표를 세워보세요.
        </p>
      </div>
    );
  }

  return (
    <div className='schedule-groups'>
      {sections.map((section) => (
        <div key={section.name} className='schedule-group'>
          <h4 className='group-title'>{section.title}</h4>
          <div className='item-list'>
            {section.items.map((item) => {
              const isGoal = item.scheduleCategory === 'goal';
              const isInterval = item.scheduleCategory === 'interval';
              const isPeriodic = item.scheduleCategory === 'periodic';

              return (
                <div 
                  key={item.id} 
                  className={`item-card cat-${item.scheduleCategory} ${item.completed ? 'completed' : ''}`}
                >
                  {/* 수행 완료 시 나타나는 붉은 낙관 */}
                  {item.completed && <div className="stamp-seal">수행완료</div>}

                  <div className='item-info'>
                    <span className='item-name'>{item.config.name}</span>
                    
                    {/* 타입별 상세 상태 표시 */}
                    {isGoal && (
                      <span className='item-desc'>
                        {(item.config as GoalConfig).currentCount} / {(item.config as GoalConfig).targetCount}
                      </span>
                    )}
                    {isPeriodic && (
                      <span className='item-desc'>
                        이번 순환: {(item.config as PeriodicConfig).periodCount}회
                      </span>
                    )}
                    {isInterval && item.completed && (item.config as IntervalConfig).lastExecutedAt && (
                      <span className='item-desc'>
                        D-{getIntervalRemainingDays(
                          (item.config as IntervalConfig).lastExecutedAt!,
                          (item.config as IntervalConfig).intervalDays
                        )}일 후 가능
                      </span>
                    )}
                  </div>

                  <button
                    className='complete-btn' 
                    onClick={() => completeSchedule(item.id)}
                    disabled={
                      item.completed && (
                        isInterval || 
                        (isGoal && (item.config as GoalConfig).isCompleted)
                      )
                    }
                  >
                    {isPeriodic ? '정진' : (item.completed ? '완료' : (isGoal ? '수행' : '수행'))}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DaoXinSchedule;
