'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Shield, Bell, Lock, Key, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import { apiAuth } from '@/lib/api';

export default function SeekerSettingsPage() {
  const [activeTab, setActiveTab] = useState<'account' | 'notifications' | 'privacy'>('account');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    jobMatches: true,
    applicationUpdates: true,
    marketing: false,
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showInDiscover: true,
  });

  // MFA State
  const [profile, setProfile] = useState<{ email: string } | null>(null);
  const [isMfaEnabled, setIsMfaEnabled] = useState(false);
  const [mfaModalOpen, setMfaModalOpen] = useState(false);
  const [mfaToken, setMfaToken] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaLoading, setMfaLoading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        
        const userRes = await apiAuth.withToken(token).get('/user/me');
        setProfile({ email: userRes.data?.data?.email || '' });
        setIsMfaEnabled(userRes.data?.data?.isMfaEnabled || false);
      } catch (err) {
        console.error('Failed to load profile', err);
      }
    }
    loadProfile();
  }, []);

  const enableMfaFlow = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      
      const res = await apiAuth.withToken(token).post('/auth/mfa/setup', {});
      if (res.data?.mfaToken) {
        setMfaToken(res.data.mfaToken);
        if (res.data.otp) {
          setMfaCode(res.data.otp);
        }
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
        userId: 'temp'
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

  const handleSave = async () => {
    setLoading(true);
    setSuccessMsg('');
    try {
      const token = localStorage.getItem('access_token');
      if (activeTab === 'notifications') {
        await apiAuth.withToken(token || undefined).patch('/users/settings/notifications', notifications);
      } else if (activeTab === 'privacy') {
        await apiAuth.withToken(token || undefined).patch('/users/settings/privacy', privacy);
      } else if (activeTab === 'account') {
        if (newPassword && newPassword !== confirmPassword) {
          toast.error("Passwords do not match");
          setLoading(false);
          return;
        }
        if (newPassword) {
          await apiAuth.withToken(token || undefined).patch('/users/settings/password', { currentPassword, newPassword });
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        }
      }
      setSuccessMsg('Settings saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      const err = e as any;
      toast.error(err.response?.data?.message || 'Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overview-grid overview-grid--settings">
      
      {/* Settings Navigation Sidebar */}
      <div className="dcard" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button 
            onClick={() => setActiveTab('account')}
            className={`dash-nav-item ${activeTab === 'account' ? 'active' : ''}`}
            style={{ width: '100%', justifyContent: 'flex-start', border: 'none', background: activeTab === 'account' ? 'var(--blue-l)' : 'transparent', cursor: 'pointer' }}
          >
            <Key className="w-5 h-5" /> Account Security
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`dash-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
            style={{ width: '100%', justifyContent: 'flex-start', border: 'none', background: activeTab === 'notifications' ? 'var(--blue-l)' : 'transparent', cursor: 'pointer' }}
          >
            <Bell className="w-5 h-5" /> Notifications
          </button>
          <button 
            onClick={() => setActiveTab('privacy')}
            className={`dash-nav-item ${activeTab === 'privacy' ? 'active' : ''}`}
            style={{ width: '100%', justifyContent: 'flex-start', border: 'none', background: activeTab === 'privacy' ? 'var(--blue-l)' : 'transparent', cursor: 'pointer' }}
          >
            <Shield className="w-5 h-5" /> Privacy
          </button>
        </div>
      </div>

      {/* Settings Content Area */}
      <div className="dcard">
        <div className="dcard__header" style={{ marginBottom: '24px', borderBottom: '1px solid var(--c-700)', paddingBottom: '16px' }}>
          <div>
            <div className="dcard__title" style={{ fontSize: '20px' }}>
              {activeTab === 'account' && 'Account Security'}
              {activeTab === 'notifications' && 'Notification Preferences'}
              {activeTab === 'privacy' && 'Privacy & Visibility'}
            </div>
            <div className="dcard__sub">
              {activeTab === 'account' && 'Update your password and secure your account.'}
              {activeTab === 'notifications' && 'Control what emails we send you.'}
              {activeTab === 'privacy' && 'Manage how your profile appears to others.'}
            </div>
          </div>
        </div>

        {successMsg && (
          <div style={{ 
            marginBottom: '24px', 
            padding: '16px', 
            borderRadius: 'var(--r-lg)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            background: 'var(--green-l)',
            color: 'var(--green)',
            border: '1px solid var(--green-l)'
          }}>
            <CheckCircle2 className="w-5 h-5" /> {successMsg}
          </div>
        )}

        {/* ACCOUNT TAB */}
        {activeTab === 'account' && (
          <div className="animate-in fade-in duration-300">
            <div className="form-section">
              <div className="form-section__title">Change Password</div>
              <div className="form-section__desc">Ensure your account is using a long, random password to stay secure.</div>
              
              <div className="field-group" style={{ maxWidth: '400px' }}>
                <label className="field-label">Current Password</label>
                <input 
                  type="password" 
                  className="field-input" 
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="field-group" style={{ maxWidth: '400px' }}>
                <label className="field-label">New Password</label>
                <input 
                  type="password" 
                  className="field-input" 
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
              </div>
              <div className="field-group" style={{ maxWidth: '400px' }}>
                <label className="field-label">Confirm New Password</label>
                <input 
                  type="password" 
                  className="field-input" 
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </div>
              
              <div style={{ marginTop: '16px' }}>
                <button 
                  onClick={handleSave} 
                  disabled={loading}
                  className="btn btn--primary"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>

            <div className="form-section" style={{ marginTop: '32px' }}>
              <div className="form-section__title">Two-Factor Authentication</div>
              <div className="form-section__desc">Add an extra layer of security to your account.</div>
              
              <div className="field-group" style={{ maxWidth: '400px' }}>
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

            <div className="danger-zone" style={{ marginTop: '32px' }}>
              <div className="danger-row">
                <div>
                  <div className="danger-row__title">Delete Account</div>
                  <div className="danger-row__desc">Once you delete your account, there is no going back. Please be certain.</div>
                </div>
                <button className="btn--danger-outline">Delete Account</button>
              </div>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="animate-in fade-in duration-300">
            <div className="form-section">
              <div className="form-section__title">Email Alerts</div>
              <div className="form-section__desc">Choose what updates you want to receive via email.</div>
              
              <div className="toggle-row">
                <div>
                  <div className="toggle-row__title">Important Account Alerts</div>
                  <div className="toggle-row__desc">Security notices, payment receipts, etc. (Required)</div>
                </div>
                <div className="toggle-switch on" style={{ opacity: 0.5, cursor: 'not-allowed' }}></div>
              </div>
              
              <div className="toggle-row" onClick={() => setNotifications({...notifications, jobMatches: !notifications.jobMatches})}>
                <div>
                  <div className="toggle-row__title">Job Matches</div>
                  <div className="toggle-row__desc">Daily or weekly summaries of new jobs matching your skills.</div>
                </div>
                <div className={`toggle-switch ${notifications.jobMatches ? 'on' : ''}`}></div>
              </div>
              
              <div className="toggle-row" onClick={() => setNotifications({...notifications, applicationUpdates: !notifications.applicationUpdates})}>
                <div>
                  <div className="toggle-row__title">Application Updates</div>
                  <div className="toggle-row__desc">Alerts when an employer reviews your application.</div>
                </div>
                <div className={`toggle-switch ${notifications.applicationUpdates ? 'on' : ''}`}></div>
              </div>
              
              <div className="toggle-row" onClick={() => setNotifications({...notifications, marketing: !notifications.marketing})}>
                <div>
                  <div className="toggle-row__title">News & Offers</div>
                  <div className="toggle-row__desc">Updates on new features, tips, and special offers.</div>
                </div>
                <div className={`toggle-switch ${notifications.marketing ? 'on' : ''}`}></div>
              </div>
              
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  onClick={handleSave} 
                  disabled={loading}
                  className="btn btn--primary"
                >
                  {loading ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PRIVACY TAB */}
        {activeTab === 'privacy' && (
          <div className="animate-in fade-in duration-300">
            <div className="form-section">
              <div className="form-section__title">Profile Visibility</div>
              <div className="form-section__desc">Who can see your full professional profile?</div>
              
              <div className="field-group" style={{ maxWidth: '400px' }}>
                <select 
                  className="field-input"
                  value={privacy.profileVisibility}
                  onChange={e => setPrivacy({...privacy, profileVisibility: e.target.value})}
                  style={{ appearance: 'auto' }}
                >
                  <option value="public">Public (Everyone)</option>
                  <option value="employers_only">Employers Only</option>
                  <option value="private">Private (Only you)</option>
                </select>
              </div>
              
              <div className="toggle-row" onClick={() => setPrivacy({...privacy, showInDiscover: !privacy.showInDiscover})} style={{ borderTop: '1px solid var(--c-700)', marginTop: '24px', paddingTop: '16px' }}>
                <div>
                  <div className="toggle-row__title">Show in Discover</div>
                  <div className="toggle-row__desc">Allow other professionals to find and connect with you.</div>
                </div>
                <div className={`toggle-switch ${privacy.showInDiscover ? 'on' : ''}`}></div>
              </div>
              
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  onClick={handleSave} 
                  disabled={loading}
                  className="btn btn--primary"
                >
                  {loading ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </div>
        )}

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
    </div>
  );
}
