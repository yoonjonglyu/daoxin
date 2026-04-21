import { type FC, useEffect } from 'react';
import useSchedule from '../../hooks/useSchedule';

const DaoXinSchedule: FC = () => {
  const {
    intervalSchedules,
    goalSchedules,
    periodicSchedules,
    completeSchedule,
    initSchedules,
  } = useSchedule();

  useEffect(() => {
    initSchedules();
  }, []);

  const hasAnySchedule = intervalSchedules.length > 0 || goalSchedules.length > 0 || periodicSchedules.length > 0;

  if (!hasAnySchedule) {
    return (
      <div className='empty-state'>
        <span className='empty-icon'>📅</span>
        <p className='empty-text'>예정된 일정이 없습니다.</p>
        <p className='empty-subtext'>
          스케줄 메뉴에서 새로운 일정을 계획해 보세요.
        </p>
      </div>
    );
  }

  return (
    <div className='schedule-groups'>
      {/* 1. 목표 달성형 (Goal) */}
      {goalSchedules.length > 0 && (
        <div className='schedule-group'>
          <h4 className='group-title'>🎯 목표 달성</h4>
          <div className='item-list'>
            {goalSchedules.map((item) => (
              <div key={item.id} className='item-card cat-goal'>
                <span>{item.config.name}</span>
                <button className='complete-btn' onClick={() => completeSchedule(item.id)}>
                  {item.completed ? '취소' : '완료'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. 간격 기반 (Interval) */}
      {intervalSchedules.length > 0 && (
        <div className='schedule-group'>
          <h4 className='group-title'>⏳ 간격 수련</h4>
          <div className='item-list'>
            {intervalSchedules.map((item) => (
              <div key={item.id} className='item-card cat-interval'>
                <span>{item.config.name}</span>
                <button className='complete-btn' onClick={() => completeSchedule(item.id)}>
                  {item.completed ? '취소' : '완료'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. 주기 리셋형 (Periodic) */}
      {periodicSchedules.length > 0 && (
        <div className='schedule-group'>
          <h4 className='group-title'>🔄 주기 정진</h4>
          <div className='item-list'>
            {periodicSchedules.map((item) => (
              <div key={item.id} className='item-card cat-periodic'>
                <span>{item.config.name}</span>
                <button className='complete-btn' onClick={() => completeSchedule(item.id)}>
                  {item.completed ? '취소' : '완료'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DaoXinSchedule;
