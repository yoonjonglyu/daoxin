import React from "react";

import './basiclayout.css';

const isCapacitor = import.meta.env.VITE_BUILD_TARGET === 'capacitor';
const routerBasename = isCapacitor ? '' : '/daoxin';

export interface BasicLayoutProps {
  children?: React.ReactNode;
}

const BasicLayout: React.FC<BasicLayoutProps> = ({ children }) => {
  return (
    <div className="basic-layout">
      <main className="layout-content">
        {children}
      </main>
      <nav className="bottom-navigation">
        <a href={routerBasename} className="nav-item">
          <span className="nav-icon">☯️</span>
          <span className="nav-label">정진</span>
        </a>
        <a href={`${routerBasename}category`} className="nav-item">
          <span className="nav-icon">📜</span>
          <span className="nav-label">경지</span>
        </a>
        <a href={`${routerBasename}schedule`} className="nav-item">
          <span className="nav-icon">⚔️</span>
          <span className="nav-label">수행</span>
        </a>
      </nav>
    </div>
  );
};

export default BasicLayout;