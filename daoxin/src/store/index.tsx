import React from 'react';
import { Provider } from 'jotai';

export interface StoreProviderProps {
  children: React.ReactNode;
}

const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  return <Provider>{children}</Provider>;
};

export default StoreProvider;
