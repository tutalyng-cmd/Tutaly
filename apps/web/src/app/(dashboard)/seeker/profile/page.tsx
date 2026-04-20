'use client';

import React, { useState, useEffect } from 'react';
import { User, FileText, UploadCloud, Save, CheckCircle2 } from 'lucide-react';
import { apiAuth } from '@/lib/api';

export default function SeekerProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  const [profile, setProfile] = useState({
    bio: '',
    skills: [] as string[],
    socialLinks: { linkedin: '', portfolio: '' },
    resumeSignedUrl: null as string | null
  });

  const [skillsInput, setSkillsInput] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const { data } = await apiAuth.withToken(token).get('/user/seeker/profile');
      setProfile({
        bio: data.bio || '',
        skills: data.skills || [],
        socialLinks: data.socialLinks || { linkedin: '', portfolio: '' },
        resumeSignedUrl: data.resumeSignedUrl
      });
      setSkillsInput((data.skills || []).join(', '));
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const token = localStorage.getItem('access_token');
      
      const skillsArray = skillsInput
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      await apiAuth.withToken(token!).patch('/user/seeker/profile', {
        bio: profile.bio,
        skills: skillsArray,
        socialLinks: profile.socialLinks
      });
      
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
       setMessage({ type: 'error', text: 'Only PDF resumes are supported.' });
       return;
    }

    if (file.size > 5 * 1024 * 1024) {
       setMessage({ type: 'error', text: 'File must be under 5MB.' });
       return;
    }

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('access_token');
      // Using raw fetch here since our API utility might not handle FormData perfectly
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/user/seeker/resume`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Upload failed');
      }

      setMessage({ type: 'success', text: 'Resume uploaded successfully! It is now stored in Supabase.' });
      
      // Refresh the profile to get the new signed URL
      fetchProfile();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to upload resume' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 pb-16 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
        <div className="h-[400px] bg-gray-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-8 pb-16 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Applicant Profile</h1>
        <p className="text-gray-500 mt-1">Manage your details and upload your PDF Resume to start applying for jobs.</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Col: Resume Area */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center">
            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900">Your Resume</h3>
            
            {profile.resumeSignedUrl ? (
              <div className="mt-4">
                <a 
                  href={profile.resumeSignedUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-teal-600 hover:text-teal-700 underline"
                >
                  View current resume (PDF)
                </a>
                <p className="text-xs text-gray-500 mt-2">Ready for applications</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-2">No resume uploaded</p>
            )}

            <div className="mt-6 border-t border-gray-100 pt-6">
               <label className="block w-full">
                 <span className="sr-only">Choose profile photo</span>
                 <input 
                    type="file" 
                    accept="application/pdf"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer disabled:opacity-50"
                  />
               </label>
               {uploading && <p className="text-xs text-blue-600 font-medium mt-3">Uploading to Supabase Storage...</p>}
            </div>
          </div>
        </div>

        {/* Right Col: Details Form */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-4 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-gray-400" />
              Basic Details
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Professional Bio</label>
                <textarea 
                  rows={4}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell employers about your experience..."
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Core Skills (comma separated)</label>
                <input 
                  type="text"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="React, Node.js, Project Management"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                  <input 
                    type="url"
                    value={profile.socialLinks.linkedin}
                    onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, linkedin: e.target.value } })}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio Web URL</label>
                  <input 
                    type="url"
                    value={profile.socialLinks.portfolio}
                    onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, portfolio: e.target.value } })}
                    placeholder="https://yourwebsite.com"
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  type="submit"
                  disabled={saving}
                  className="bg-gray-900 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-black transition flex items-center gap-2 disabled:bg-gray-400"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
