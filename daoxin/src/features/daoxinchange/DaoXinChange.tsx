import React from 'react';
import './DaoXinChange.css';

import TodoList from '../../components/todo/TodoList';
import Card from '../../components/card/Card';

import useDaoxin from '../../hooks/useDaoxin';

export interface DaoXinChangeProps {}

const DaoXinChange: React.FC<DaoXinChangeProps> = () => {
  const { dList, editList } = useDaoxin();

  const addTodo = (newTodo: string) => {
    editList([
      ...dList,
      {
        idx: dList.length > 0 ? dList[dList.length - 1].idx + 1 : 1,
        todo: newTodo,
        completed: true,
        updateAt: new Date().toISOString(),
      },
    ]);
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
    <Card>
      <TodoList
        list={dList}
        addTodo={addTodo}
        editTodo={editTodo}
        removeTodo={removeTodo}
      />
    </Card>
  );
};
export default DaoXinChange;
