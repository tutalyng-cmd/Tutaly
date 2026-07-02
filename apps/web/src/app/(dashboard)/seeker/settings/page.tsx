'use client';

import React, { useState } from 'react';
import { Shield, Bell, Lock, Key, Trash2, CheckCircle2 } from 'lucide-react';
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
          alert("Passwords do not match");
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
      alert(err.response?.data?.message || 'Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overview-grid" style={{ gridTemplateColumns: '260px 1fr' }}>
      
      {/* Settings Navigation Sidebar */}
      <div className="dcard" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button 
            onClick={() => setActiveTab('account')}
            className={`dash-nav-item ${activeTab === 'account' ? 'active' : ''}`}
            style={{ width: '100%', justifyContent: 'flex-start', border: 'none', background: activeTab === 'account' ? 'rgba(27,79,158,0.16)' : 'transparent', cursor: 'pointer' }}
          >
            <Key className="w-5 h-5" /> Account Security
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`dash-nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
            style={{ width: '100%', justifyContent: 'flex-start', border: 'none', background: activeTab === 'notifications' ? 'rgba(27,79,158,0.16)' : 'transparent', cursor: 'pointer' }}
          >
            <Bell className="w-5 h-5" /> Notifications
          </button>
          <button 
            onClick={() => setActiveTab('privacy')}
            className={`dash-nav-item ${activeTab === 'privacy' ? 'active' : ''}`}
            style={{ width: '100%', justifyContent: 'flex-start', border: 'none', background: activeTab === 'privacy' ? 'rgba(27,79,158,0.16)' : 'transparent', cursor: 'pointer' }}
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
            background: 'rgba(29,122,58,0.12)',
            color: '#2DB85A',
            border: '1px solid rgba(29,122,58,0.35)'
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
    </div>
  );
}
