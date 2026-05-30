import React from 'react';
import useSchedule from '../../hooks/useSchedule';

import { useTranslation } from '../../utils/i18n';

const DaoXinTodo: React.FC = () => {
  const { habitSchedules, completeSchedule } = useSchedule();
  const { t } = useTranslation();

  if (habitSchedules.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">📜</span>
        <p className="empty-text">{t('emptytodo')}</p>
        <p className="empty-subtext">{t('emptytodoSubtext')}</p>
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