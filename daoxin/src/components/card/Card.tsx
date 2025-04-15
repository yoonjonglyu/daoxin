import React from 'react';
import './Card.css';

interface CardProps {
  children?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children }) => {
  return (
    <div className='card'>
      <div className='card-content'>{children}</div>
    </div>
  );
};

export default Card;
