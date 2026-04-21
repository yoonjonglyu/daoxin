import type { FC } from "react";
import { useState } from "react";
import useDaoxin from "../../hooks/useDaoxin";
import "./schedule.css";

const SchedulePage: FC = () => {
  const { dList, checkList, editList } = useDaoxin();
  const [newTaskName, setNewTaskName] = useState("");

  const handleAddTodo = () => {
    if (!newTaskName.trim()) return;
    
    const nextIdx = dList.length > 0 ? Math.max(...dList.map(t => t.idx)) + 1 : 0;
    const newItem = {
      idx: nextIdx,
      todo: newTaskName,
      completed: false,
      updateAt: new Date().toLocaleDateString('ko-KR')
    };
    
    editList([...dList, newItem]);
    setNewTaskName("");
  };

  const handleUpdateTodoText = (index: number, newText: string) => {
    const newList = [...dList];
    newList[index] = { ...newList[index], todo: newText };
    editList(newList);
  };

  const handleDeleteTodo = (index: number) => {
    const newList = dList.filter((_, i) => i !== index);
    editList(newList);
  };

  return (
    <div className="schedule-container">
      {/* HEADER */}
      <div className="header">
        <div className="header-title">📅 수련 일정 관리</div>
        <div className="header-subtitle">
          수행 목록을 추가, 수정하거나 오늘의 정진을 기록하세요.
        </div>
      </div>

      {/* ADD NEW TASK */}
      <div className="add-section">
        <input
          type="text"
          className="add-input"
          placeholder="새로운 수련 항목을 입력하세요..."
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddTodo()}
        />
        <button className="add-button" onClick={handleAddTodo}>추가</button>
      </div>

      {/* TASK LIST */}
      <div className="task-list">
        {dList.map((item, index) => (
          <div key={item.idx} className={`task-card ${item.completed ? 'completed' : ''}`}>
            <input
              type="checkbox"
              className="checkbox"
              checked={item.completed}
              onChange={() => !item.completed && checkList(index)}
              disabled={item.completed}
            />
            <input
              type="text"
              className={`task-title-input ${item.completed ? 'strikethrough' : ''}`}
              value={item.todo}
              onChange={(e) => handleUpdateTodoText(index, e.target.value)}
              disabled={item.completed}
            />
            <span 
              className="delete-icon" 
              onClick={() => handleDeleteTodo(index)}
              title="삭제"
            >
              🗑️
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SchedulePage;