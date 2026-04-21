import { type FC, useEffect } from 'react';
import useSchedule from '../../hooks/useSchedule';

const DaoXinSchedule: FC = () => {
  const { schedules, completeSchedule, initSchedules } = useSchedule();

  useEffect(() => {
    initSchedules();
  }, []);

  if (schedules.length === 0) {
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
    <div className='item-list'>
      {schedules.map((item) => (
        <div key={item.id} className='item-card'>
          <span>{item.config.name}</span>
          <button
            className='complete-btn'
            onClick={() => completeSchedule(item.id)}>
            완료
          </button>
        </div>
      ))}
    </div>
  );
};

export default DaoXinSchedule;
