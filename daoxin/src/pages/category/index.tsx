import type { FC } from 'react';
import { useMemo, useEffect, useState } from 'react';
import './category.css';
import type { Category } from '../../types/category';

import useDaoxin from '../../hooks/useDaoxin';
import useCategory from '../../hooks/useCategory';
import useSchedule from '../../hooks/useSchedule';
import useActivityLog from '../../hooks/useActivityLog';

import {
  getCategoryLevelInfo,
  getCategoryRank,
  getCategoryRankClass,
} from '../../services/categoryService';
import { getMonthlyStats } from '../../services/statisticsService';
import { MAX_GAUGE } from '../../value';

const CategoryPage: FC = () => {
  const { dao } = useDaoxin();
  const {
    categories,
    selectedCategoryName,
    initCategories,
    selectCategoryByName,
    addCategory,
    deleteCategory,
  } = useCategory();
  const { schedules, initSchedules } = useSchedule();
  const { logs, dailyStats, weeklyStats, initLogs } = useActivityLog();

  const [newCatName, setNewCatName] = useState('');
  const [statPeriod, setStatPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    if (categories.some((c) => c.name === newCatName.trim())) {
      alert('이미 존재하는 카테고리 이름입니다.');
      return;
    }
    addCategory({
      id: Date.now().toString(),
      name: newCatName.trim(),
      exp: 0,
    });
    setNewCatName('');
  };

  useEffect(() => {
    initCategories();
    initSchedules();
    initLogs();
  }, []);

  // 스케줄 데이터를 기반으로 카테고리별 통계 계산
  const categoryStats = useMemo(() => {
    const statsMap = new Map<
      string,
      Category & {
        total: number;
        completed: number;
        items: Array<{ id: string; todo: string; completed: boolean }>;
      }
    >();

    // 1. 등록된 카테고리 기본 구조 생성
    categories.forEach((cat) => {
      statsMap.set(cat.name, {
        ...cat,
        total: 0,
        completed: 0,
        items: [],
      });
    });

    // 2. 스케줄 항목들을 해당 카테고리에 할당 및 통계 합산
    schedules.forEach((s) => {
      const categoryObj = categories.find((c) => c.id === s.categoryId);
      const catName = categoryObj ? categoryObj.name : '기타';

      let currentStats = statsMap.get(catName);
      if (!currentStats) {
        currentStats = {
          id: `auto-${catName}`,
          name: catName,
          total: 0,
          completed: 0,
          items: [],
          exp: 0,
        };
        statsMap.set(catName, currentStats);
      }

      currentStats.total += 1;
      if (s.completed) currentStats.completed += 1;
      currentStats.items.push({
        id: `sched-${s.id}`,
        todo: s.config.name,
        completed: s.completed,
      });
    });

    // 3. 이름순 정렬
    return Array.from(statsMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [categories, schedules]);

  const totalTasks = schedules.length;
  const completedTasks = schedules.filter((s) => s.completed).length;
  const totalProgress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // 이번 달 통계 계산 (현재 날짜 기준)
  const monthlyStats = useMemo(() => {
    const now = new Date();
    return getMonthlyStats(logs, now.getFullYear(), now.getMonth());
  }, [logs]);

  const activeStats = useMemo(() => {
    if (statPeriod === 'daily') return dailyStats;
    if (statPeriod === 'weekly') return weeklyStats;
    return monthlyStats;
  }, [statPeriod, dailyStats, weeklyStats, monthlyStats]);

  const currentDetail = categoryStats.find(
    (c) => c.name === selectedCategoryName,
  );
  const detailLevel = currentDetail
    ? getCategoryLevelInfo(currentDetail.exp)
    : null;
  const detailRankClass = detailLevel
    ? getCategoryRankClass(detailLevel.level)
    : '';

  return (
    <div className='category-container'>
      {/* HEADER */}
      <div className='header'>
        <div className='header-title'>📊 통계</div>
        <div className='header-subtitle'>
          수행 현황과 카테고리별 통계를 확인합니다
        </div>
      </div>

      {/* MAIN STATS OVERVIEW */}
      <div className='stats-overview'>
        <div className='gauge-section'>
          <div className='gauge-label'>현재 도심(道心) 게이지</div>
          <div className='gauge-value'>
            {dao.gauge} / {MAX_GAUGE}
          </div>
          <div className='gauge-bar-container'>
            <div
              className='gauge-fill'
              style={{ width: `${(dao.gauge / MAX_GAUGE) * 100}%` }}
            />
          </div>
        </div>

        <div className='progress-summary'>
          <div>
            <div className='summary-label'>오늘의 달성률</div>
            <div className='summary-value'>{totalProgress}%</div>
          </div>
          <div className='summary-right'>
            <div className='summary-label'>완료된 수행</div>
            <div className='summary-value'>
              {completedTasks} / {totalTasks}
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVITY LOG STATS */}
      <div className='section-title'>정진 기록 통계</div>
      <div className='period-selector'>
        <button 
          className={`period-btn ${statPeriod === 'daily' ? 'active' : ''}`}
          onClick={() => setStatPeriod('daily')}
        >오늘</button>
        <button 
          className={`period-btn ${statPeriod === 'weekly' ? 'active' : ''}`}
          onClick={() => setStatPeriod('weekly')}
        >이번 주</button>
        <button 
          className={`period-btn ${statPeriod === 'monthly' ? 'active' : ''}`}
          onClick={() => setStatPeriod('monthly')}
        >이번 달</button>
      </div>
      
      <div className='stats-grid'>
        <div className='stat-card'>
          <div className='stat-label'>획득 경험치</div>
          <div className='stat-value highlight'>{activeStats.totalExp} EXP</div>
        </div>
        <div className='stat-card'>
          <div className='stat-label'>도심 게이지</div>
          <div className='stat-value highlight'>+{activeStats.totalGauge}</div>
        </div>
        <div className='stat-card'>
          <div className='stat-label'>완료 횟수</div>
          <div className='stat-value'>{activeStats.completedCount} 회</div>
        </div>
      </div>

      {/* CATEGORY MANAGEMENT (ADD) */}
      <div className='section-title'>카테고리 관리</div>
      <div className='add-cat-section'>
        <input
          type='text'
          className='add-cat-input'
          placeholder='새 카테고리 이름...'
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
        />
        <button className='add-cat-button' onClick={handleAddCategory}>
          추가
        </button>
      </div>

      {/* CATEGORY PROGRESS LIST */}
      <div className='section-title'>진행도 및 통계</div>
      <div className='category-list'>
        {categoryStats.map((cat) => {
          const levelInfo = getCategoryLevelInfo(cat.exp);
          const rank = getCategoryRank(levelInfo.level);
          const rankClass = getCategoryRankClass(levelInfo.level);

          return (
            <div
              key={cat.name}
              onClick={() => selectCategoryByName(cat.name)}
              className={`category-card ${selectedCategoryName === cat.name ? 'active' : ''} ${rankClass}`}>
              <div className='category-card-header'>
                <div className='category-card-name-wrapper'>
                  <span className='category-card-name'>{cat.name}</span>
                  {cat.name !== '기타' && (
                    <button
                      className='delete-cat-btn'
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          confirm(`'${cat.name}' 카테고리를 삭제하시겠습니까?`)
                        )
                          deleteCategory(cat.id);
                      }}>
                      ✕
                    </button>
                  )}
                </div>
                {cat.name !== '기타' && (
                  <span className='category-card-status'>
                    Lv.{levelInfo.level} {rank} (
                    {Math.floor(levelInfo.progress)}%)
                  </span>
                )}
              </div>
              <div className='progress-bar-container'>
                <div
                  className={`progress-bar-fill ${rankClass}`}
                  style={{ width: `${cat.name === '기타' ? 100 : levelInfo.progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* CATEGORY DETAIL (TASK LIST) */}
      {currentDetail && detailLevel && (
        <div className={`category-detail ${detailRankClass}`}>
          <div className='detail-name'>
            {currentDetail.name}{' '}
            <span className={`detail-lv-badge ${detailRankClass}`}>
              Lv.{detailLevel.level}
            </span>
          </div>
          <div className='detail-stats'>
            {getCategoryRank(detailLevel.level)} (누적 경험치:{' '}
            {currentDetail.exp}) | 오늘 완료: {currentDetail.completed} /{' '}
            {currentDetail.total}
          </div>
          <div className='section-title'>수행 목록</div>
          <div className='task-list'>
            {currentDetail.items.map((item, idx) => (
              <div
                key={idx}
                className={`task-item ${item.completed ? 'completed' : ''}`}>
                <span>{item.todo}</span>
                {item.completed && <span className='check-icon'>✓</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
