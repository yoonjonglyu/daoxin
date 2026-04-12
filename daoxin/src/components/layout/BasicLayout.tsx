import React from "react";

import './basiclayout.css';

export interface BasicLayoutProps {
  children?: React.ReactNode;
}

const BasicLayout: React.FC<BasicLayoutProps> = ({ children }) => {
  return (
    <div className="basic-layout">
      <main style={{ flex: 1, padding: "1rem" }}>{children}</main>
      <nav className="bottom-navigation">
        <a href="/">Main</a>
        <a href="/daoxin/category">Category</a>
        <a href="/daoxin/schedule">Schedule</a>
      </nav>

    </div>
  );
};

export default BasicLayout;