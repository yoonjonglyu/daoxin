import { useEffect } from 'react';
import { RouterProvider } from 'react-router';

import './App.css';

import router from './pages/index';

import useDaoxin from './hooks/useDaoxin';
import useSchedule from './hooks/useSchedule';
import useCategory from './hooks/useCategory';
import useActivityLog from './hooks/useActivityLog';

function App() {
  const { initDaoxin } = useDaoxin();
  const { initSchedules } = useSchedule();
  const { initCategories } = useCategory();
  const { initLogs } = useActivityLog();

  useEffect(() => {
    initDaoxin();
    initSchedules();
    initCategories();
    initLogs();
  }, []);

  return (
    <div className='wrap'>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
