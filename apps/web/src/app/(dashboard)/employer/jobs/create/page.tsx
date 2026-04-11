'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiAuth } from '@/lib/api';

export default function PostJobPage() {
  const router = useRouter();
  
  // Local state for dropdowns
  const [countries, setCountries] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  
  const [selectedCountry, setSelectedCountry] = useState('Nigeria');
  const [selectedState, setSelectedState] = useState('');
  
  const [locationsData, setLocationsData] = useState<any>({});
  
  // Real implementation would fetch this from a robust JSON or API endpoint
  // But we have apps/api/src/shared/data/locations.json!
  // To avoid complexity right here, we structure the cascading logic:

  useEffect(() => {
    // In a real implementation we would fetch the raw JSON or a dedicated endpoint.
    // Simulating the fetched structure for "Nigeria" to demonstrate standard UX
    const MOCK_DATA = {
      "Nigeria": {
        "Lagos": ["Ikeja", "Lekki", "Victoria Island", "Surulere"],
        "Abuja": ["Garki", "Wuse", "Maitama"],
        "Rivers": ["Port Harcourt", "Obio/Akpor"]
      }
    };
    setLocationsData(MOCK_DATA);
    setCountries(Object.keys(MOCK_DATA));
    setStates(Object.keys(MOCK_DATA["Nigeria"] || {}));
  }, []);

  useEffect(() => {
    if (locationsData[selectedCountry]) {
      setStates(Object.keys(locationsData[selectedCountry]));
    } else {
      setStates([]);
    }
    setSelectedState('');
  }, [selectedCountry, locationsData]);

  useEffect(() => {
    if (locationsData[selectedCountry] && locationsData[selectedCountry][selectedState]) {
      setAreas(locationsData[selectedCountry][selectedState]);
    } else {
      setAreas([]);
    }
  }, [selectedState, selectedCountry, locationsData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = Object.fromEntries(formData.entries());
    
    // Quick parse for numbers
    if (data.minSalary) data.minSalary = Number(data.minSalary);
    if (data.maxSalary) data.maxSalary = Number(data.maxSalary);
    
    try {
      // Assuming token is kept in localStorage for the "Client" side API usage
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error("Not authenticated");
      
      const res = await apiAuth.withToken(token).post('/jobs', data);
      alert('Job posted successfully! It is now pending admin review.');
      router.push('/employer/jobs');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || err.message || 'Failed to post job');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Post a New Job</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
        <div className="px-4 py-6 sm:p-8 space-y-8">
          
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900">
                Job Title
              </label>
              <div className="mt-2 text-gray-900">
                <input
                  type="text"
                  name="title"
                  id="title"
                  required
                  className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
                  placeholder="e.g. Senior Backend Engineer"
                />
              </div>
            </div>

            <div className="col-span-full">
              <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
                Job Description
              </label>
              <div className="mt-2 text-gray-900">
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  required
                  className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-200" />

          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-2 sm:col-start-1">
              <label htmlFor="country" className="block text-sm font-medium leading-6 text-gray-900">
                Country
              </label>
              <div className="mt-2 text-gray-900">
                <select
                  id="country"
                  name="country"
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:max-w-xs sm:text-sm sm:leading-6"
                >
                  <option value="">Select country...</option>
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="state" className="block text-sm font-medium leading-6 text-gray-900">
                State
              </label>
              <div className="mt-2 text-gray-900">
                <select
                  id="state"
                  name="state"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:max-w-xs sm:text-sm sm:leading-6"
                >
                  <option value="">Select state...</option>
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="area" className="block text-sm font-medium leading-6 text-gray-900">
                Area
              </label>
              <div className="mt-2 text-gray-900">
                <select
                  id="area"
                  name="area"
                  className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:max-w-xs sm:text-sm sm:leading-6"
                >
                  <option value="">Select area...</option>
                  {areas.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>
            
            <div className="sm:col-span-3">
              <label htmlFor="industry" className="block text-sm font-medium leading-6 text-gray-900">Industry</label>
              <div className="mt-2 text-gray-900">
                <input type="text" name="industry" id="industry" required className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6" />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="role" className="block text-sm font-medium leading-6 text-gray-900">Role</label>
              <div className="mt-2 text-gray-900">
                <input type="text" name="role" id="role" required className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6" />
              </div>
            </div>
            
            <div className="sm:col-span-2">
              <label htmlFor="jobType" className="block text-sm font-medium leading-6 text-gray-900">Job Type</label>
              <select name="jobType" id="jobType" className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6">
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="experienceLevel" className="block text-sm font-medium leading-6 text-gray-900">Experience</label>
              <select name="experienceLevel" id="experienceLevel" className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6">
                <option value="ENTRY">Entry Level</option>
                <option value="MID">Mid Level</option>
                <option value="SENIOR">Senior Level</option>
                <option value="LEAD">Lead / Manager</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="workMode" className="block text-sm font-medium leading-6 text-gray-900">Work Mode</label>
              <select name="workMode" id="workMode" className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:text-sm sm:leading-6">
                <option value="ONSITE">On-site</option>
                <option value="HYBRID">Hybrid</option>
                <option value="REMOTE">Remote</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 px-4 py-4 sm:px-8 bg-gray-50 rounded-b-xl">
          <button type="button" onClick={() => router.back()} className="text-sm font-semibold leading-6 text-gray-900">
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md bg-teal-600 px-8 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 transition"
          >
            Post Job
          </button>
        </div>
      </form>
    </div>
  );
}
