import React from 'react';

import './SideModal.css';

export interface SideModalProps {
  children?: React.ReactNode;
  closeCb?: VoidFunction;
}

const SideModal: React.FC<SideModalProps> = ({ children, closeCb }) => {
  return (
    <div className='side-modal'>
      <article className='side-content'>{children}</article>
      <button className='close' onClick={closeCb}>Close</button>
    </div>
  );
};

export default SideModal;
