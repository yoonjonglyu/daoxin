import React from "react";

import './basiclayout.css';

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
        <a href="/daoxin/" className="nav-item">
          <span className="nav-icon">☯️</span>
          <span className="nav-label">정진</span>
        </a>
        <a href="/daoxin/category" className="nav-item">
          <span className="nav-icon">📜</span>
          <span className="nav-label">경지</span>
        </a>
        <a href="/daoxin/schedule" className="nav-item">
          <span className="nav-icon">⚔️</span>
          <span className="nav-label">수행</span>
        </a>
      </nav>
    </div>
  );
};

export default BasicLayout;