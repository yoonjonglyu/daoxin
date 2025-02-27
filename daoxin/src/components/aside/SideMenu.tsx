import React from 'react';

import './SideMenu.css';

export interface SideMenuProps {}

const SideMenu: React.FC<SideMenuProps> = () => {
  return (
    <aside className='sidemenu-container'>
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
