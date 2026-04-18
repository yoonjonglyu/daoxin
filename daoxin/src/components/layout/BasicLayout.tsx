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
        <a href="/" className="nav-item">
          <span className="nav-icon">🏠</span>
          <span className="nav-label">Main</span>
        </a>
        <a href="/daoxin/category" className="nav-item">
          <span className="nav-icon">📂</span>
          <span className="nav-label">Category</span>
        </a>
        <a href="/daoxin/schedule" className="nav-item">
          <span className="nav-icon">📅</span>
          <span className="nav-label">Schedule</span>
        </a>
      </nav>
    </div>
  );
};

export default BasicLayout;