import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router';

import './App.css';

import router from './pages/index';

import SettingsModal from './features/settings/SettingsModal';

import useConfig from './hooks/useConfig';
import useDaoxin from './hooks/useDaoxin';
import useSchedule from './hooks/useSchedule';
import useCategory from './hooks/useCategory';
import useActivityLog from './hooks/useActivityLog';
import useInventory from './hooks/useInventory';

function App() {
  const { initDaoxin } = useDaoxin();
  const { initSchedules } = useSchedule();
  const { initCategories } = useCategory();
  const { initLogs } = useActivityLog();
  const { initInventory } = useInventory();
  const { initialized, config, initConfig } = useConfig();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

const handleinit = async () => {  
  await initConfig();
  await initDaoxin();
  await initSchedules();
  await initCategories();
  await initLogs();
  await initInventory();
  await initialized();
}

  useEffect(() => {
    handleinit();

    // 앱이 포그라운드로 복귀하거나 탭이 다시 활성화될 때 날짜 경과 감지 및 스케줄/도심 상태 갱신
    const handleResume = () => {
      if (document.visibilityState === 'visible') {
        initSchedules();
        initDaoxin();
      }
    };

    document.addEventListener('visibilitychange', handleResume);
    window.addEventListener('focus', handleResume);

    return () => {
      document.removeEventListener('visibilitychange', handleResume);
      window.removeEventListener('focus', handleResume);
    };
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
      <RouterProvider router={router({ onSettingsClick: () => setIsSettingsOpen(true) })} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}

export default App;
