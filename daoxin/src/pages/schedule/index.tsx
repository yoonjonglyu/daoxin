import type { FC } from "react";
import { useState, useEffect } from "react";
import useSchedule from "../../hooks/useSchedule";
import type { Schedule, ScheduleCategory } from "../../types/schedule";
import "./schedule.css";

const SchedulePage: FC = () => {
  const { schedules, addSchedule, editSchedule, deleteSchedule, completeSchedule, initSchedules } = useSchedule();
  const [newTaskName, setNewTaskName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ScheduleCategory>('habit');

  useEffect(() => {
    initSchedules();
  }, []);

  const handleAddSchedule = () => {
    if (!newTaskName.trim()) return;
    
    let config: Schedule['config'];
    const base = { name: newTaskName };

    // 카테고리에 따른 필수 데이터 초기화
    if (selectedCategory === 'habit') {
      config = { ...base, count: 0 };
    } else if (selectedCategory === 'goal') {
      config = { ...base, targetCount: 1, currentCount: 0, isCompleted: false };
    } else if (selectedCategory === 'interval') {
      config = { ...base, intervalDays: 1, totalCount: 0 };
    } else {
      // periodic
      config = { ...base, periodStart: '', periodEnd: '', periodCount: 0, totalCount: 0, lastResetAt: '' };
    }

    const newSchedule: Schedule = {
      id: Date.now().toString(),
      scheduleCategory: selectedCategory,
      type: 'daily',
      completed: false,
      config
    };
    
    addSchedule(newSchedule);
    setNewTaskName("");
  };

  const handleUpdateName = (id: string, newName: string) => {
    const target = schedules.find(s => s.id === id);
    if (!target) return;

    editSchedule(id, {
      config: { ...target.config, name: newName } as any
    });
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
      <div className="category-selector">
        {(['habit', 'goal', 'interval', 'periodic'] as ScheduleCategory[]).map(cat => (
          <button 
            key={cat} 
            className={`cat-btn ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="add-section">
        <input
          type="text"
          className="add-input"
          placeholder="새로운 수련 항목을 입력하세요..."
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddSchedule()}
        />
        <button className="add-button" onClick={handleAddSchedule}>추가</button>
      </div>

      {/* TASK LIST */}
      <div className="task-list">
        {schedules.map((item) => (
          <div key={item.id} className={`task-card ${item.completed ? 'completed' : ''} cat-${item.scheduleCategory}`}>
            <input
              type="checkbox"
              className="checkbox"
              checked={item.completed}
              onChange={() => completeSchedule(item.id)}
            />
            <span className={`cat-badge ${item.scheduleCategory}`}>{item.scheduleCategory}</span>
            <input
              type="text"
              className={`task-title-input ${item.completed ? 'strikethrough' : ''}`}
              value={item.config.name}
              onChange={(e) => handleUpdateName(item.id, e.target.value)}
              disabled={item.completed}
            />
            <span 
              className="delete-icon"
              onClick={() => deleteSchedule(item.id)}
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