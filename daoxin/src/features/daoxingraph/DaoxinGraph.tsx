import React, { useState, useEffect, useRef } from 'react';
import './DaoxinGraph.css';

import CGraph from '../../components/cgraph/CGraph';

import useDaoxin from '../../hooks/useDaoxin';

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

  const [isFeedback, setIsFeedback] = useState(false);
  // 완료된 수련 항목의 개수를 계산하여 체크 액션을 감지합니다.
  const completedCount = dao.list.filter((item: any) => item.completed).length;
  const prevCount = useRef(completedCount);

  useEffect(() => {
    // 항목이 체크되어 완료 개수가 늘어났을 때만 피드백 애니메이션 실행
    if (completedCount > prevCount.current) {
      setIsFeedback(true);
      const timer = setTimeout(() => setIsFeedback(false), 500);
      return () => clearTimeout(timer);
    }
    prevCount.current = completedCount;
  }, [completedCount]);

  // 경지에 따른 정보 정의
  const getStageInfo = (val: number) => {
    if (val >= 77) return { label: '천교(天巧)', className: 'stage-cheon-gyo', color: '#ffd700' };
    if (val >= 50) return { label: '응심(凝心)', className: 'stage-eung-sim', color: '#9c27b0' };
    if (val >= 25) return { label: '승화(昇華)', className: 'stage-seung-hwa', color: '#4caf50' };
    return { label: '발심(發心)', className: 'stage-bal-sim', color: '#1a73e8' };
  };

  const { label, className, color } = getStageInfo(dao.gauge);

  return (
    <div
      className={`graph-container ${className} ${isFeedback ? 'trigger-feedback' : ''}`}
      style={{ ['--stage-color' as any]: color }}
    >
      <CGraph
        className="daoxin-spirit-sphere"
        style={{
          background: `conic-gradient(${color} 0% ${dao.gauge}%, #eeeeee ${dao.gauge}% 100%)`,
        }}>
        <div className='core-content'>
          <span className='core-label'>도심(道心)</span>
          <strong className='core-value'>
              {label}
            </strong>
        </div>
      </CGraph>
    </div>
  );
};

export default DaoXinGraph;
