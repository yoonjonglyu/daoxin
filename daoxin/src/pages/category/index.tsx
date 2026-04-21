import type { FC } from "react";
import { useState, useMemo } from "react";
import "./category.css";

import useDaoxin from "../../hooks/useDaoxin";
import { MAX_GAUGE } from "../../value";


const CategoryPage: FC = () => {
  const { dao } = useDaoxin();
  const [selected, setSelected] = useState<string | null>(null);

  // 데이터를 카테고리별로 그룹화하고 통계 계산
  const categoryStats = useMemo(() => {
    const stats: Record<string, { name: string; total: number; completed: number; items: typeof dao.list }> = {};
    
    dao.list.forEach((item) => {
      const cat = item.category || "기타";
      if (!stats[cat]) {
        stats[cat] = { name: cat, total: 0, completed: 0, items: [] };
      }
      stats[cat].total += 1;
      if (item.completed) stats[cat].completed += 1;
      stats[cat].items.push(item);
    });

    return Object.values(stats);
  }, [dao.list]);

  const totalTasks = dao.list.length;
  const completedTasks = dao.list.filter(t => t.completed).length;
  const totalProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const current = categoryStats.find((c) => c.name === selected);

  return (
    <div className="category-container">
      {/* HEADER */}
      <div className="header">
        <div className="header-title">📊 통계</div>
        <div className="header-subtitle">
          수행 현황과 카테고리별 통계를 확인합니다
        </div>
      </div>

      {/* MAIN STATS OVERVIEW */}
      <div className="stats-overview">
        <div className="gauge-section">
          <div className="gauge-label">현재 도심(道心) 게이지</div>
          <div className="gauge-value">
            {dao.gauge} / {MAX_GAUGE}
          </div>
          <div className="gauge-bar-container">
            <div className="gauge-fill" style={{ width: `${(dao.gauge / MAX_GAUGE) * 100}%` }} />
          </div>
        </div>
        
        <div className="progress-summary">
          <div>
            <div className="summary-label">오늘의 달성률</div>
            <div className="summary-value">{totalProgress}%</div>
          </div>
          <div className="summary-right">
            <div className="summary-label">완료된 수행</div>
            <div className="summary-value">{completedTasks} / {totalTasks}</div>
          </div>
        </div>
      </div>

      {/* CATEGORY PROGRESS LIST */}
      <div className="section-title">카테고리별 진행도</div>
      <div className="category-list">
        {categoryStats.map((cat) => {
          const progress = Math.round((cat.completed / cat.total) * 100);
          return (
            <div
              key={cat.name}
              onClick={() => setSelected(cat.name)}
              className={`category-card ${selected === cat.name ? "active" : ""}`}
            >
              <div className="category-card-header">
                <span className="category-card-name">{cat.name}</span>
                <span className={`category-card-status ${progress === 100 ? "completed" : ""}`}>
                  {cat.completed}/{cat.total} ({progress}%)
                </span>
              </div>
              <div className="progress-bar-container">
                <div
                  className={`progress-bar-fill ${progress === 100 ? "full" : ""}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* CATEGORY DETAIL (TASK LIST) */}
      {current && (
        <div className="category-detail">
          <div className="detail-name">{current.name}</div>
          <div className="detail-stats">
            완료된 항목: {current.completed} / {current.total}
          </div>
          <div className="section-title">수행 목록</div>
          <div className="task-list">
            {current.items.map((item, idx) => (
              <div
                key={idx}
                className={`task-item ${item.completed ? "completed" : ""}`}
              >
                <span>{item.title}</span>
                {item.completed && <span className="check-icon">✓</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;