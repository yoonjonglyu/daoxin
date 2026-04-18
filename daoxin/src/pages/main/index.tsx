import type { FC } from 'react';

import './main.css';

import DaoXinGraph from '../../features/daoxingraph/DaoxinGraph';
import DaoXinTodo from '../../features/daoxintodo/DaoXinTodo';
import DaoXinSchedule from '../../features/daoxinschedule/DaoXinSchedule';
import useDaoxin from '../../hooks/useDaoxin';

const MainPage: FC = () => {
  const { dao } = useDaoxin();
  const gauge = dao.gauge;

  const getStageClass = (val: number) => {
    if (val >= 77) return 'stage-cheon-gyo'; // 천교 (Gold)
    if (val >= 50) return 'stage-eung-sim'; // 응심 (Purple)
    if (val >= 25) return 'stage-seung-hwa'; // 승화
    return 'stage-bal-sim'; // 발심
  };

  return (
    <div className='main-container'>
      {/* STATUS */}
      <section className={`status-section ${getStageClass(gauge)}`}>
        <span className='status-label'>현재 경지</span>
        <h2 className='status-title'>수행자 Lv.3</h2>
        <DaoXinGraph />
        <div className='progress-bar'>
          <div className='progress-fill' style={{ width: `${gauge}%` }} />
        </div>
        <p className='status-stats'>도심 {gauge / 10} / 10 · 🔥 5일 연속</p>
      </section>

      {/* HABIT */}
      <section className='content-section'>
        <h3 className='section-title'>🔥 오늘의 수련</h3>
        <DaoXinTodo />
      </section>

      {/* SCHEDULE */}
      <section className='content-section'>
        <h3 className='section-title'>📅 세부 일정</h3>
        <DaoXinSchedule />
      </section>
    </div>
  );
};

export default MainPage;
