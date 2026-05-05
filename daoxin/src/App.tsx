import { useEffect } from 'react';
import { RouterProvider } from 'react-router';

import './App.css';

import router from './pages/index';

import useConfig from './hooks/useConfig';
import useDaoxin from './hooks/useDaoxin';
import useSchedule from './hooks/useSchedule';
import useCategory from './hooks/useCategory';
import useActivityLog from './hooks/useActivityLog';

function App() {
  const { initDaoxin } = useDaoxin();
  const { initSchedules } = useSchedule();
  const { initCategories } = useCategory();
  const { initLogs } = useActivityLog();
  const { initialized, config } = useConfig();

const handleinit = async () => {  
  await initDaoxin();
  await initSchedules();
  await initCategories();
  await initLogs();
  await initialized();
}

  useEffect(() => {
    handleinit();
  }, []);

  if (!config.initialized) {
    return (
      <div className="app-loading-container">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className='wrap'>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
