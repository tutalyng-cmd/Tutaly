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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = e as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = e as any;
alert(err.response?.data?.message || 'Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-c900 flex items-center gap-3">
          <Building2 className="w-8 h-8 text-green" />
          Employer Settings
        </h1>
        <p className="text-c500 mt-1">Manage your company account security, notifications, and privacy preferences.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-c100 overflow-hidden flex flex-col md:flex-row min-h-layout-xl">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 bg-c100/50 border-r border-c100 p-6 flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('account')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'account' ? 'bg-green text-white shadow-md' : 'text-c600 hover:bg-c100'}`}
          >
            <Key className="w-5 h-5" /> Account Security
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'notifications' ? 'bg-green text-white shadow-md' : 'text-c600 hover:bg-c100'}`}
          >
            <Bell className="w-5 h-5" /> Notifications
          </button>
          <button 
            onClick={() => setActiveTab('privacy')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'privacy' ? 'bg-green text-white shadow-md' : 'text-c600 hover:bg-c100'}`}
          >
            <Shield className="w-5 h-5" /> Privacy
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8">
          {successMsg && (
            <div className="mb-6 bg-green text-green px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 border border-green">
              <CheckCircle2 className="w-5 h-5" /> {successMsg}
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div>
                <h2 className="text-xl font-bold text-c900 mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-c400" /> Change Password
                </h2>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-bold text-c700 mb-1">Current Password</label>
                    <input 
                      type="password" 
                      className="w-full bg-c100 border border-c200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green" 
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-c700 mb-1">New Password</label>
                    <input 
                      type="password" 
                      className="w-full bg-c100 border border-c200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green" 
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-c700 mb-1">Confirm New Password</label>
                    <input 
                      type="password" 
                      className="w-full bg-c100 border border-c200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green" 
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-c100">
                <h2 className="text-xl font-bold text-red mb-2 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" /> Danger Zone
                </h2>
                <p className="text-sm text-c500 mb-4 max-w-lg">
                  Once you delete your company account, all active jobs and data will be removed.
                </p>
                <button className="bg-red text-red hover:bg-red hover:text-red px-6 py-3 rounded-xl font-bold text-sm transition-colors border border-red shadow-sm">
                  Delete Company Account
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-c900 mb-6">Email Notifications</h2>
              
              <div className="space-y-4">
                {[
                  { id: 'emailAlerts', label: 'Important Account Alerts', desc: 'Security notices, billing receipts, etc. (Required)' },
                  { id: 'applicantActivity', label: 'Applicant Activity', desc: 'Alerts when a new candidate applies to your jobs.' },
                  { id: 'adCampaignUpdates', label: 'Ad Campaign Updates', desc: 'Notifications about your featured/urgent ad approvals.' },
                  { id: 'marketing', label: 'News & Offers', desc: 'Updates on platform features and hiring tips.' }
                ].map(item => (
                  <div key={item.id} className="flex items-start justify-between p-4 border border-c100 rounded-xl hover:bg-c100 transition-colors">
                    <div>
                      <h3 className="font-bold text-c900">{item.label}</h3>
                      <p className="text-sm text-c500">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={(notifications as any)[item.id]} 
                        onChange={() => setNotifications({...notifications, [item.id]: !(notifications as any)[item.id]})}
                        disabled={item.id === 'emailAlerts'}
                      />
                      <div className="w-11 h-6 bg-c200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0 after:left-0 after:bg-white after:border-c300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green disabled:opacity-50"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-c900 mb-6">Privacy Controls</h2>
              
              <div className="space-y-6 max-w-lg">
                <div>
                  <label className="block font-bold text-c900 mb-1">Company Visibility</label>
                  <p className="text-sm text-c500 mb-3">Who can view your company profile?</p>
                  <select 
                    className="w-full bg-c100 border border-c200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-green"
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

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-c100 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={loading}
              className="bg-c900 hover:bg-black text-white px-8 py-3 rounded-xl font-bold text-sm shadow-xl shadow-gray-900/20 transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
