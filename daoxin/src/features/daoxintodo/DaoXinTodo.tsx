import React from 'react';
import useDaoxin from '../../hooks/useDaoxin';

const DaoXinTodo: React.FC = () => {
  const { dList, checkList } = useDaoxin();
  
  if (dList.length === 0) {
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
      {dList.map((item) => (
        <div key={item.idx} className='item-card'>
          <span style={{ 
            textDecoration: item.completed ? 'line-through' : 'none',
            opacity: item.completed ? 0.6 : 1 
          }}>
            {item.todo}
          </span>
          <input 
            type='checkbox' 
            className='habit-checkbox' 
            checked={item.completed}
            onChange={() => !item.completed && checkList(item.idx)}
            disabled={item.completed}
          />
        </div>
      ))}
    </div>
  );
};

export default DaoXinTodo;