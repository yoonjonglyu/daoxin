import { createBrowserRouter } from 'react-router';

import MainPage from './main';
import CategoryPage from './category';
import SchedulePage from './schedule';

const router = createBrowserRouter(
  [
    { path: '/', element: <MainPage /> },
    { path: '/category', element: <CategoryPage /> },
    { path: '/schedule', element: <SchedulePage /> },
  ],
  { basename: '/daoxin' },
);

export default router;
