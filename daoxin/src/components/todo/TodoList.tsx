import React, { useState } from 'react';
import './TodoList.css';

import useDaoxin from '../../hooks/useDaoxin';

const TodoList: React.FC = () => {
  const { dList, editList } = useDaoxin();
  const [newTodo, setNewTodo] = useState<string>('');

  const addTodo = () => {
    if (newTodo.trim()) {
      editList([
        ...dList,
        {
          idx: dList.length > 0 ? dList[dList.length - 1].idx + 1 : 1,
          todo: newTodo,
          completed: true,
          updateAt: new Date().toISOString(),
        },
      ]);
      setNewTodo('');
    }
  };

  const editTodo = (index: number, updatedTodo: string) => {
    editList(
      dList.map((todo) =>
        todo.idx === index ? { ...todo, todo: updatedTodo } : todo,
      ),
    );
  };

  const removeTodo = (index: number) => {
    editList(dList.filter((todo) => todo.idx !== index));
  };

  return (
    <div className='todo-container-card'>
      <h3 className='todo-header'>할일 목록</h3>
      <div className='todo-input-container'>
        <input
          type='text'
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder='새로운 할일 추가'
          className='todo-input'
        />
        <button onClick={addTodo} className='todo-add-button'>
          추가
        </button>
      </div>
      <ul className='todo-list'>
        {dList.map((todo) => (
          <li key={todo.idx} className='todo-item'>
            <input
              type='text'
              value={todo.todo}
              onChange={(e) => editTodo(todo.idx, e.target.value)}
            />
            <button
              onClick={() => removeTodo(todo.idx)}
              className='todo-remove-button'>
              삭제
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
