import { toast } from 'react-hot-toast';
'use client';

import React, { useState, useEffect } from 'react';
import { apiAuth } from '@/lib/api';
'use client';

import React, { useState, useEffect } from 'react';
import { apiAuth } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function EmployerSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<{ email: string; name: string } | null>(null);
  const [notifications, setNotifications] = useState({
    newApplicants: true,
    weeklyDigest: true,
    expiryReminders: true,
    productUpdates: false,
  });

  // MFA State
  const [isMfaEnabled, setIsMfaEnabled] = useState(false);
  const [mfaModalOpen, setMfaModalOpen] = useState(false);
  const [mfaToken, setMfaToken] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaLoading, setMfaLoading] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        // Fetch User profile for email and MFA status
        const userRes = await apiAuth.withToken(token).get('/user/me');
        const empRes = await apiAuth.withToken(token).get('/user/employer/profile');
        setProfile({
          email: userRes.data?.data?.email || '',
          name: empRes.data?.companyName || 'Employer',
        });
        setIsMfaEnabled(userRes.data?.data?.isMfaEnabled || false);

        // Fetch Settings
        const setRes = await apiAuth.withToken(token).get('/users/settings/notifications');
        if (setRes.data) {
          setNotifications(prev => ({
            ...prev,
            ...setRes.data
          }));
        }
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const enableMfaFlow = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      
      const res = await apiAuth.withToken(token).post('/auth/mfa/setup', {});
      if (res.data?.mfaToken) {
        setMfaToken(res.data.mfaToken);
        setMfaModalOpen(true);
        toast.success('OTP sent to your email');
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to start MFA setup');
    }
  };

  const verifyMfa = async () => {
    setMfaLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      
      await apiAuth.withToken(token).post('/auth/mfa/enable', {
        mfaToken,
        code: mfaCode,
        userId: 'temp' // the backend will overwrite this with the authenticated user ID
      });
      
      setIsMfaEnabled(true);
      setMfaModalOpen(false);
      setMfaCode('');
      toast.success('Two-Factor Authentication enabled successfully');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setMfaLoading(false);
    }
  };

  const disableMfa = async () => {
    if (!confirm('Are you sure you want to disable Two-Factor Authentication?')) return;
    
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      
      await apiAuth.withToken(token).post('/auth/mfa/disable', {});
      setIsMfaEnabled(false);
      toast.success('Two-Factor Authentication disabled');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to disable MFA');
    }
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      await apiAuth.withToken(token).patch('/users/settings/notifications', notifications);
      toast.success('Settings saved successfully!');
    } catch (e) {
      console.error('Failed to save settings', e);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
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
    <>
      <div className="dcard">
        <div className="form-section">
          <div className="form-section__title">Account</div>
          <div className="form-section__desc">Your login credentials for this employer account.</div>
          <div className="form-grid-2">
            <div className="form-field">
              <label className="form-label" htmlFor="e-email">Email address</label>
              <input className="input" type="email" id="e-email" value={profile?.email || ''} readOnly />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="e-pass">Password</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input className="input" type="password" defaultValue="••••••••••" disabled style={{ opacity: 0.6 }} />
                <button className="btn btn--ghost btn--sm" style={{ whiteSpace: 'nowrap' }}>Change</button>
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section__title">Account Security</div>
          <div className="form-section__desc">Protect your account with Two-Factor Authentication.</div>
          <div className="form-grid-2">
            <div className="form-field">
              <label className="form-label">Two-Factor Authentication (MFA)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className={`text-sm ${isMfaEnabled ? 'text-green font-medium' : 'text-gray-500'}`}>
                  {isMfaEnabled ? 'Enabled' : 'Disabled'}
                </span>
                <button 
                  className={`btn btn--sm ${isMfaEnabled ? 'btn--ghost' : 'btn--primary'}`}
                  onClick={isMfaEnabled ? disableMfa : enableMfaFlow}
                >
                  {isMfaEnabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section__title">Notifications</div>
          <div className="toggle-row" onClick={() => toggleNotification('newApplicants')} style={{ cursor: 'pointer' }}>
            <div>
              <div className="toggle-row__title">New applicants</div>
              <div className="toggle-row__desc">Get notified when someone applies to your job posts</div>
            </div>
            <div className={`toggle-switch ${notifications.newApplicants ? 'on' : ''}`}></div>
          </div>
          <div className="toggle-row" onClick={() => toggleNotification('weeklyDigest')} style={{ cursor: 'pointer' }}>
            <div>
              <div className="toggle-row__title">Weekly performance digest</div>
              <div className="toggle-row__desc">Summary of views, applications, and pipeline movement</div>
            </div>
            <div className={`toggle-switch ${notifications.weeklyDigest ? 'on' : ''}`}></div>
          </div>
          <div className="toggle-row" onClick={() => toggleNotification('expiryReminders')} style={{ cursor: 'pointer' }}>
            <div>
              <div className="toggle-row__title">Job post expiry reminders</div>
              <div className="toggle-row__desc">Alert 3 days before a listing expires</div>
            </div>
            <div className={`toggle-switch ${notifications.expiryReminders ? 'on' : ''}`}></div>
          </div>
          <div className="toggle-row" onClick={() => toggleNotification('productUpdates')} style={{ cursor: 'pointer' }}>
            <div>
              <div className="toggle-row__title">Product updates &amp; tips</div>
              <div className="toggle-row__desc">Occasional emails about new employer features</div>
            </div>
            <div className={`toggle-switch ${notifications.productUpdates ? 'on' : ''}`}></div>
          </div>
        </div>

        <div className="form-section" style={{ borderBottom: 'none', paddingBottom: 0 }}>
          <div className="form-section__title">Team members</div>
          <div className="form-section__desc">People with access to this employer account.</div>

          <div className="team-row">
            <div className="team-row__avatar" style={{ background: 'linear-gradient(135deg, var(--blue), var(--blue-l))' }}>
              {profile?.name ? profile.name.substring(0,2).toUpperCase() : 'OW'}
            </div>
            <div>
              <div className="team-row__name">{profile?.name || 'Owner'}</div>
              <div className="team-row__email">{profile?.email || 'owner@example.com'}</div>
            </div>
            <div className="team-row__role">
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--gold-h)', background: 'var(--gold-light)', padding: '3px 10px', borderRadius: 'var(--r-pill)' }}>Owner</span>
            </div>
          </div>
          
          {/* Mock extra members for UI demonstration */}
          <div className="team-row">
            <div className="team-row__avatar" style={{ background: 'linear-gradient(135deg, var(--green), var(--green-light))' }}>NT</div>
            <div>
              <div className="team-row__name">Ngozi Thomas</div>
              <div className="team-row__email">ngozi@example.com</div>
            </div>
            <div className="team-row__role">
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--c-400)', background: 'var(--c-700)', padding: '3px 10px', borderRadius: 'var(--r-pill)' }}>Recruiter</span>
            </div>
          </div>
          <button className="btn btn--ghost btn--sm" style={{ marginTop: '14px' }}>+ Invite team member</button>
        </div>
      </div>

      <div className="dcard-footer">
        <button className="btn btn--primary" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save settings'}
        </button>
      </div>

      {mfaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl relative">
            <h3 className="text-xl font-semibold text-navy mb-2">Verify your email</h3>
            <p className="text-gray-500 mb-6 text-sm">
              We've sent a 6-digit code to <strong>{profile?.email}</strong>. Enter it below to enable Two-Factor Authentication.
            </p>
            <div className="space-y-4">
              <div className="form-field">
                <label className="form-label text-sm text-navy/70">Confirmation Code</label>
                <input
                  type="text"
                  placeholder="000000"
                  className="input text-center text-xl tracking-[0.5em] font-mono py-3"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  className="btn btn--ghost flex-1"
                  onClick={() => { setMfaModalOpen(false); setMfaCode(''); }}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn--primary flex-1"
                  onClick={verifyMfa}
                  disabled={mfaCode.length !== 6 || mfaLoading}
                >
                  {mfaLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Verify & Enable'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
