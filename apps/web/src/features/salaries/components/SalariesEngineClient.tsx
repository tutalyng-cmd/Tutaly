'use client';

import React, { useState } from 'react';
import { SalarySubmissionModal } from './SalarySubmissionModal';

interface SalariesEngineClientProps {
  defaultTitle?: string;
  defaultLocation?: string;
  buttonText?: string;
}

export const SalariesEngineClient: React.FC<SalariesEngineClientProps> = ({ 
  defaultTitle, 
  defaultLocation,
  buttonText = "Submit a Salary"
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="bg-green hover:bg-green-600 text-white font-medium px-6 py-3 rounded-lg transition-colors shadow-lg"
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
