import { useState, useEffect } from 'react';

import './App.css';

import Header from './components/header/Header';
import SideMenu, { MenuItemProps } from './components/aside/SideMenu';

import DaoXinGraph from './features/daoxingraph/DaoxinGraph';
import DaoXinTodo from './features/daoxintodo/DaoXinTodo';
import DaoXinAside from './features/daoxinaside/DaoXinAside';

import useDaoxin from './hooks/useDaoxin';

function App() {
  const { initDaoxin } = useDaoxin();
  const [isSide, setIsSide] = useState(false);

  const handleSideMenu = () => {
    setIsSide((prev) => !prev);
  };

  useEffect(() => {
    initDaoxin();
  }, []);

  return (
    <div className='wrap'>
      <Header navHandler={handleSideMenu} />
      <SideMenu isAvail={isSide} menuList={DaoXinAside} />
      <main role='main'>
        <DaoXinGraph />
        <DaoXinTodo />
      </main>
      <footer></footer>
    </div>
  );
}

export default App;
