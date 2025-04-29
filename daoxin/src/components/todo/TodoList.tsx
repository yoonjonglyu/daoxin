import React, { useState } from 'react';
import './TodoList.css';

export interface TodoListProps {
  list: Array<{
    idx: number;
    todo: string;
    completed: boolean;
    updateAt: string;
  }>;
  addTodo: (newTodo: string) => void;
  removeTodo: (index: number) => void;
  editTodo: (index: number, updatedTodo: string) => void;
}

const TodoList: React.FC<TodoListProps> = ({
  list,
  addTodo,
  editTodo,
  removeTodo,
}) => {
  const [newTodo, setNewTodo] = useState<string>('');

  const _addTodo = () => {
    if (newTodo.trim()) {
      addTodo(newTodo);
      setNewTodo('');
    }
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
        <button onClick={_addTodo} className='todo-add-button'>
          추가
        </button>
      </div>
      <ul className='todo-list'>
        {list.map((todo) => (
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
