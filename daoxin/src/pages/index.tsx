import { createBrowserRouter, Outlet } from 'react-router';

import BasicLayout from '../components/layout/basiclayout';

import MainPage from './main';
import CategoryPage from './category';
import SchedulePage from './schedule';

const router = createBrowserRouter(
  [
    {
      element: (
        <BasicLayout>
          <Outlet />
        </BasicLayout>
      ),
      children: [
        { path: '/', element: <MainPage /> },
        { path: '/category', element: <CategoryPage /> },
        { path: '/schedule', element: <SchedulePage /> },
      ],
    },
  ],
  { basename: '/daoxin' },
);

export default router;
