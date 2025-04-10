import React, { useState } from 'react';

import './SideMenu.css';

import SideModal from '../sidemodal/SideModal';

export interface MenuItemProps {
  key: string;
  title: string;
  content: React.ReactNode;
}
export interface SideMenuProps {
  isAvail: boolean;
  menuList: Array<MenuItemProps>;
}

const SideMenu: React.FC<SideMenuProps> = ({ isAvail, menuList }) => {
  const [sideData, setSideData] = useState<null | React.ReactNode>(null);

  const handleSideView = (type: number | 'close') => {
    if (type === 'close') return setSideData(null);
    setSideData(menuList[type].content);
  };

  return (
    <aside className={`sidemenu-container ${isAvail ? 'active' : ''}`}>
      <div className={`side-view ${sideData !== null ? 'active' : ''}`}>
        <SideModal closeCb={() => handleSideView('close')}>
          {sideData}
        </SideModal>
      </div>
      <ol>
        {menuList.map((item, _idx) => {
          return (
            <li key={item.key}>
              <a href='#' onClick={() => handleSideView(_idx)}>
                {item.title}
              </a>
            </li>
          );
        })}
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
