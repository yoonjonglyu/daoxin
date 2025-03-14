import React from 'react';
import './DaoXinTodo.css';

import useDaoxin from '../../hooks/useDaoxin';

export interface DaoXinTodoProps {}

const DaoXinTodo: React.FC<DaoXinTodoProps> = () => {
  const { dList, checkList } = useDaoxin();

  return (
    <div className='todo-container'>
      <ul>
        {dList.map((item) => {
          return (
            <li key={item.idx}>
              <label>
                <input
                  type='checkbox'
                  defaultChecked={item.completed}
                  onClick={() => checkList(item.idx)}
                />
              </label>
              <span>{item.todo}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default DaoXinTodo;
