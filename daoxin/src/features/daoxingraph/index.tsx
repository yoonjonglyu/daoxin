import React from 'react';

import './index.css';

export interface DaoXinGraphProps {
}

const DaoXinGraph: React.FC<DaoXinGraphProps> = () => {
  return (
    <div className='graph-container'>
      <div className='graph'></div>
    </div>
  );
};

export default DaoXinGraph;
