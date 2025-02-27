import './App.css';

import Header from './components/header/Header';
import DaoXinGraph from './features/daoxingraph';
import DaoXinTodo from './features/daoxintodo/DaoXinTodo';

function App() {
  return (
    <div className='wrap'>
      <Header />
      <main role='main'>
          <DaoXinGraph gauge={1} />
          <DaoXinTodo />
      </main>
      <footer></footer>
    </div>
  );
}

export default App;
