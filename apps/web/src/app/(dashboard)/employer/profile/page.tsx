'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { apiAuth } from '@/lib/api';
import { Loader2, Upload, Building2, CheckCircle2 } from 'lucide-react';

export default function EmployerProfilePage() {
  const [profile, setProfile] = useState({
    companyName: '',
    industry: '',
    companySize: '201–1,000 employees',
    website: '',
    companyBio: '',
    city: '',
    founded: '',
    linkedin: '',
    twitter: '',
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
        companySize: res.data.companySize || '201–1,000 employees',
        website: res.data.website || '',
        companyBio: res.data.companyBio || '',
        city: res.data.city || '',
        founded: res.data.founded || '',
        linkedin: res.data.linkedin || '',
        twitter: res.data.twitter || '',
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
        companySize: profile.companySize,
        website: profile.website,
        companyBio: profile.companyBio,
        city: profile.city,
        founded: profile.founded,
        linkedin: profile.linkedin,
        twitter: profile.twitter,
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
              <select className="input" id="industry" name="industry" value={profile.industry} onChange={handleChange}>
                <option value="">Select industry...</option>
                <option value="Fintech">Fintech</option>
                <option value="Healthcare">Healthcare</option>
                <option value="E-commerce">E-commerce</option>
                <option value="Logistics">Logistics</option>
                <option value="Education">Education</option>
              </select>
            </div>
          </div>
          <div className="form-grid-2">
            <div className="form-field">
              <label className="form-label" htmlFor="companySize">Company size</label>
              <select className="input" id="companySize" name="companySize" value={profile.companySize} onChange={handleChange}>
                <option value="1–50 employees">1–50 employees</option>
                <option value="51–200 employees">51–200 employees</option>
                <option value="201–1,000 employees">201–1,000 employees</option>
                <option value="1,000+ employees">1,000+ employees</option>
              </select>
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="website">Website</label>
              <input 
                className="input" 
                type="url" 
                id="website" 
                name="website"
                value={profile.website}
                onChange={handleChange}
                placeholder="https://flutterwave.com"
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

        <div className="form-section">
          <div className="form-section__title">Headquarters</div>
          <div className="form-grid-2">
            <div className="form-field">
              <label className="form-label" htmlFor="city">City</label>
              <input 
                className="input" 
                type="text" 
                id="city" 
                name="city"
                value={profile.city}
                onChange={handleChange}
                placeholder="e.g. Lagos, Nigeria"
              />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="founded">Founded</label>
              <input 
                className="input" 
                type="text" 
                id="founded" 
                name="founded"
                value={profile.founded}
                onChange={handleChange}
                placeholder="e.g. 2016"
              />
            </div>
          </div>
        </div>

        <div className="form-section" style={{ borderBottom: 'none', paddingBottom: 0 }}>
          <div className="form-section__title">Social links</div>
          <div className="form-grid-2">
            <div className="form-field">
              <label className="form-label" htmlFor="linkedin">LinkedIn</label>
              <input 
                className="input" 
                type="url" 
                id="linkedin" 
                name="linkedin"
                value={profile.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/company/..."
              />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="twitter">X (Twitter)</label>
              <input 
                className="input" 
                type="url" 
                id="twitter" 
                name="twitter"
                value={profile.twitter}
                onChange={handleChange}
                placeholder="https://x.com/..."
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <Link href={`/reviews/company/${profile.companyName.toLowerCase().replace(/\s+/g, '-')}`} style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--blue-l)' }}>
            View your public company page →
          </Link>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {success && <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#2DB85A', marginRight: '8px' }}>Save successful!</span>}
            <button type="button" className="btn btn--ghost" onClick={() => fetchProfile()}>Cancel</button>
            <button type="submit" disabled={saving} className="btn btn--primary">
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
