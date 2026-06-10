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
        <h1 className="text-3xl font-black text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account preferences, notifications, and privacy.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 bg-gray-50/50 border-r border-gray-100 p-6 flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('account')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'account' ? 'bg-teal-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Key className="w-5 h-5" /> Account Security
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'notifications' ? 'bg-teal-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Bell className="w-5 h-5" /> Notifications
          </button>
          <button 
            onClick={() => setActiveTab('privacy')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'privacy' ? 'bg-teal-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Shield className="w-5 h-5" /> Privacy
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8">
          {successMsg && (
            <div className="mb-6 bg-green-50 text-green-700 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 border border-green-200">
              <CheckCircle2 className="w-5 h-5" /> {successMsg}
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-gray-400" /> Change Password
                </h2>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Current Password</label>
                    <input 
                      type="password" 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500" 
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">New Password</label>
                    <input 
                      type="password" 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500" 
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Confirm New Password</label>
                    <input 
                      type="password" 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500" 
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-100">
                <h2 className="text-xl font-bold text-red-600 mb-2 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" /> Danger Zone
                </h2>
                <p className="text-sm text-gray-500 mb-4 max-w-lg">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 px-6 py-3 rounded-xl font-bold text-sm transition-colors border border-red-200 shadow-sm">
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Email Notifications</h2>
              
              <div className="space-y-4">
                {[
                  { id: 'emailAlerts', label: 'Important Account Alerts', desc: 'Security notices, payment receipts, etc. (Required)' },
                  { id: 'jobMatches', label: 'Job Matches', desc: 'Daily or weekly summaries of new jobs matching your skills.' },
                  { id: 'applicationUpdates', label: 'Application Updates', desc: 'Alerts when an employer reviews your application.' },
                  { id: 'marketing', label: 'News & Offers', desc: 'Updates on new features, tips, and special offers.' }
                ].map(item => (
                  <div key={item.id} className="flex items-start justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                    <div>
                      <h3 className="font-bold text-gray-900">{item.label}</h3>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={(notifications as any)[item.id]} 
                        onChange={() => setNotifications({...notifications, [item.id]: !(notifications as any)[item.id]})}
                        disabled={item.id === 'emailAlerts'}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500 disabled:opacity-50"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Privacy Controls</h2>
              
              <div className="space-y-6 max-w-lg">
                <div>
                  <label className="block font-bold text-gray-900 mb-1">Profile Visibility</label>
                  <p className="text-sm text-gray-500 mb-3">Who can see your full professional profile?</p>
                  <select 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-teal-500"
                    value={privacy.profileVisibility}
                    onChange={e => setPrivacy({...privacy, profileVisibility: e.target.value})}
                  >
                    <option value="public">Public (Everyone)</option>
                    <option value="employers_only">Employers Only</option>
                    <option value="private">Private (Only you)</option>
                  </select>
                </div>

                <div className="flex items-start justify-between p-4 border border-gray-100 rounded-xl bg-gray-50">
                  <div>
                    <h3 className="font-bold text-gray-900">Show in Discover</h3>
                    <p className="text-sm text-gray-500">Allow other professionals to find and connect with you.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer mt-1">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={privacy.showInDiscover}
                      onChange={() => setPrivacy({...privacy, showInDiscover: !privacy.showInDiscover})}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={loading}
              className="bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-xl font-bold text-sm shadow-xl shadow-gray-900/20 transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
