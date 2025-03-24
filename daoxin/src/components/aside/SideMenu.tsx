import React, { useState } from 'react';

import './SideMenu.css';

import SideModal from '../sidemodal/SideModal';

export interface SideMenuProps {
  isAvail: boolean;
}

const SideMenu: React.FC<SideMenuProps> = ({ isAvail }) => {
  const [sideData, setSideData] = useState<null | string>(null);

  const handleSideView = (type: string) => {
    const dumy: any = {
      about: 'about',
      core: 'core',
      medi: 'medi',
      change: <h1>todo</h1>,
      close: null,
    };
    setSideData(dumy[type]);
  };

  return (
    <aside className={`sidemenu-container ${isAvail ? 'active' : ''}`}>
      <div className={`side-view ${sideData !== null ? 'active' : ''}`}>
        <SideModal closeCb={() => handleSideView('close')}>
          {sideData}
        </SideModal>
      </div>
      <ol>
        <li>
          <a href='#' onClick={() => handleSideView('about')}>
            About
          </a>
        </li>
        <li>
          <a href='#' onClick={() => handleSideView('core')}>
            참장
          </a>
        </li>
        <li>
          <a href='#' onClick={() => handleSideView('medi')}>
            명상
          </a>
        </li>
        <li>
          <a href='#' onClick={() => handleSideView('change')}>
            할일변경
          </a>
        </li>
      </ol>
      <p>
        <strong>App Info.</strong>
        <br />
        <span>Email : yunjonglyu@gmail.com</span>
        <br />
        <span>Version : v1.0.0</span>
      </p>
    </aside>
  );
};

export default SideMenu;
