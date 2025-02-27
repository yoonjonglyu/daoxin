import React from 'react';

import './Header.css';

export interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
  return (
    <header className='app-header'>
      <nav>MENU</nav>
      <h1>도심</h1>
    </header>
  );
};

export default Header;
