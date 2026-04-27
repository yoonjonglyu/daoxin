import { type FC } from 'react';

import './main.css';

import DaoXinGraph from '../../features/daoxingraph/DaoxinGraph';
import DaoXinTodo from '../../features/daoxintodo/DaoXinTodo';
import DaoXinSchedule from '../../features/daoxinschedule/DaoXinSchedule';
import useDaoxin from '../../hooks/useDaoxin';
import { MAX_GAUGE } from '../../value';

const MainPage: FC = () => {
  const { dao } = useDaoxin();
  const gauge = dao.gauge;

  const getRankInfo = (val: number) => {
    if (val >= 77) return { class: 'stage-cheon-gyo', name: '천교(天巧)' };
    if (val >= 50) return { class: 'stage-eung-sim', name: '응심(凝心)' };
    if (val >= 25) return { class: 'stage-seung-hwa', name: '승화(昇華)' };
    return { class: 'stage-bal-sim', name: '발심(發心)' };
  };

  const rankInfo = getRankInfo(gauge);

  return (
    <div className='main-container'>
      {/* STATUS */}
      <section className={`status-section ${rankInfo.class}`}>
        <span className='status-label'>현재의 경지</span>
        <h2 className='status-title'>
          {rankInfo.name} <span className='level-badge'>제{dao.level}성</span>
        </h2>
        <DaoXinGraph />
        <div className='progress-bar'>
          <div
            className='progress-fill'
            style={{ width: `${(gauge / MAX_GAUGE) * 100}%` }}
          />
        </div>
        <p className='status-stats'>
          누적 공력 {dao.exp} · {dao.streak}일째 정진 중
        </p>
      </section>

      {/* HABIT */}
      <section className='content-section'>
        <h3 className='section-title'>금일의 정진</h3>
        <DaoXinTodo />
      </section>

      {/* SCHEDULE */}
      <section className='content-section'>
        <DaoXinSchedule />
      </section>
    </div>
  );
};

export default MainPage;
