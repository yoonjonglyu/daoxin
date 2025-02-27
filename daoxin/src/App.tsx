import './App.css';

import Header from './components/header/Header';
import SideMenu from './components/aside/SideMenu';

import DaoXinGraph from './features/daoxingraph';
import DaoXinTodo from './features/daoxintodo/DaoXinTodo';

function App() {
  return (
    <div className='wrap'>
      <Header />
      <SideMenu />
      <main role='main'>
          <DaoXinGraph gauge={1} />
          <DaoXinTodo />
      </main>
      <footer></footer>
    </div>
  );
}

export default App;
