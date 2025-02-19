import React from 'react';

import './index.css';

import CGraph from '../../components/CGraph';

/**
 * @description
 * 0이상 발심
 * 25이상 승화
 * 50이상 응심
 * 77이상 천교
 * 그 이상은 존재하지 않는다.
 */

export interface DaoXinGraphProps {
  gauge: number;
}

const DaoXinGraph: React.FC<DaoXinGraphProps> = ({ gauge }) => {
  return (
    <div className='graph-container'>
      <CGraph
        style={{
          background: `conic-gradient(#e6e5e5 0% ${gauge}%, #0a0a0a 0% 100%)`,
        }}>
        <div>
          <strong>
            도심(道心):{' '}
            {gauge < 25
              ? '발심'
              : gauge < 50
              ? '승화'
              : gauge < 77
              ? '응심'
              : gauge >= 77
              ? '천교'
              : '천교'}
          </strong>
        </div>
      </CGraph>
    </div>
  );
};

export default DaoXinGraph;
