import { createBrowserRouter, Outlet } from 'react-router';

import BasicLayout from '../components/layout/BasicLayout';

import MainPage from './main';
import CategoryPage from './category';
import SchedulePage from './schedule';

const isCapacitor = import.meta.env.VITE_BUILD_TARGET === 'capacitor';
const routerBasename = isCapacitor ? '' : '/daoxin';

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
  { basename: routerBasename },
);

export default router;
