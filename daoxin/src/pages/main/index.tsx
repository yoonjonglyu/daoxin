import type { FC } from 'react';

import './main.css';

const MainPage: FC = () => {
  return (
    <div className='main-container'>
      {/* STATUS */}
      <div className='status-box'>
        <div style={{ fontSize: '14px', opacity: 0.7 }}>현재 경지</div>
        <div style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>
          수행자 Lv.3
        </div>

        {/* 게이지 */}
        <div className='progress-bar'>
          <div className='progress-fill' />
        </div>
        <div style={{ fontSize: '12px', opacity: 0.7 }}>
          도심 6 / 10 · 🔥 5일 연속
        </div>
      </div>

      {/* HABIT */}
      <div style={{ marginBottom: '20px' }}>
        <div
          style={{
            fontSize: '14px',
            marginBottom: '8px',
            fontWeight: 600,
          }}>
          🔥 Daily Habit
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {['운동', '명상', '독서'].map((item, idx) => (
            <div
              key={idx}
              style={{
                background: '#1e293b',
                padding: '12px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <span>{item}</span>
              <input type='checkbox' />
            </div>
          ))}
        </div>
      </div>

      {/* SCHEDULE */}
      <div>
        <div
          style={{
            fontSize: '14px',
            marginBottom: '8px',
            fontWeight: 600,
          }}>
          📅 Today Schedule
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {['알고리즘 공부', '프로젝트 작업'].map((item, idx) => (
            <div
              key={idx}
              style={{
                background: '#1e293b',
                padding: '12px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <span>{item}</span>
              <button
                style={{
                  background: '#22c55e',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  color: '#0f172a',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}>
                완료
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MainPage;
