import type { FC } from 'react';
import { useState, useMemo } from 'react';

import './schedule.css';

import type {
  Schedule,
  ScheduleCategory,
  GoalConfig,
  IntervalConfig,
  PeriodicConfig,
} from '../../types/schedule';
import useSchedule from '../../hooks/useSchedule';
import useCategory from '../../hooks/useCategory';
import { getIntervalRemainingDays } from '../../utils/date';

const categoryLabels: Record<ScheduleCategory, string> = {
  habit: '상시(常時)',
  goal: '대업(大業)',
  interval: '연마(硏磨)',
  periodic: '순환(循環)',
};

const SchedulePage: FC = () => {
  const {
    schedules,
    addSchedule,
    editSchedule,
    deleteSchedule,
    completeSchedule,
  } = useSchedule();
  const { categories } = useCategory();
  const [newTaskName, setNewTaskName] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState<ScheduleCategory>('habit');
  const [periodicType, setPeriodicType] = useState<Schedule['type']>('daily');
  const [targetCount, setTargetCount] = useState<number>(1);
  const [intervalDays, setIntervalDays] = useState<number>(1);
  const [selectedUserCategoryId, setSelectedUserCategoryId] =
    useState<string>('');

  const handleAddSchedule = () => {
    if (!newTaskName.trim()) return;

    addSchedule({
      newTaskName,
      selectedCategory,
      type: selectedCategory === 'periodic' ? periodicType : 'daily',
      selectedUserCategoryId,
      goalTarget: targetCount,
      intervalDays: intervalDays,
    });
    setNewTaskName('');
    setSelectedUserCategoryId('');
  };

  const handleUpdateName = (id: string, newName: string) => {
    const target = schedules.find((s) => s.id === id);
    if (!target) return;

    editSchedule(id, {
      config: { ...target.config, name: newName } as any,
    });
  };

  // 스케줄을 사용자 정의 카테고리(categoryId) 기준으로 그룹화 (빈 그룹 제외)
  const groupedSchedules = useMemo(() => {
    const groups: { categoryName: string; items: Schedule[] }[] = [];

    // 1. 등록된 카테고리별로 그룹 생성
    categories.forEach((cat) => {
      const items = schedules.filter((s) => s.categoryId === cat.id);
      if (items.length > 0) {
        groups.push({ categoryName: cat.name, items });
      }
    });

    // 2. 카테고리가 없거나(undefined) 매칭되는 카테고리가 없는 스케줄 처리
    const uncategorizedItems = schedules.filter(
      (s) => !s.categoryId || !categories.find((c) => c.id === s.categoryId),
    );

    if (uncategorizedItems.length > 0) {
      groups.push({ categoryName: '기타', items: uncategorizedItems });
    }

    return groups;
  }, [schedules, categories]);

  // 카테고리별 하단 정보 UI 렌더링 함수
  const renderScheduleInfo = (item: Schedule) => {
    switch (item.scheduleCategory) {
      case 'goal': {
        const config = item.config as GoalConfig;
        const progress = Math.min(
          100,
          Math.round((config.currentCount / config.targetCount) * 100),
        );
        return (
          <div className='schedule-info-area'>
            <div className='info-row'>
              <span>
                대업 진행: {config.currentCount} / {config.targetCount}
              </span>
              <span>{progress}%</span>
            </div>
            <div className='mini-progress-bar'>
              <div
                className='mini-progress-fill'
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        );
      }
      case 'interval': {
        const config = item.config as IntervalConfig;
        let remainingDaysText = '';
        if (item.completed && config.lastExecutedAt) {
          const remainingDays = getIntervalRemainingDays(
            config.lastExecutedAt,
            config.intervalDays,
          );
          if (remainingDays > 0) {
            remainingDaysText = ` (D-${remainingDays}일 후 활성화)`;
          } else {
            remainingDaysText = ` (오늘부터 활성화)`;
          }
        } else if (!item.completed) {
          remainingDaysText = ` (수행 가능)`;
        }
        return (
          <div className='schedule-info-area'>
            <div className='info-text'>
              ⏳ <b>{config.intervalDays}일 간격</b> 연마법
              {remainingDaysText && (
                <span className='info-sub-text'>{remainingDaysText}</span>
              )}
            </div>
            <div className='info-text secondary'>
              누적 수행: {config.totalCount}회
            </div>
          </div>
        );
      }
      case 'periodic': {
        const config = item.config as PeriodicConfig;
        return (
          <div className='schedule-info-area'>
            <div className='info-text'>
              🔄 <b>순환 기간:</b> {config.periodStart} ~ {config.periodEnd}
            </div>
            <div className='info-text secondary'>
              이번 순환: {config.periodCount}회 / 전체 누적: {config.totalCount}
              회
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className='schedule-container'>
      {/* HEADER */}
      <div className='header'>
        <div className='header-title'>📜 수행 비급 관리</div>
        <div className='header-subtitle'>
          수행 첩지를 작성하고 자신만의 정진 길을 설계하십시오.
        </div>
      </div>

      {/* ADD NEW TASK */}
      <div className='category-selector'>
        {(['habit', 'goal', 'interval', 'periodic'] as ScheduleCategory[]).map(
          (cat) => (
            <button
              key={cat}
              className={`cat-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}>
              {categoryLabels[cat]}
            </button>
          ),
        )}
      </div>

      {/* USER CATEGORY DROPDOWN */}
      <select
        className='user-category-select'
        value={selectedUserCategoryId}
        onChange={(e) => setSelectedUserCategoryId(e.target.value)}>
        <option disabled={true} value=''>
          수행 분야 선택
        </option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      {/* TYPE SPECIFIC CONFIGS */}
      <div className='config-inputs-row'>
        {selectedCategory === 'goal' && (
          <div className='config-field'>
            <label>대업 목표치</label>
            <input
              type='number'
              value={targetCount}
              onChange={(e) => setTargetCount(Number(e.target.value))}
              min='1'
            />
          </div>
        )}
        {selectedCategory === 'interval' && (
          <div className='config-field'>
            <label>연마 간격 (일)</label>
            <input
              type='number'
              value={intervalDays}
              onChange={(e) => setIntervalDays(Number(e.target.value))}
              min='1'
            />
          </div>
        )}
        {selectedCategory === 'periodic' && (
          <div className='config-field'>
            <label>순환 주기</label>
            <select
              value={periodicType}
              onChange={(e) => setPeriodicType(e.target.value as any)}>
              <option value='daily'>매일</option>
              <option value='weekly'>매주</option>
              <option value='monthly'>매월</option>
            </select>
          </div>
        )}
      </div>

      <div className='add-section'>
        <input
          type='text'
          className='add-input'
          placeholder='새로운 수행 과업을 입력하십시오...'
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddSchedule()}
        />
        <button className='add-button' onClick={handleAddSchedule}>
          등록
        </button>
      </div>

      {/* GROUPED TASK LISTS BY USER CATEGORY */}
      {groupedSchedules.map((group) => (
        <div key={group.categoryName} className='schedule-category-section'>
          <h3 className='section-title'>{group.categoryName}</h3>
          <div className='task-list'>
            {group.items.map((item) => (
              <div
                key={item.id}
                className={`task-card ${item.completed ? 'completed' : ''} cat-${item.scheduleCategory}`}>
                <div className='task-main-row'>
                  <input
                    type='checkbox'
                    className='checkbox'
                    checked={item.completed}
                    onChange={() => completeSchedule(item.id)}
                    disabled={
                      item.completed &&
                      (item.scheduleCategory === 'habit' ||
                        item.scheduleCategory === 'interval' ||
                        (item.scheduleCategory === 'goal' &&
                          (item.config as GoalConfig).isCompleted))
                    }
                  />
                  <span className={`cat-badge ${item.scheduleCategory}`}>
                    {categoryLabels[item.scheduleCategory]}
                  </span>
                  <input
                    type='text'
                    className={`task-title-input ${item.completed ? 'completed' : ''}`}
                    value={item.config.name}
                    onChange={(e) => handleUpdateName(item.id, e.target.value)}
                    disabled={
                      item.completed &&
                      (item.scheduleCategory === 'habit' ||
                        item.scheduleCategory === 'interval' ||
                        (item.scheduleCategory === 'goal' &&
                          (item.config as GoalConfig).isCompleted))
                    }
                  />
                  <span
                    className='delete-icon'
                    onClick={() => deleteSchedule(item.id)}>
                    ✕
                  </span>
                </div>
                {/* 카테고리별 세부 정보 표시 */}
                {renderScheduleInfo(item)}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Empty State for no schedules */}
      {schedules.length === 0 && (
        <div className='empty-state'>
          <span className='empty-icon'>📅</span>
          <p className='empty-text'>아직 등록된 스케줄이 없습니다.</p>
          <p className='empty-subtext'>
            새로운 스케줄을 추가하여 정진을 시작해 보세요.
          </p>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
