import React from 'react';
import { useNavigate } from 'react-router-dom';
import UberStyleInterface from '@/components/delivery/UberStyleInterface';

const DeliveryInterface = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full">
      <UberStyleInterface onClose={handleClose} />
    </div>
  );
};

export default DeliveryInterface;