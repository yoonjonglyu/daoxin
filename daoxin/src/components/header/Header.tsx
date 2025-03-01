import React from 'react';

import './Header.css';

export interface HeaderProps {
  navHandler: Function;
}

const Header: React.FC<HeaderProps> = ({ navHandler }) => {
  return (
    <header className='app-header'>
      <nav onClick={() => navHandler()}>MENU</nav>
      <h1>도심</h1>
    </header>
  );
};

export default Header;
