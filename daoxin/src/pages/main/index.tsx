import { type FC } from 'react';

import './main.css';

import DaoXinGraph from '../../features/daoxingraph/DaoxinGraph';
import DaoXinTodo from '../../features/daoxintodo/DaoXinTodo';
import DaoXinSchedule from '../../features/daoxinschedule/DaoXinSchedule';
import useDaoxin from '../../hooks/useDaoxin';
import { MAX_GAUGE } from '../../value';
import { useTranslation } from '../../utils/i18n';

const MainPage: FC = () => {
  const { dao } = useDaoxin();
  const { t } = useTranslation();
  const gauge = dao.gauge;

  const getRankInfo = (val: number) => {
    if (val >= 77) return { class: 'stage-cheon-gyo', name: t('stageCheonGyo') };
    if (val >= 50) return { class: 'stage-eung-sim', name: t('stageEungSim') };
    if (val >= 25) return { class: 'stage-seung-hwa', name: t('stageSeungHwa') };
    return { class: 'stage-bal-sim', name: t('stageBalSim') };
  };

  const rankInfo = getRankInfo(gauge);

  return (
    <div className='main-container'>
      {/* STATUS */}
      <section className={`status-section ${rankInfo.class}`}>
        <span className='status-label'>{t('currentRealm')}</span>
        <h2 className='status-title'>
          {rankInfo.name} <span className='level-badge'>{t('levelBadge', { level: dao.level })}</span>
        </h2>
        <DaoXinGraph />
        <div className='progress-bar'>
          <div
            className='progress-fill'
            style={{ width: `${(gauge / MAX_GAUGE) * 100}%` }}
          />
        </div>
        <p className='status-stats'>
          {t('accumulatedQi')} {dao.exp} · {dao.streak}{t('dayStreak')}
        </p>
      </section>

      {/* HABIT */}
      <section className='content-section'>
        <h3 className='section-title'>{t('todaysCultivation')}</h3>
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
