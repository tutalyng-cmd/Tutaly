'use client';

import React, { useState, useEffect } from 'react';
import { User, FileText, UploadCloud, Save, CheckCircle2 } from 'lucide-react';
import { apiAuth } from '@/lib/api';

export default function SeekerProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    headline: '',
    location: '',
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
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        headline: data.headline || '',
        location: data.location || '',
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
        firstName: profile.firstName,
        lastName: profile.lastName,
        headline: profile.headline,
        location: profile.location,
        bio: profile.bio,
        skills: skillsArray,
        socialLinks: profile.socialLinks
      });
      
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const uploadFile = async (file: File) => {
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
    } catch (err: unknown) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to upload resume' });
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
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
              <label 
                className={`block w-full border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${isDragging ? 'border-teal-500 bg-teal-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                 <UploadCloud className={`w-8 h-8 mx-auto mb-3 ${isDragging ? 'text-teal-500' : 'text-gray-400'}`} />
                 <span className="block text-sm font-medium text-gray-700 mb-1">
                   {isDragging ? 'Drop PDF here' : 'Click to upload or drag and drop'}
                 </span>
                 <span className="block text-xs text-gray-500">
                   PDF (max. 5MB)
                 </span>
                 <input 
                    type="file" 
                    accept="application/pdf"
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="hidden"
                  />
               </label>
               {uploading && <p className="text-xs text-blue-600 font-medium mt-3 text-center">Uploading to Supabase Storage...</p>}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input 
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-black focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input 
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-black focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Professional Headline</label>
                <input 
                  type="text"
                  value={profile.headline}
                  onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-black focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input 
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  placeholder="e.g. Lagos, Nigeria"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-black focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Professional Bio</label>
                <textarea 
                  rows={4}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell employers about your experience..."
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-black focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Core Skills (comma separated)</label>
                <input 
                  type="text"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="React, Node.js, Project Management"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-black focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
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
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-black focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio Web URL</label>
                  <input 
                    type="url"
                    value={profile.socialLinks.portfolio}
                    onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, portfolio: e.target.value } })}
                    placeholder="https://yourwebsite.com"
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-black focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
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
