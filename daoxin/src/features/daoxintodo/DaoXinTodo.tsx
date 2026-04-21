import React from 'react';
import useSchedule from '../../hooks/useSchedule';

const DaoXinTodo: React.FC = () => {
  const { habitSchedules, completeSchedule } = useSchedule();
  
  if (habitSchedules.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">📜</span>
        <p className="empty-text">설정된 수련 항목이 없습니다.</p>
        <p className="empty-subtext">카테고리 메뉴에서 수련을 추가하고 정진하세요.</p>
      </div>
    );
  }

  return (
    <div className='item-list'>
      {habitSchedules.map((item) => (
        <div key={item.id} className='item-card'>
          <span style={{ 
            textDecoration: item.completed ? 'line-through' : 'none',
            opacity: item.completed ? 0.6 : 1 
          }}>
            {item.config.name}
          </span>
          <input 
            type='checkbox' 
            className='habit-checkbox' 
            checked={item.completed}
            onChange={() => completeSchedule(item.id)}
            disabled={item.completed}
          />
        </div>
      ))}
    </div>
  );
};

export default DaoXinTodo;