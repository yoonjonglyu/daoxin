import { useState, useEffect } from 'react';

import './App.css';

import Header from './components/header/Header';
import SideMenu, { MenuItemProps } from './components/aside/SideMenu';

import DaoXinGraph from './features/daoxingraph/DaoxinGraph';
import DaoXinTodo from './features/daoxintodo/DaoXinTodo';

import useDaoxin from './hooks/useDaoxin';

const sideMenu: Array<MenuItemProps> = [
  {
    key: 'about',
    title: 'about',
    content: (
      <p>
        해당 앱은 사용자의 습관 형성과 관리를 위한 앱입니다. 선협물에서 영감을
        얻은 컨셉으로 꾸준히 정해진 일을 행하며 마음과 의지를 단련하여 한결 같이
        유지하는게 목표입니다. 그리고 그걸 도심이라는 그래프로 시각화해서
        보여줍니다. 꾸준히 정해진 일과를 수행하여서 매일 1씩 도심게이지를 채우면
        발심(마음을내다),승화,응심(굳어지다),천교(천심)이라는 단계를 따라서
        도심이 성장하는 것을 볼 수 있습니다. 또 하루라도 일과를 수행하지
        않은날은 * 1로 도심 게이지가 낮아지며 피드백을 하기에 꾸준히 항상성을
        유지하는데 도움이됩니다.
      </p>
    ),
  },
  { key: 'core', title: '참장공', content: 'core' },
  { key: 'medi', title: '명상', content: '명상에 대하여' },
  { key: 'change', title: '할일변경', content: <h1>todo</h1> },
];

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
      <SideMenu isAvail={isSide} menuList={sideMenu} />
      <main role='main'>
        <DaoXinGraph />
        <DaoXinTodo />
      </main>
      <footer></footer>
    </div>
  );
}

export default App;
