'use client';

import React, { useState, useEffect } from 'react';
import { apiAuth } from '@/lib/api';
import { CheckCircle2, UploadCloud, FileText } from 'lucide-react';

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

      setMessage({ type: 'success', text: 'Resume uploaded successfully!' });
      fetchProfile();
    } catch (e) {
      const err = e as any;
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

  return (
    <>
      <div style={{ marginBottom: '24px' }}>
        <h1 className="section__title" style={{ fontSize: '28px', marginBottom: '8px' }}>Applicant Profile</h1>
        <p className="section__subtitle" style={{ marginBottom: 0 }}>Manage your details and upload your PDF Resume to start applying for jobs.</p>
      </div>

      {message && (
        <div style={{ 
          marginBottom: '24px', 
          padding: '16px', 
          borderRadius: 'var(--r-lg)', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          background: message.type === 'success' ? 'rgba(29,122,58,0.12)' : 'rgba(204,43,43,0.12)',
          color: message.type === 'success' ? '#2DB85A' : '#F05050',
          border: `1px solid ${message.type === 'success' ? 'rgba(29,122,58,0.35)' : 'rgba(204,43,43,0.35)'}`
        }}>
          {message.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--c-500)' }}>Loading profile...</div>
      ) : (
        <div className="overview-grid" style={{ gridTemplateColumns: '1fr 1.5fr' }}>
          
          {/* Resume Upload Col */}
          <div className="dcard">
            <div className="form-section__title">Your Resume</div>
            <div className="form-section__desc">Must be a PDF under 5MB</div>
            
            <label 
              className="dropzone"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{ display: 'block', borderColor: isDragging ? 'var(--blue)' : 'var(--c-600)', background: isDragging ? 'rgba(27,79,158,0.04)' : 'transparent' }}
            >
              <div className="dropzone__icon"><UploadCloud className="w-8 h-8 mx-auto" /></div>
              <div className="dropzone__title">{isDragging ? 'Drop PDF here' : 'Click to upload or drag and drop'}</div>
              <div className="dropzone__hint">PDF (max. 5MB)</div>
              <input 
                type="file" 
                accept="application/pdf"
                onChange={handleFileChange}
                disabled={uploading}
                style={{ display: 'none' }}
              />
            </label>
            {uploading && <div style={{ fontSize: '12px', color: 'var(--blue-l)', marginTop: '12px', textAlign: 'center' }}>Uploading...</div>}

            {profile.resumeSignedUrl && (
              <div className="file-chip">
                <FileText className="file-chip__icon w-5 h-5" />
                <div className="file-chip__name">resume.pdf</div>
                <a href={profile.resumeSignedUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--blue-l)', fontSize: '12px', fontWeight: 500 }}>
                  View
                </a>
              </div>
            )}
          </div>

          {/* Profile Details Col */}
          <div className="dcard">
            <form onSubmit={handleSaveProfile}>
              
              <div className="form-section">
                <div className="form-section__title">Basic Information</div>
                <div className="form-section__desc">Your identity on Tutaly.</div>
                
                <div className="form-grid-2">
                  <div className="field-group">
                    <label className="field-label">First Name</label>
                    <input 
                      type="text" 
                      className="field-input" 
                      value={profile.firstName}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Last Name</label>
                    <input 
                      type="text" 
                      className="field-input" 
                      value={profile.lastName}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="field-group" style={{ marginTop: '16px' }}>
                  <label className="field-label">Professional Headline</label>
                  <input 
                    type="text" 
                    className="field-input" 
                    value={profile.headline}
                    onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                    placeholder="e.g. Senior Software Engineer"
                  />
                </div>
              </div>

              <div className="form-section">
                <div className="form-section__title">About You</div>
                <div className="form-section__desc">Write a brief overview of your experience.</div>
                
                <div className="field-group">
                  <label className="field-label">Location</label>
                  <input 
                    type="text" 
                    className="field-input" 
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    placeholder="e.g. Lagos, Nigeria"
                  />
                </div>

                <div className="field-group" style={{ marginTop: '16px' }}>
                  <label className="field-label">Professional Bio</label>
                  <textarea 
                    className="textarea" 
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Tell employers about your experience..."
                  ></textarea>
                </div>

                <div className="field-group" style={{ marginTop: '16px' }}>
                  <label className="field-label">Core Skills (comma separated)</label>
                  <input 
                    type="text" 
                    className="field-input" 
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    placeholder="React, Node.js, Project Management"
                  />
                </div>
              </div>

              <div className="form-section">
                <div className="form-section__title">Links</div>
                <div className="form-section__desc">Where else can people find you?</div>
                
                <div className="form-grid-2">
                  <div className="field-group">
                    <label className="field-label">LinkedIn URL</label>
                    <input 
                      type="url" 
                      className="field-input" 
                      value={profile.socialLinks.linkedin}
                      onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, linkedin: e.target.value } })}
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Portfolio URL</label>
                    <input 
                      type="url" 
                      className="field-input" 
                      value={profile.socialLinks.portfolio}
                      onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, portfolio: e.target.value } })}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px' }}>
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}
