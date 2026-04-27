import React, { useState, useEffect, useRef } from 'react';
import './DaoxinGraph.css';

import CGraph from '../../components/cgraph/CGraph';

import useDaoxin from '../../hooks/useDaoxin';
import useSchedule from '../../hooks/useSchedule';

/**
 * @description
 * 0이상 발심
 * 25이상 승화
 * 50이상 응심
 * 77이상 천교
 * 그 이상은 존재하지 않는다.
 */

export interface DaoXinGraphProps {}

const DaoXinGraph: React.FC<DaoXinGraphProps> = () => {
  const { dao } = useDaoxin();
  const { schedules } = useSchedule();

  const [isFeedback, setIsFeedback] = useState(false);
  const [isBreakthrough, setIsBreakthrough] = useState(false);

  // 완료된 수련 항목의 개수를 계산하여 체크 액션을 감지합니다.
  const completedCount = schedules.filter((item) => item.completed).length;
  const prevCount = useRef(completedCount);
  
  // 현재 경지 정보 계산
  const getStageInfo = (val: number) => {
    if (val >= 77) return { label: '천교(天巧)', className: 'stage-cheon-gyo', color: 'var(--gold-leaf)' };
    if (val >= 50) return { label: '응심(凝心)', className: 'stage-eung-sim', color: 'var(--cinnabar-red)' };
    if (val >= 25) return { label: '승화(昇華)', className: 'stage-seung-hwa', color: 'var(--jade-green)' };
    return { label: '발심(發心)', className: 'stage-bal-sim', color: 'var(--text-dim)' };
  };

  const currentStage = getStageInfo(dao.gauge);
  const prevStageLabel = useRef(currentStage.label);

  useEffect(() => {
    // 경지가 상승했는지 감지 (이전 경지 이름과 다를 경우)
    if (prevStageLabel.current !== currentStage.label && dao.gauge > 0) {
      setIsBreakthrough(true);
      const timer = setTimeout(() => setIsBreakthrough(false), 3000); // 3초간 연출
      prevStageLabel.current = currentStage.label;
      return () => clearTimeout(timer);
    }
  }, [currentStage.label, dao.gauge]);

  useEffect(() => {
    // 항목이 체크되어 완료 개수가 늘어났을 때만 피드백 애니메이션 실행
    if (completedCount > prevCount.current) {
      setIsFeedback(true);
      const timer = setTimeout(() => setIsFeedback(false), 500);
      return () => clearTimeout(timer);
    }
    prevCount.current = completedCount;
  }, [completedCount]);

  const { label, className, color } = currentStage;

  return (
    <div className={`graph-wrapper ${isBreakthrough ? 'breakthrough-active' : ''}`}>
      {/* 파경(Breakthrough) 연출 레이어 */}
      {isBreakthrough && (
        <div className="breakthrough-overlay">
          <div className="bagua-symbol">☯️</div>
          <div className="breakthrough-text">破境 (파경)</div>
          <div className="new-rank-text">{label}</div>
        </div>
      )}

      <div
        className={`graph-container ${className} ${isFeedback ? 'trigger-feedback' : ''}`}
        style={{ ['--stage-color' as any]: color }}
      >
      <CGraph
        className="daoxin-spirit-sphere"
        style={{
          background: `conic-gradient(${color} 0% ${dao.gauge}%, rgba(255,255,255,0.05) ${dao.gauge}% 100%)`,
          boxShadow: `0 0 30px ${color}44, inset 0 0 20px ${color}22`,
          border: `1px solid ${color}33`,
          position: 'relative'
        }}>
        <div className='core-content'>
          <span className='core-label'>도심(道心)</span>
          <strong className='core-value'>
              {label}
            </strong>
        </div>
      </CGraph>
      </div>
    </div>
  );
};

export default DaoXinGraph;
