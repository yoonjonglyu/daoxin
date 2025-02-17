import React from 'react';

import './CGraph.css';

export interface CGraphProps {}

const CGraph: React.FC<CGraphProps> = () => {
  return (
    <div className='c-graph'>
      <div className='inner-area'></div>
    </div>
  );
};

export default CGraph;
