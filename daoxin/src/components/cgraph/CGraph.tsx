import React from 'react';

import './CGraph.css';

export interface CGraphProps {
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
}

const CGraph: React.FC<CGraphProps> = ({ style, className, children }) => {
  return (
    <div
      className={`c-graph ${className || ''}`}
      style={style}>
      <div className='inner-area'>{children}</div>
    </div>
  );
};

export default CGraph;
