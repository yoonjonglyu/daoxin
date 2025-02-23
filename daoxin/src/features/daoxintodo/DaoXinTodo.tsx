import React from 'react';

import './DaoXinTodo.css';

/**
 * 상태를 굳이 props 할 이유가 없긴하다
 */

export interface DaoXinTodoProps {
}

const DaoXinTodo: React.FC<DaoXinTodoProps> = () => {
  return (
    <div className='todo-container'>
      <ul>
        {[0].map((item) => {
          return (
            <li>
              <label>
                <input type='checkbox' />
              </label>
              <span>참장공</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default DaoXinTodo;
