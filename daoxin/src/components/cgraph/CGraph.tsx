import React from 'react';

import './CGraph.css';

export interface CGraphProps {
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const CGraph: React.FC<CGraphProps> = ({ style, children }) => {
  return (
    <div
      className='c-graph'
      style={{
        ...style,
      }}>
      <div className='inner-area'>{children}</div>
    </div>
  );
};

export default CGraph;
