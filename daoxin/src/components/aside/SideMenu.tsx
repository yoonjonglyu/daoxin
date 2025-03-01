import React from 'react';

import './SideMenu.css';

export interface SideMenuProps {
  isAvail: boolean;
}

const SideMenu: React.FC<SideMenuProps> = ({ isAvail }) => {
  return (
    <aside className={`sidemenu-container ${isAvail ? 'active' : ''}`}>
      <ul>
        <li>About</li>
        <li>
          기법...
          <ul>
            <li>참장</li>
            <li>명상</li>
          </ul>
        </li>
        <li>할일변경</li>
      </ul>
      <p>
        <strong>App Info.</strong>
        <br />
        <span>email</span>
        <br />
        <span>version</span>
      </p>
    </aside>
  );
};

export default SideMenu;
