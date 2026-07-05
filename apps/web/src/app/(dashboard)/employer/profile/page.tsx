'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = e as any;
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
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = e as any;
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
        <Loader2 className="w-10 h-10 animate-spin text-green" />
      </div>
    );
  }

  return (
    <div className="dcard">
      <form onSubmit={handleSave}>
        <div className="form-section">
          <div className="form-section__title">Company logo</div>
          <div className="form-section__desc">Shown on all your job posts and company review page. Square, min 200×200px.</div>
          
          <div className="avatar-upload">
            <div className="avatar-upload__preview" style={{ borderRadius: 'var(--r-md)', background: profile.logoSignedUrl ? 'transparent' : 'linear-gradient(135deg, var(--green), var(--green-light))' }}>
              {profile.logoSignedUrl ? (
                <img src={profile.logoSignedUrl} alt="Company Logo" className="w-full h-full object-cover" style={{ borderRadius: 'var(--r-md)' }} />
              ) : (
                profile.companyName ? profile.companyName.substring(0, 2).toUpperCase() : 'CO'
              )}
            </div>
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
                className="btn btn--ghost btn--sm"
              >
                {uploadingLogo ? 'Uploading...' : 'Upload new logo'}
              </button>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section__title">Company details</div>
          <div className="form-grid-2">
            <div className="form-field">
              <label className="form-label" htmlFor="companyName">Company name</label>
              <input 
                className="input" 
                type="text" 
                id="companyName" 
                name="companyName" 
                value={profile.companyName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="industry">Industry</label>
              <input 
                className="input" 
                type="text" 
                id="industry" 
                name="industry"
                value={profile.industry}
                onChange={handleChange}
                placeholder="e.g. Technology, Finance, Healthcare"
              />
            </div>
          </div>
          <div className="form-grid-2">
            <div className="form-field">
              <label className="form-label" htmlFor="website">Website</label>
              <input 
                className="input" 
                type="url" 
                id="website" 
                name="website"
                value={profile.website}
                onChange={handleChange}
                placeholder="https://www.example.com"
              />
            </div>
          </div>
          <div className="form-field" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="companyBio">Company description</label>
            <textarea 
              className="textarea" 
              id="companyBio" 
              name="companyBio"
              value={profile.companyBio}
              onChange={handleChange}
              rows={6}
              maxLength={600}
              placeholder="Tell candidates what makes your company a great place to work..."
            />
            <div className="field-char-count">{profile.companyBio.length} / 600</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--green)' }}>
            {success && 'Save successful!'}
          </span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={saving} className="btn btn--primary">
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
