'use client';

import React, { useEffect, useState, useRef } from 'react';
import { apiAuth } from '@/lib/api';
import { Loader2, Upload, Building2, CheckCircle2 } from 'lucide-react';

export default function EmployerProfilePage() {
  const [profile, setProfile] = useState({
    companyName: '',
    industry: '',
    website: '',
    companyBio: '',
    logoUrl: '',
    logoSignedUrl: '',
    isVerified: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const res = await apiAuth.withToken(token).get('/user/employer/profile');
      setProfile({
        companyName: res.data.companyName || '',
        industry: res.data.industry || '',
        website: res.data.website || '',
        companyBio: res.data.companyBio || '',
        logoUrl: res.data.logoUrl || '',
        logoSignedUrl: res.data.logoSignedUrl || '',
        isVerified: res.data.isVerified || false,
      });
    } catch (err) {
      console.error('Failed to load employer profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      await apiAuth.withToken(token).patch('/user/employer/profile', {
        companyName: profile.companyName,
        industry: profile.industry,
        website: profile.website,
        companyBio: profile.companyBio,
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed for logos');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be under 2MB');
      return;
    }

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      await apiAuth.withToken(token).post('/user/employer/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Refresh to get the new signed URL
      await fetchProfile();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Company Profile</h1>
        <p className="text-gray-500 mt-1">Manage your public employer identity.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100 bg-gray-50/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-white shadow-sm border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                {profile.logoSignedUrl ? (
                  <img src={profile.logoSignedUrl} alt="Company Logo" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-10 h-10 text-gray-300" />
                )}
              </div>
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {profile.companyName || 'Your Company'}
                {profile.isVerified && <CheckCircle2 className="w-5 h-5 text-teal-500" title="Verified Employer" />}
              </h2>
              <p className="text-sm text-gray-500 mb-4">{profile.industry || 'No industry set'}</p>
              
              <div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {profile.logoSignedUrl ? 'Change Logo' : 'Upload Logo'}
                </button>
                <p className="text-xs text-gray-400 mt-2">JPG, PNG or WEBP. Max 2MB.</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6 md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    value={profile.companyName}
                    onChange={handleChange}
                    className="w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry / Sector</label>
                  <input
                    type="text"
                    name="industry"
                    value={profile.industry}
                    onChange={handleChange}
                    className="w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                    placeholder="e.g. Technology, Finance, Healthcare"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                  <input
                    type="url"
                    name="website"
                    value={profile.website}
                    onChange={handleChange}
                    className="w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                    placeholder="https://www.example.com"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6 md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">About the Company</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Bio / Description</label>
                <textarea
                  name="companyBio"
                  value={profile.companyBio}
                  onChange={handleChange}
                  rows={6}
                  className="w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                  placeholder="Tell candidates what makes your company a great place to work..."
                />
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between">
            <div>
              {success && <span className="text-green-600 font-medium flex items-center gap-1"><CheckCircle2 className="w-5 h-5" /> Saved successfully</span>}
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-teal-600 hover:bg-teal-500 text-white px-8 py-3 rounded-xl font-bold shadow-md transition-all flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
