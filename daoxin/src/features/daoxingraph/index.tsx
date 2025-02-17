import React from 'react';

import './index.css';

import CGraph from '../../components/CGraph';

export interface DaoXinGraphProps {
}

const DaoXinGraph: React.FC<DaoXinGraphProps> = () => {
  return (
    <div className='graph-container'>
      <CGraph />
    </div>
  );
};

export default DaoXinGraph;
