'use client';

import React from 'react';
import { AnonymityMode } from '../types/community.types';
import { Shield, User, Briefcase } from 'lucide-react';

interface Props {
  selected: AnonymityMode;
  onChange: (mode: AnonymityMode) => void;
  userFullName?: string;
  userJobTitle?: string;
}

export default function AnonymitySelectorBar({ selected, onChange, userFullName, userJobTitle }: Props) {
  return (
    <div className="bg-c800 rounded-lg p-2 flex flex-col gap-2">
      <div className="text-xs text-c300 font-medium px-2 pt-1 uppercase tracking-wider">Post As</div>
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={() => onChange('full_name')}
          className={`flex-1 flex flex-col items-start gap-1 p-3 rounded-md border text-left transition-colors ${
            selected === 'full_name'
              ? 'border-[var(--blue)] bg-[var(--blue-alpha-30)]'
              : 'border-c700 hover:border-c600 hover:bg-c700'
          }`}
        >
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="font-semibold text-sm">Full Name</span>
          </div>
          <span className="text-xs text-c300 truncate w-full">{userFullName || 'John Doe'}</span>
        </button>

        <button
          type="button"
          onClick={() => onChange('job_title_only')}
          className={`flex-1 flex flex-col items-start gap-1 p-3 rounded-md border text-left transition-colors ${
            selected === 'job_title_only'
              ? 'border-[var(--blue)] bg-[var(--blue-alpha-30)]'
              : 'border-c700 hover:border-c600 hover:bg-c700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            <span className="font-semibold text-sm">Job Title Only</span>
          </div>
          <span className="text-xs text-c300 truncate w-full">{userJobTitle || 'Verified Professional'}</span>
        </button>

        <button
          type="button"
          onClick={() => onChange('anonymous_employee')}
          className={`flex-1 flex flex-col items-start gap-1 p-3 rounded-md border text-left transition-colors ${
            selected === 'anonymous_employee'
              ? 'border-[var(--blue)] bg-[var(--blue-alpha-30)]'
              : 'border-c700 hover:border-c600 hover:bg-c700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span className="font-semibold text-sm">Anonymous</span>
          </div>
          <span className="text-xs text-c300 truncate w-full">Anonymous Employee</span>
        </button>
      </div>
    </div>
  );
}
