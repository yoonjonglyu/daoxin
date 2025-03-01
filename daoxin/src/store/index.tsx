import React from 'react';
import { RecoilRoot } from 'recoil';

export interface StoreProviderProps {
  children: React.ReactNode;
}

const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  return <RecoilRoot>{children}</RecoilRoot>;
};

export default StoreProvider;
