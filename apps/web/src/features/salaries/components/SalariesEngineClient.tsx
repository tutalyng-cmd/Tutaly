'use client';

import React, { useState } from 'react';
import { SalarySubmissionModal } from './SalarySubmissionModal';

interface SalariesEngineClientProps {
  defaultTitle?: string;
  defaultLocation?: string;
  buttonText?: string;
  buttonVariant?: 'primary' | 'ghost';
}

export const SalariesEngineClient: React.FC<SalariesEngineClientProps> = ({ 
  defaultTitle, 
  defaultLocation,
  buttonText = "Submit a Salary",
  buttonVariant = 'primary',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className={buttonVariant === 'primary' ? 'btn btn--primary' : 'btn btn--ghost'}
      >
        {buttonText}
      </button>

      <SalarySubmissionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        defaultTitle={defaultTitle}
        defaultLocation={defaultLocation}
      />
    </>
  );
};
