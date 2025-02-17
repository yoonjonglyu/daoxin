import './App.css';

import DaoXinGraph from './features/daoxingraph';

function App() {
  return (
    <div className='wrap'>
      <header>
        <h1>Daoxin</h1>
      </header>
      <main role='main'>
          <DaoXinGraph />
      </main>
      <footer></footer>
    </div>
  );
}

export default App;
