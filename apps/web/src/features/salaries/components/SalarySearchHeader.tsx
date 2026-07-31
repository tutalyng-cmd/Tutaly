import React from 'react';

interface SalarySearchHeaderProps {
  initialTitle: string;
  initialLocation: string;
}

export const SalarySearchHeader: React.FC<SalarySearchHeaderProps> = ({ initialTitle, initialLocation }) => {
  return (
    <div className="bg-c900 border-b border-c800 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-2">Salary & Compensation Insights</h1>
        <p className="text-c400 mb-8 max-w-2xl">
          Search anonymous salaries and compensation data. See how your pay compares to the market average.
        </p>
        
        <form action="/salaries" method="GET" className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input 
              type="text" 
              name="title" 
              defaultValue={initialTitle}
              placeholder="Job Title (e.g. Software Engineer)"
              className="w-full bg-c800 border border-c700 text-white placeholder-c500 rounded-lg px-4 py-3 focus:outline-none focus:border-green focus:ring-1 focus:ring-green transition-colors"
              required
            />
          </div>
          <div className="flex-1 relative">
            <input 
              type="text" 
              name="location" 
              defaultValue={initialLocation}
              placeholder="Location (e.g. Lagos, or leave blank for All)"
              className="w-full bg-c800 border border-c700 text-white placeholder-c500 rounded-lg px-4 py-3 focus:outline-none focus:border-green focus:ring-1 focus:ring-green transition-colors"
            />
          </div>
          <button type="submit" className="bg-green hover:bg-green text-white font-medium px-8 py-3 rounded-lg transition-colors whitespace-nowrap">
            Search Salaries
          </button>
        </form>
      </div>
    </div>
  );
};
