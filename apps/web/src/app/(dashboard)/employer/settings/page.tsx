'use client';

import React, { useState } from 'react';
import { Shield, Bell, Lock, Key, Trash2, CheckCircle2, Building2 } from 'lucide-react';
import { apiAuth } from '@/lib/api';

export default function EmployerSettingsPage() {
  const [activeTab, setActiveTab] = useState<'account' | 'notifications' | 'privacy'>('account');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    applicantActivity: true,
    adCampaignUpdates: true,
    marketing: false,
  });

  const [privacy, setPrivacy] = useState({
    companyVisibility: 'public',
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
    <div className="max-w-4xl">
      <div className="dcard mb-6">
        <div className="dcard__header">
          <div>
            <div className="dcard__title flex items-center gap-2"><Building2 className="w-5 h-5 text-green" /> Employer Settings</div>
            <div className="dcard__sub">Manage your company account security, notifications, and privacy preferences.</div>
          </div>
        </div>
      </div>

      <div className="dcard p-0 flex flex-col md:flex-row overflow-hidden border-c700">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-c700 p-6 flex flex-col gap-2" style={{ backgroundColor: 'var(--c-800)' }}>
          <button 
            onClick={() => setActiveTab('account')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'account' ? 'bg-c700 text-c100' : 'text-c400 hover:bg-c700 hover:text-c200'}`}
          >
            <Key className="w-5 h-5" /> Account Security
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'notifications' ? 'bg-c700 text-c100' : 'text-c400 hover:bg-c700 hover:text-c200'}`}
          >
            <Bell className="w-5 h-5" /> Notifications
          </button>
          <button 
            onClick={() => setActiveTab('privacy')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'privacy' ? 'bg-c700 text-c100' : 'text-c400 hover:bg-c700 hover:text-c200'}`}
          >
            <Shield className="w-5 h-5" /> Privacy
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8">
          {successMsg && (
            <div className="mb-6 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2" style={{ backgroundColor: 'var(--green-10)', color: 'var(--green-light)', border: '1px solid var(--green-20)' }}>
              <CheckCircle2 className="w-5 h-5" /> {successMsg}
            </div>
          )}

          {activeTab === 'account' && (
            <div className="animate-in fade-in duration-300">
              <div className="form-section" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                <div className="form-section__title flex items-center gap-2"><Lock className="w-4 h-4 text-c400" /> Change Password</div>
                
                <div className="form-field">
                  <label className="form-label">Current Password</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">New Password</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Confirm New Password</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-section mt-8 pt-8" style={{ borderTop: '1px solid var(--c-700)' }}>
                <div className="form-section__title flex items-center gap-2" style={{ color: 'var(--red)' }}><Trash2 className="w-4 h-4" /> Danger Zone</div>
                <div className="form-section__desc">Once you delete your company account, all active jobs and data will be removed.</div>
                
                <button className="btn btn--outline mt-4" style={{ color: 'var(--red)', borderColor: 'var(--red)' }}>
                  Delete Company Account
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="animate-in fade-in duration-300">
              <div className="form-section" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                <div className="form-section__title">Email Notifications</div>
                
                <div className="space-y-4 mt-6">
                  {[
                    { id: 'emailAlerts', label: 'Important Account Alerts', desc: 'Security notices, billing receipts, etc. (Required)' },
                    { id: 'applicantActivity', label: 'Applicant Activity', desc: 'Alerts when a new candidate applies to your jobs.' },
                    { id: 'adCampaignUpdates', label: 'Ad Campaign Updates', desc: 'Notifications about your featured/urgent ad approvals.' },
                    { id: 'marketing', label: 'News & Offers', desc: 'Updates on platform features and hiring tips.' }
                  ].map(item => (
                    <label key={item.id} className={`flex items-start p-4 rounded-xl border cursor-pointer transition-all ${(notifications as any)[item.id] ? "border-c500" : "border-c700"}`} style={{ backgroundColor: 'var(--c-800)' }}>
                      <div className="flex-1">
                        <h3 className="font-bold text-c100 text-sm">{item.label}</h3>
                        <p className="text-sm text-c400 mt-1">{item.desc}</p>
                      </div>
                      <div className="flex items-center h-6 pt-1 ml-4">
                        <div 
                          className={`filter-checkbox ${(notifications as any)[item.id] ? "checked" : ""}`} 
                          style={(notifications as any)[item.id] ? { borderColor: 'var(--green)', backgroundColor: 'var(--green)' } : { borderColor: 'var(--c-500)' }} 
                          onClick={(e) => { 
                            e.preventDefault(); 
                            if (item.id !== 'emailAlerts') {
                              setNotifications({...notifications, [item.id]: !(notifications as any)[item.id]});
                            }
                          }}
                        ></div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="animate-in fade-in duration-300">
              <div className="form-section" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                <div className="form-section__title">Privacy Controls</div>
                <div className="form-section__desc">Manage who can view your company profile.</div>
                
                <div className="form-field mt-6">
                  <label className="form-label">Company Visibility</label>
                  <select 
                    className="form-input"
                    value={privacy.companyVisibility}
                    onChange={e => setPrivacy({...privacy, companyVisibility: e.target.value})}
                  >
                    <option value="public">Public (Everyone)</option>
                    <option value="private">Hidden (Only visible to your applicants)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-c700 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={loading}
              className="btn btn--primary"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
