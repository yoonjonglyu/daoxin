import { useEffect } from 'react';
import { RouterProvider } from 'react-router';

import './App.css';

import router from './pages/index';

import useDaoxin from './hooks/useDaoxin';

function App() {
  const { initDaoxin } = useDaoxin();

  useEffect(() => {
    initDaoxin();
  }, []);

  return (
    <div className='wrap'>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
